"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface InvoiceItemInput {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

async function recalculateCOGS(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { productIngredients: { include: { ingredient: true } } },
  });
  if (!product) return;

  const cogs = product.productIngredients.reduce(
    (sum, pi) => sum + pi.ingredient.costPerUnit * pi.quantity,
    0
  );
  const marginPct =
    product.sellingPrice > 0
      ? ((product.sellingPrice - cogs) / product.sellingPrice) * 100
      : 0;

  await prisma.product.update({
    where: { id: productId },
    data: { cogs, marginPct },
  });
}

export async function getIngredients() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.ingredient.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });
}

export async function getProducts() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.product.findMany({
    where: { userId: session.user.id },
    include: { productIngredients: { include: { ingredient: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createIngredient(input: {
  name: string;
  unit: string;
  costPerUnit: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.ingredient.create({
    data: { ...input, userId: session.user.id },
  });
  revalidatePath("/hpp");
}

export async function deleteIngredient(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.ingredient.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/hpp");
}

export async function createProduct(input: {
  name: string;
  sellingPrice: number;
  ingredients: { ingredientId: string; quantity: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const product = await prisma.product.create({
    data: {
      name: input.name,
      sellingPrice: input.sellingPrice,
      userId: session.user.id,
      productIngredients: {
        create: input.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
        })),
      },
    },
  });

  await recalculateCOGS(product.id);
  revalidatePath("/hpp");
  revalidatePath("/competitors");
  revalidatePath("/reply-assistant");
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.product.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/hpp");
}

export async function processInvoiceItems(
  items: InvoiceItemInput[],
  rawText: string
): Promise<{ updated: number; created: number; productsUpdated: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  let updated = 0;
  let created = 0;
  const affectedIngredientIds: string[] = [];

  const invoice = await prisma.invoice.create({
    data: { userId, rawText, status: "PROCESSED" },
  });

  for (const item of items) {
    const existing = await prisma.ingredient.findFirst({
      where: { userId, name: { equals: item.name, mode: "insensitive" } },
    });

    let ingredientId: string;

    if (existing) {
      await prisma.ingredient.update({
        where: { id: existing.id },
        data: { costPerUnit: item.pricePerUnit, unit: item.unit },
      });
      ingredientId = existing.id;
      updated++;
    } else {
      const newIng = await prisma.ingredient.create({
        data: {
          userId,
          name: item.name,
          unit: item.unit,
          costPerUnit: item.pricePerUnit,
        },
      });
      ingredientId = newIng.id;
      created++;
    }

    affectedIngredientIds.push(ingredientId);

    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.totalPrice,
        ingredientId,
      },
    });
  }

  const affected = await prisma.productIngredient.findMany({
    where: { ingredientId: { in: affectedIngredientIds } },
    select: { productId: true },
  });

  const uniqueProductIds = [...new Set(affected.map((p) => p.productId))];
  for (const productId of uniqueProductIds) {
    await recalculateCOGS(productId);
  }

  revalidatePath("/hpp");
  return { updated, created, productsUpdated: uniqueProductIds.length };
}
