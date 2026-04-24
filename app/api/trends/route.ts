import { NextRequest } from "next/server";
import { getSimulatedTrendData } from "@/services/trend-data";
import { analyzeTrends } from "@/services/trend-analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

// Cache for 1 hour to avoid hammering the AI on every refresh
export const revalidate = 3600;

export async function GET(_req: NextRequest) {
  try {
    const trendData = getSimulatedTrendData();
    const analysis = await analyzeTrends(trendData);

    return Response.json({ trendData, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
