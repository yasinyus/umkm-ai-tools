"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateMagicReplies, type ReplyOption } from "@/services/reply-generator";

export async function getMessages() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.messageHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function addMessage(input: {
  senderName: string;
  senderPhone?: string;
  message: string;
  platform?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.messageHistory.create({
    data: {
      userId: session.user.id,
      senderName: input.senderName,
      senderPhone: input.senderPhone,
      message: input.message,
      platform: input.platform ?? "whatsapp",
    },
  });
  revalidatePath("/reply-assistant");
}

export async function deleteMessage(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.messageHistory.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/reply-assistant");
}

export async function generateRepliesForMessage(
  messageId: string
): Promise<{ replies: ReplyOption[] }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [msg, products] = await Promise.all([
    prisma.messageHistory.findFirst({
      where: { id: messageId, userId: session.user.id },
    }),
    prisma.product.findMany({
      where: { userId: session.user.id },
      select: { name: true, sellingPrice: true },
    }),
  ]);

  if (!msg) throw new Error("Message not found");

  const productContext =
    products.length > 0
      ? products
          .map((p) => `- ${p.name}: Rp ${p.sellingPrice.toLocaleString("id-ID")}`)
          .join("\n")
      : "Belum ada data produk — berikan jawaban umum sesuai konteks pesan.";

  const replies = await generateMagicReplies(msg.message, productContext, msg.senderName);

  await prisma.messageHistory.update({
    where: { id: messageId },
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      replies: replies as any,
      status: "READ",
    },
  });

  revalidatePath("/reply-assistant");
  return { replies };
}
