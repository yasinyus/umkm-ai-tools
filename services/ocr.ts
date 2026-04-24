import { getGroqClient } from "@/lib/groq";

export interface ExtractedItem {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface OCRResult {
  items: ExtractedItem[];
  rawText: string;
  confidence: "high" | "medium" | "low";
}

export async function scanReceiptOCR(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          } as never,
          {
            type: "text",
            text: `Kamu adalah sistem OCR khusus nota belanja bahan baku UMKM Indonesia.
Ekstrak semua item dari nota/kuitansi ini. Output HANYA JSON valid:
{
  "items": [
    {
      "name": "nama bahan baku",
      "quantity": angka,
      "unit": "satuan (kg/gram/liter/pcs/bks/dll)",
      "pricePerUnit": harga per satuan dalam rupiah (angka tanpa titik/koma),
      "totalPrice": total harga item dalam rupiah (angka tanpa titik/koma)
    }
  ],
  "rawText": "teks lengkap yang terbaca dari nota",
  "confidence": "high atau medium atau low"
}
Jika bukan nota atau tidak terbaca dengan baik, kembalikan items: [].`,
          },
        ] as never,
      },
    ],
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(content);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      rawText: parsed.rawText ?? "",
      confidence: parsed.confidence ?? "medium",
    };
  } catch {
    return { items: [], rawText: content, confidence: "low" };
  }
}
