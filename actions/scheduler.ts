"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ScheduleContentInput {
  contentId: string;
  scheduledAt: Date;
}

export async function scheduleContent({ contentId, scheduledAt }: ScheduleContentInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.aiContent.updateMany({
    where: { id: contentId, userId: session.user.id },
    data: { status: "SCHEDULED", scheduledAt },
  });

  revalidatePath("/scheduler");
  revalidatePath("/history");
}

export async function unscheduleContent(contentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.aiContent.updateMany({
    where: { id: contentId, userId: session.user.id },
    data: { status: "DRAFT", scheduledAt: null },
  });

  revalidatePath("/scheduler");
  revalidatePath("/history");
}

export async function markAsPosted(contentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.aiContent.updateMany({
    where: { id: contentId, userId: session.user.id },
    data: { status: "POSTED", postedAt: new Date() },
  });

  revalidatePath("/scheduler");
}

export async function getScheduledContent() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.aiContent.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["SCHEDULED", "POSTED"] },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getDraftContent() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.aiContent.findMany({
    where: { userId: session.user.id, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}
