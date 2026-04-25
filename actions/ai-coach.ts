"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type CoachMessageOut = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export async function getCoachHistory(): Promise<CoachMessageOut[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const msgs = await prisma.coachMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return msgs.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    createdAt: m.createdAt,
  }));
}

export async function sendCoachMessage(userMessage: string): Promise<CoachMessageOut> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Fetch business context from DB
  const [products, invoices, customers, storeSettings, recentHistory] = await Promise.all([
    prisma.product.findMany({
      where: { userId },
      select: { name: true, sellingPrice: true, cogs: true, marginPct: true },
      take: 20,
    }),
    prisma.invoice.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.customer.findMany({
      where: { userId },
      select: { segment: true },
      take: 200,
    }),
    prisma.storeSettings.findUnique({ where: { userId } }),
    prisma.coachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  // Build business context
  const productCtx = products.length
    ? products.map((p) => `- ${p.name}: Jual Rp${p.sellingPrice.toLocaleString("id-ID")}, COGS Rp${p.cogs.toLocaleString("id-ID")}, Margin ${p.marginPct.toFixed(1)}%`).join("\n")
    : "Belum ada data produk.";

  const segmentCounts = {
    LOYAL: customers.filter((c) => c.segment === "LOYAL").length,
    NEW: customers.filter((c) => c.segment === "NEW").length,
    AT_RISK: customers.filter((c) => c.segment === "AT_RISK").length,
  };

  const businessCtx = `
=== DATA BISNIS SAAT INI ===
Nama Toko: ${storeSettings?.storeName ?? "Toko"}
Total Produk: ${products.length}
Data Produk & Margin:
${productCtx}

Segmentasi Pelanggan:
- Loyal: ${segmentCounts.LOYAL}
- Baru: ${segmentCounts.NEW}
- Berisiko Churn: ${segmentCounts.AT_RISK}
Total Pelanggan: ${customers.length}
`;

  const systemPrompt = `Kamu adalah AI Business Coach khusus untuk UMKM Indonesia. Kamu adalah konsultan bisnis berpengalaman yang bertugas membantu pemilik UMKM untuk:

1. Menganalisis data keuangan (HPP, margin, profitabilitas produk)
2. Memberikan strategi pemasaran dan penetapan harga
3. Mengidentifikasi peluang pertumbuhan bisnis
4. Memberikan saran manajemen pelanggan dan retensi
5. Merekomendasikan langkah operasional yang konkret dan actionable

${businessCtx}

INSTRUKSI:
- Gunakan data bisnis di atas sebagai dasar rekomendasi kamu
- Berikan saran yang spesifik, actionable, dan relevan untuk konteks UMKM Indonesia
- Gunakan bahasa Indonesia yang profesional tapi mudah dipahami
- Jika ada produk dengan margin rendah, highlight dan beri rekomendasi
- Jika pelanggan AT_RISK banyak, sarankan strategi retensi
- Fokus pada ROI dan dampak bisnis yang terukur
- Pertahankan konteks percakapan sebelumnya`;

  // Build chat history for OpenAI
  const historyMessages: OpenAI.Chat.ChatCompletionMessageParam[] = recentHistory
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: userMessage },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });

  const assistantContent =
    completion.choices[0]?.message?.content ??
    "Maaf, saya tidak dapat merespons saat ini. Silakan coba lagi.";

  // Save both messages to DB
  await prisma.coachMessage.createMany({
    data: [
      { userId, role: "user", content: userMessage },
      { userId, role: "assistant", content: assistantContent },
    ],
  });

  logActivity(userId, "ai_coach_chat", userMessage.slice(0, 100)).catch(console.error);
  revalidatePath("/ai-coach");

  // Return the assistant message
  const saved = await prisma.coachMessage.findFirst({
    where: { userId, role: "assistant" },
    orderBy: { createdAt: "desc" },
  });

  return {
    id: saved!.id,
    role: "assistant",
    content: assistantContent,
    createdAt: saved!.createdAt,
  };
}

export async function clearCoachHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.coachMessage.deleteMany({ where: { userId: session.user.id } });
  revalidatePath("/ai-coach");
}
