"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveCaption({
  text,
  platform,
  productName,
  tone,
}: {
  text: string;
  platform: string;
  productName: string;
  tone: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.aiContent.create({
    data: {
      userId: session.user.id,
      type: "CAPTION",
      title: productName,
      text,
      platform,
      metadata: { tone },
    },
  });

  revalidatePath("/history");
}

export async function saveImage({
  imageUrl,
  prompt,
}: {
  imageUrl: string;
  prompt: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.aiContent.create({
    data: {
      userId: session.user.id,
      type: "IMAGE",
      title: prompt,
      imageUrl,
      metadata: { prompt },
    },
  });

  revalidatePath("/history");
}

export async function deleteContent(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.aiContent.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/history");
}
