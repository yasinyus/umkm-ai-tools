import { prisma } from "./prisma";

export async function logActivity(
  userId: string,
  action: string,
  metadata?: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { userId, action, metadata },
    });
  } catch {
    // Non-blocking — never fail the main operation over a log entry
  }
}
