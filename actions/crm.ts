"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CustomerSegment } from "@prisma/client";

export type CustomerWithStats = {
  id: string;
  name: string;
  whatsappNumber: string;
  segment: CustomerSegment;
  totalSpend: number;
  aiContext: string | null;
  isBotActive: boolean;
  lastContactedAt: Date | null;
  createdAt: Date;
  _count: { chatHistory: number };
};

export async function getCustomers(filter?: {
  segment?: CustomerSegment;
  inactiveDays?: number;
  search?: string;
}): Promise<CustomerWithStats[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  const cutoff = filter?.inactiveDays
    ? (() => { const d = new Date(); d.setDate(d.getDate() - filter.inactiveDays!); return d; })()
    : undefined;

  return prisma.customer.findMany({
    where: {
      userId,
      ...(filter?.segment ? { segment: filter.segment } : {}),
      ...(cutoff ? { lastContactedAt: { lt: cutoff } } : {}),
      ...(filter?.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: "insensitive" } },
              { whatsappNumber: { contains: filter.search } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { chatHistory: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCustomerWithHistory(customerId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.customer.findFirst({
    where: { id: customerId, userId: session.user.id },
    include: {
      chatHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function toggleBotForCustomer(customerId: string, isBotActive: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.customer.updateMany({
    where: { id: customerId, userId: session.user.id },
    data: { isBotActive },
  });

  revalidatePath("/crm");
  revalidatePath(`/crm/${customerId}`);
}

export async function updateCustomerSegment(customerId: string, segment: CustomerSegment) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.customer.updateMany({
    where: { id: customerId, userId: session.user.id },
    data: { segment },
  });

  revalidatePath("/crm");
}

export async function updateCustomerSpend(customerId: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, userId: session.user.id },
    select: { totalSpend: true },
  });

  if (!customer) throw new Error("Customer not found");

  const newTotal = customer.totalSpend + amount;
  const newSegment: CustomerSegment =
    newTotal >= 500_000 ? "LOYAL" : newTotal >= 100_000 ? "NEW" : "NEW";

  await prisma.customer.update({
    where: { id: customerId },
    data: { totalSpend: newTotal, segment: newSegment },
  });

  revalidatePath("/crm");
}

export async function deleteCustomer(customerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.customer.deleteMany({
    where: { id: customerId, userId: session.user.id },
  });

  revalidatePath("/crm");
}

export async function getCrmStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [total, loyal, atRisk, inactive, newCustomers] = await Promise.all([
    prisma.customer.count({ where: { userId } }),
    prisma.customer.count({ where: { userId, segment: "LOYAL" } }),
    prisma.customer.count({ where: { userId, segment: "AT_RISK" } }),
    prisma.customer.count({
      where: { userId, lastContactedAt: { lt: sevenDaysAgo } },
    }),
    prisma.customer.count({ where: { userId, segment: "NEW" } }),
  ]);

  return { total, loyal, atRisk, inactive, newCustomers };
}
