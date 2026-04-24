import { getGroqClient } from "@/lib/groq";
import type { MarketplaceTrendData } from "./trend-data";

export interface TrendInsight {
  category: string;
  insight: string;
  suggestion: string;
  urgency: "high" | "medium" | "low";
  emoji: string;
}

export interface TrendAnalysisResult {
  insights: TrendInsight[];
  summary: string;
  generatedAt: string;
}

const SYSTEM_PROMPT = `Kamu adalah analis marketplace Indonesia yang ahli di Tokopedia dan Shopee.
Tugas kamu: analisis data tren produk dan berikan rekomendasi actionable untuk UMKM agar bisa membuat konten sosmed yang relevan.
Selalu jawab dalam Bahasa Indonesia yang natural dan praktis.
Berikan saran caption, tema visual, atau angle marketing yang konkret.`;

export async function analyzeTrends(
  data: MarketplaceTrendData
): Promise<TrendAnalysisResult> {
  const groq = getGroqClient();

  const topCategories = data.categories
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 3);

  const userPrompt = `
Data tren marketplace Indonesia (${data.period}):

${topCategories
  .map(
    (c) => `
Kategori: ${c.category}
- Pertumbuhan: +${c.growth}%
- Volume pencarian: ${c.volume}/100
- Keyword trending: ${c.topKeywords.slice(0, 3).join(", ")}
- Produk terlaris: ${c.topProducts.map((p) => `${p.name} (+${p.growth}%)`).join(", ")}
`
  )
  .join("\n")}

Berikan TEPAT 3 actionable insights dalam format JSON array berikut:
[
  {
    "category": "nama kategori",
    "insight": "Fakta tren singkat (1 kalimat)",
    "suggestion": "Saran konkret untuk caption/konten sosmed (1-2 kalimat, spesifik)",
    "urgency": "high|medium|low",
    "emoji": "1 emoji yang relevan"
  }
]

Hanya balas dengan JSON array, tanpa teks lain.`;

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 800,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "[]";

  let insights: TrendInsight[] = [];
  try {
    // Model might wrap the array in an object
    const parsed = JSON.parse(raw);
    insights = Array.isArray(parsed) ? parsed : (parsed.insights ?? Object.values(parsed)[0] ?? []);
  } catch {
    insights = [];
  }

  // Fallback if parsing fails
  if (!Array.isArray(insights) || insights.length === 0) {
    insights = topCategories.map((c) => ({
      category: c.category,
      insight: `${c.category} tumbuh ${c.growth}% minggu ini.`,
      suggestion: `Buat konten tentang ${c.topProducts[0]?.name ?? c.topKeywords[0]} untuk menarik buyer.`,
      urgency: c.growth > 45 ? "high" : c.growth > 30 ? "medium" : "low",
      emoji: "📈",
    }));
  }

  return {
    insights: insights.slice(0, 3),
    summary: `${data.categories.length} kategori dianalisis · Tren terkuat: ${topCategories[0].category} (+${topCategories[0].growth}%)`,
    generatedAt: new Date().toISOString(),
  };
}
