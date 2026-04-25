"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type StoreSettingsInput = {
  storeName?: string;
  description?: string;
  menu?: string;
  prices?: string;
  openHours?: string;
  address?: string;
  autoReply?: boolean;
  waApiKey?: string;
  waToken?: string;
};

export async function getStoreSettings() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.storeSettings.findUnique({
    where: { userId: session.user.id },
  });
}

export async function upsertStoreSettings(input: StoreSettingsInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.storeSettings.upsert({
    where: { userId: session.user.id },
    update: input,
    create: { userId: session.user.id, ...input },
  });

  revalidatePath("/whatsapp");
}

export async function toggleAutoReply(autoReply: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.storeSettings.upsert({
    where: { userId: session.user.id },
    update: { autoReply },
    create: { userId: session.user.id, autoReply },
  });

  revalidatePath("/whatsapp");
}
