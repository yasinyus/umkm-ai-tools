import { getGroqClient } from "@/lib/groq";

export interface CompetitorEntry {
  name: string;
  platform: string;
  price: number;
  rating: number;
  sold: number;
}

export interface CompetitorInsight {
  recommendation: string;
  strategy: string;
}

const PLATFORMS = ["Tokopedia", "Shopee", "GrabFood", "GoFood", "Bukalapak"];
const SELLER_PREFIXES = ["Dapur", "Warung", "Toko", "Kedai", "RM", "Resto"];
const SELLER_NAMES = [
  "Barokah", "Mandiri", "Jaya", "Sejahtera", "Makmur",
  "Berkah", "Maju", "Lestari", "Harapan", "Nusantara",
];

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateMockCompetitors(
  productName: string,
  ourPrice: number
): CompetitorEntry[] {
  const seed = hashStr(productName);
  const rand = seededRand(seed);

  return Array.from({ length: 5 }, (_, i) => {
    const factor = 0.72 + rand() * 0.60;
    const price = Math.round((ourPrice * factor) / 500) * 500 || 1000;
    const platform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
    const prefix = SELLER_PREFIXES[Math.floor(rand() * SELLER_PREFIXES.length)];
    const suffix = SELLER_NAMES[(seed + i) % SELLER_NAMES.length];
    const rating = parseFloat((3.4 + rand() * 1.5).toFixed(1));
    const sold = Math.floor(rand() * 600) + 15;
    return { name: `${prefix} ${suffix}`, platform, price, rating, sold };
  });
}

export async function analyzeCompetitorPrices(
  productName: string,
  ourPrice: number,
  competitors: CompetitorEntry[]
): Promise<CompetitorInsight> {
  const groq = getGroqClient();
  const avgPrice = Math.round(
    competitors.reduce((s, c) => s + c.price, 0) / competitors.length
  );
  const minPrice = Math.min(...competitors.map((c) => c.price));
  const maxPrice = Math.max(...competitors.map((c) => c.price));

  const ctx = [
    `Produk: ${productName}`,
    `Harga kami: Rp ${ourPrice.toLocaleString("id-ID")}`,
    `Rata-rata kompetitor: Rp ${avgPrice.toLocaleString("id-ID")}`,
    `Rentang harga: Rp ${minPrice.toLocaleString("id-ID")} – Rp ${maxPrice.toLocaleString("id-ID")}`,
    `Kompetitor: ${competitors
      .map((c) => `${c.name} (${c.platform}) Rp ${c.price.toLocaleString("id-ID")} ⭐${c.rating}`)
      .join(", ")}`,
  ].join("\n");

  const res = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Kamu konsultan harga UMKM Indonesia. Berikan analisis singkat & saran tindakan konkret dalam Bahasa Indonesia.",
      },
      {
        role: "user",
        content: `${ctx}\n\nJawab JSON:\n{"recommendation":"analisis posisi harga 1-2 kalimat","strategy":"saran konkret 1-2 kalimat"}`,
      },
    ],
    max_tokens: 400,
  });

  try {
    const p = JSON.parse(res.choices[0]?.message?.content ?? "{}");
    return {
      recommendation: p.recommendation ?? "Harga Anda berada di kisaran pasar.",
      strategy: p.strategy ?? "Pertimbangkan diferensiasi nilai untuk menonjol dari kompetitor.",
    };
  } catch {
    return {
      recommendation: "Harga Anda kompetitif.",
      strategy: "Fokus pada kualitas dan pelayanan.",
    };
  }
}
