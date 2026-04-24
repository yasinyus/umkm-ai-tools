"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateDisplayName(
  name: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) return { error: "Nama minimal 2 karakter" };
  if (trimmed.length > 50) return { error: "Nama maksimal 50 karakter" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
