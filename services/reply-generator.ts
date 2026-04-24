import { getGroqClient } from "@/lib/groq";

export interface ReplyOption {
  tone: "ramah" | "informatif" | "urgency";
  label: string;
  text: string;
}

export async function generateMagicReplies(
  incomingMessage: string,
  productContext: string,
  senderName?: string
): Promise<ReplyOption[]> {
  const groq = getGroqClient();

  const res = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Kamu asisten penjualan UMKM Indonesia yang handal dalam closing.
Daftar produk yang tersedia:
${productContext}

Buat TEPAT 3 balasan berbeda untuk pesan calon pembeli. Output JSON:
{
  "replies": [
    {
      "tone": "ramah",
      "label": "Ramah & Hangat",
      "text": "balasan hangat, pakai Kak/Bund, sertakan emoji relevan, ajak bertanya lebih lanjut"
    },
    {
      "tone": "informatif",
      "label": "To-the-Point",
      "text": "balasan singkat padat informatif, langsung ke detail produk/harga/ketersediaan"
    },
    {
      "tone": "urgency",
      "label": "Hard Sell",
      "text": "balasan dengan urgensi/kelangkaan untuk mendorong keputusan beli segera (misal: sisa 2 pcs, promo hari ini)"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Pesan dari ${senderName ?? "calon pembeli"}: "${incomingMessage}"`,
      },
    ],
    max_tokens: 1024,
    temperature: 0.8,
  });

  try {
    const p = JSON.parse(res.choices[0]?.message?.content ?? "{}");
    return Array.isArray(p.replies) ? p.replies : [];
  } catch {
    return [];
  }
}
