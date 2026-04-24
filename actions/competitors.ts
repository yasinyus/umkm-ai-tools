"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  generateMockCompetitors,
  analyzeCompetitorPrices,
  type CompetitorEntry,
} from "@/services/competitor-mock";

export interface CompetitorAnalysisResult {
  competitors: CompetitorEntry[];
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  pricePosition: "expensive" | "competitive" | "cheap";
  recommendation: string;
  strategy: string;
}

export async function analyzeCompetitor(
  productName: string,
  ourPrice: number
): Promise<CompetitorAnalysisResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const competitors = generateMockCompetitors(productName, ourPrice);
  const prices = competitors.map((c) => c.price);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const diffPct = ((ourPrice - avgPrice) / avgPrice) * 100;
  const pricePosition: "expensive" | "competitive" | "cheap" =
    diffPct > 10 ? "expensive" : diffPct < -10 ? "cheap" : "competitive";

  const { recommendation, strategy } = await analyzeCompetitorPrices(
    productName,
    ourPrice,
    competitors
  );

  await prisma.competitorPrice.upsert({
    where: { userId_productName: { userId: session.user.id, productName } },
    update: { ourPrice, competitors, analysis: `${recommendation} ${strategy}` },
    create: {
      userId: session.user.id,
      productName,
      ourPrice,
      competitors,
      analysis: `${recommendation} ${strategy}`,
    },
  });

  revalidatePath("/competitors");
  return { competitors, avgPrice, minPrice, maxPrice, pricePosition, recommendation, strategy };
}

export async function getUserProducts() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.product.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, sellingPrice: true },
    orderBy: { name: "asc" },
  });
}
