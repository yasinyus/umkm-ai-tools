"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "yasinyusuf89@gmail.com";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }
  return session!;
}

export async function getAdminStats() {
  await requireAdmin();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    trialUsers,
    inactiveUsers,
    totalRevenue,
    newUsersThisWeek,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.user.count({ where: { subscriptionStatus: "TRIAL" } }),
    prisma.user.count({ where: { subscriptionStatus: "INACTIVE" } }),
    prisma.transaction.aggregate({ _sum: { amount: true } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true, email: true, image: true } } },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    trialUsers,
    inactiveUsers,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    newUsersThisWeek,
    recentActivity,
  };
}

export async function getAllUsers(page = 0, pageSize = 20) {
  await requireAdmin();

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: page * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        subscriptionStatus: true,
        subscriptionEndAt: true,
        createdAt: true,
        adminNote: true,
        _count: {
          select: {
            contents: true,
            customers: true,
            activityLogs: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  return { users, total, page, pageSize };
}

export async function updateAdminNote(userId: string, note: string) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { adminNote: note },
  });

  revalidatePath("/admin/monitoring");
}

export async function getRevenueByMonth() {
  await requireAdmin();

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "asc" },
    select: { amount: true, createdAt: true },
  });

  const byMonth: Record<string, number> = {};
  for (const t of transactions) {
    const key = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] ?? 0) + t.amount;
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
}
