/**
 * GET /api/cron/process-scheduled
 *
 * Marks all SCHEDULED content whose scheduledAt <= now as POSTED.
 * Call this via:
 *  - Vercel Cron (vercel.json: { "crons": [{ "path": "/api/cron/process-scheduled", "schedule": "0 * * * *" }] })
 *  - External cron: cron-job.org (free), targeting your deployment URL
 *  - Manually during development: GET http://localhost:3000/api/cron/process-scheduled
 *
 * Protect with CRON_SECRET in production:
 *   Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Simple bearer token guard for production
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  const result = await prisma.aiContent.updateMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    data: {
      status: "POSTED",
      postedAt: now,
    },
  });

  return Response.json({
    processed: result.count,
    processedAt: now.toISOString(),
  });
}
