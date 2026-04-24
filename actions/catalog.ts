"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { nanoid } from "@/lib/utils";

export interface CreateCatalogInput {
  title: string;
  description?: string;
  waNumber?: string;
  contentIds: string[];
}

export async function createCatalogPage(input: CreateCatalogInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const slug = `${slugify(input.title)}-${nanoid(6)}`;

  const page = await prisma.catalogPage.create({
    data: {
      userId: session.user.id,
      slug,
      title: input.title,
      description: input.description ?? null,
      waNumber: input.waNumber ?? null,
      contentIds: input.contentIds,
    },
  });

  revalidatePath("/catalog");
  return page;
}

export async function deleteCatalogPage(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.catalogPage.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/catalog");
}

export async function getUserCatalogPages() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.catalogPage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function incrementCatalogViews(slug: string) {
  await prisma.catalogPage.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}
