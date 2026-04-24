// Simulated Indonesian marketplace trend data (Tokopedia / Shopee style)
// In production, replace with actual marketplace API calls.

export interface TrendProduct {
  name: string;
  growth: number;
  priceRange: string;
  platform: "tokopedia" | "shopee";
}

export interface TrendCategory {
  category: string;
  growth: number;   // YoY growth percentage
  volume: number;   // relative search volume 0–100
  topKeywords: string[];
  topProducts: TrendProduct[];
}

export interface MarketplaceTrendData {
  fetchedAt: string;
  period: string;
  categories: TrendCategory[];
}

export function getSimulatedTrendData(): MarketplaceTrendData {
  // Seeded with current week to give stable-looking "live" data
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const jitter = (base: number, seed: number) =>
    Math.round(base + ((seed * week) % 8) - 4);

  return {
    fetchedAt: new Date().toISOString(),
    period: "7 hari terakhir",
    categories: [
      {
        category: "Makanan & Minuman",
        growth: jitter(52, 3),
        volume: jitter(88, 7),
        topKeywords: ["dimsum mentai", "boba keju", "dessert box", "takoyaki", "mochi ice cream"],
        topProducts: [
          { name: "Dimsum Mentai", growth: jitter(78, 1), priceRange: "Rp 15.000–35.000", platform: "tokopedia" },
          { name: "Boba Brown Sugar", growth: jitter(45, 2), priceRange: "Rp 10.000–25.000", platform: "shopee" },
          { name: "Dessert Box Oreo", growth: jitter(61, 5), priceRange: "Rp 45.000–85.000", platform: "shopee" },
        ],
      },
      {
        category: "Fashion Muslim",
        growth: jitter(38, 4),
        volume: jitter(75, 3),
        topKeywords: ["gamis syari", "kerudung pashmina", "abaya polos", "baju koko premium"],
        topProducts: [
          { name: "Gamis Syari Polos", growth: jitter(55, 9), priceRange: "Rp 150.000–350.000", platform: "shopee" },
          { name: "Kerudung Pashmina Ceruti", growth: jitter(42, 3), priceRange: "Rp 35.000–65.000", platform: "tokopedia" },
          { name: "Abaya Polos Crinkle", growth: jitter(48, 6), priceRange: "Rp 200.000–450.000", platform: "shopee" },
        ],
      },
      {
        category: "Skincare Lokal",
        growth: jitter(44, 6),
        volume: jitter(82, 5),
        topKeywords: ["serum vitamin c", "sunscreen spf50", "toner bha", "moisturizer gel", "lip serum"],
        topProducts: [
          { name: "Serum Vitamin C 20%", growth: jitter(67, 2), priceRange: "Rp 50.000–120.000", platform: "shopee" },
          { name: "Sunscreen SPF50+ PA++++", growth: jitter(59, 7), priceRange: "Rp 35.000–80.000", platform: "tokopedia" },
          { name: "Toner BHA Exfoliating", growth: jitter(51, 4), priceRange: "Rp 45.000–95.000", platform: "shopee" },
        ],
      },
      {
        category: "Dekorasi Rumah",
        growth: jitter(29, 8),
        volume: jitter(61, 2),
        topKeywords: ["pot tanaman aesthetic", "wall art minimalis", "lampu led kamar", "rak buku"],
        topProducts: [
          { name: "Pot Terracotta Aesthetic", growth: jitter(38, 5), priceRange: "Rp 25.000–75.000", platform: "tokopedia" },
          { name: "Wall Art Canvas", growth: jitter(31, 1), priceRange: "Rp 50.000–200.000", platform: "shopee" },
          { name: "Lampu LED String Fairy", growth: jitter(44, 9), priceRange: "Rp 20.000–55.000", platform: "shopee" },
        ],
      },
      {
        category: "Elektronik & Gadget",
        growth: jitter(22, 2),
        volume: jitter(70, 8),
        topKeywords: ["earbuds tws", "power bank 20000", "charger gan 65w", "stand hp aesthetic"],
        topProducts: [
          { name: "Earbuds TWS Bluetooth 5.3", growth: jitter(35, 6), priceRange: "Rp 80.000–200.000", platform: "shopee" },
          { name: "Power Bank 20000mAh", growth: jitter(28, 3), priceRange: "Rp 150.000–350.000", platform: "tokopedia" },
          { name: "Charger GaN 65W", growth: jitter(41, 7), priceRange: "Rp 120.000–280.000", platform: "shopee" },
        ],
      },
    ],
  };
}
