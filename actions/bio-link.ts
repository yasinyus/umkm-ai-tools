"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";

export type BioLinkInput = {
  slug: string;
  storeName: string;
  tagline?: string;
  description?: string;
  waNumber?: string;
  igHandle?: string;
  tiktokHandle?: string;
  fbHandle?: string;
  websiteUrl?: string;
  isPublic?: boolean;
  theme?: string;
};

export async function getBioLink() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.bioLink.findUnique({ where: { userId: session.user.id } });
}

export async function upsertBioLink(input: BioLinkInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Check slug uniqueness (not owned by this user)
  const existing = await prisma.bioLink.findUnique({
    where: { slug: input.slug },
    select: { userId: true },
  });

  if (existing && existing.userId !== session.user.id) {
    throw new Error("Slug sudah digunakan oleh pengguna lain. Pilih slug yang berbeda.");
  }

  await prisma.bioLink.upsert({
    where: { userId: session.user.id },
    update: input,
    create: { userId: session.user.id, ...input },
  });

  logActivity(session.user.id, "update_bio_link", input.slug).catch(console.error);
  revalidatePath("/bio-link");
  revalidatePath(`/p/${input.slug}`);
}

export async function incrementBioLinkViews(slug: string) {
  await prisma.bioLink.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });
}
