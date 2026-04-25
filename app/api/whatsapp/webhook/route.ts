import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { CustomerSegment } from "@prisma/client";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Webhook Verification (Meta Cloud API standard GET challenge) ──────────────
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// ── Webhook Handler (incoming messages) ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support Fonnte format AND Meta Cloud API format
    const incomingMsg = extractMessage(body);
    if (!incomingMsg) {
      return NextResponse.json({ status: "ignored" });
    }

    const { senderNumber, senderName, messageText } = incomingMsg;

    // 1. IDENTIFY — find or create customer record
    const customer = await findOrCreateCustomer(senderNumber, senderName);

    // 2. BOT GATE — skip AI if bot is disabled for this customer
    if (!customer.isBotActive) {
      await prisma.chatHistory.create({
        data: { customerId: customer.id, direction: "INBOUND", message: messageText },
      });
      return NextResponse.json({ status: "bot_off" });
    }

    // 3. CONTEXT RETRIEVAL — store knowledge base + recent chat history
    const [storeSettings, recentHistory] = await Promise.all([
      prisma.storeSettings.findUnique({ where: { userId: customer.userId } }),
      prisma.chatHistory.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // 4. AI RESPONSE — GPT-4o with full context
    const aiReply = await generateAiReply({
      customerName: customer.name,
      customerAiContext: customer.aiContext,
      totalSpend: customer.totalSpend,
      segment: customer.segment,
      messageText,
      storeSettings,
      recentHistory: recentHistory.reverse(),
    });

    // 5. SAVE INBOUND + OUTBOUND to ChatHistory
    await prisma.chatHistory.createMany({
      data: [
        { customerId: customer.id, direction: "INBOUND", message: messageText },
        { customerId: customer.id, direction: "OUTBOUND", message: aiReply },
      ],
    });

    // 6. UPDATE customer lastContactedAt
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastContactedAt: new Date() },
    });

    // 7. CRM UPDATE — async AI summarization of customer interest
    updateCustomerAiContext(customer.id, messageText, aiReply).catch(console.error);

    // 8. SEND REPLY via WhatsApp API (fire-and-forget)
    await sendWhatsAppMessage(senderNumber, aiReply, storeSettings?.waApiKey);

    return NextResponse.json({ status: "ok", reply: aiReply });
  } catch (err) {
    console.error("[whatsapp/webhook]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractMessage(body: Record<string, unknown>) {
  // Fonnte format
  if (body.sender && body.message) {
    return {
      senderNumber: String(body.sender),
      senderName: String(body.name ?? body.sender),
      messageText: String(body.message),
    };
  }

  // Meta Cloud API format
  try {
    const entry = (body.entry as Array<{ changes: Array<{ value: { messages?: Array<{ from: string; text?: { body: string }; type: string }>; contacts?: Array<{ profile: { name: string } }> } }> }>)?.[0];
    const change = entry?.changes?.[0]?.value;
    const msg = change?.messages?.[0];
    if (msg?.type === "text" && msg.text?.body) {
      return {
        senderNumber: msg.from,
        senderName: change.contacts?.[0]?.profile?.name ?? msg.from,
        messageText: msg.text.body,
      };
    }
  } catch {
    // not Meta format
  }

  return null;
}

async function findOrCreateCustomer(whatsappNumber: string, name: string) {
  // We need a userId — find the user who owns this WhatsApp token
  // For multi-tenant: match by storeSettings.waApiKey (or use a global lookup)
  // Simple approach: find the first store that has autoReply enabled
  const storeWithAutoReply = await prisma.storeSettings.findFirst({
    where: { autoReply: true },
    select: { userId: true },
  });

  const userId = storeWithAutoReply?.userId;
  if (!userId) {
    throw new Error("No store with autoReply enabled found");
  }

  const existing = await prisma.customer.findUnique({
    where: { userId_whatsappNumber: { userId, whatsappNumber } },
  });

  if (existing) return existing;

  return prisma.customer.create({
    data: { userId, name, whatsappNumber, isBotActive: true },
  });
}

type StoreSettingsType = {
  storeName?: string | null;
  description?: string | null;
  menu?: string | null;
  prices?: string | null;
  openHours?: string | null;
  address?: string | null;
} | null;

async function generateAiReply(params: {
  customerName: string;
  customerAiContext: string | null;
  totalSpend: number;
  segment: CustomerSegment;
  messageText: string;
  storeSettings: StoreSettingsType;
  recentHistory: Array<{ direction: string; message: string }>;
}) {
  const { customerName, customerAiContext, totalSpend, segment, messageText, storeSettings, recentHistory } = params;

  const knowledgeBase = storeSettings
    ? `
Nama Toko: ${storeSettings.storeName ?? "Toko kami"}
Deskripsi: ${storeSettings.description ?? "-"}
Menu/Produk: ${storeSettings.menu ?? "-"}
Daftar Harga: ${storeSettings.prices ?? "-"}
Jam Buka: ${storeSettings.openHours ?? "-"}
Alamat: ${storeSettings.address ?? "-"}
`
    : "Informasi toko belum tersedia.";

  const customerProfile = `
Nama: ${customerName}
Segmen: ${segment}
Total Belanja: Rp ${totalSpend.toLocaleString("id-ID")}
Catatan AI: ${customerAiContext ?? "Belum ada catatan."}
`;

  const historyText = recentHistory
    .map((h) => `${h.direction === "INBOUND" ? "Pelanggan" : "Bot"}: ${h.message}`)
    .join("\n");

  const systemPrompt = `Kamu adalah asisten AI untuk toko UMKM Indonesia. Tugasmu HANYA menjawab pertanyaan seputar toko ini.

=== KNOWLEDGE BASE TOKO ===
${knowledgeBase}

=== PROFIL PELANGGAN ===
${customerProfile}

=== INSTRUKSI ===
- Sapa pelanggan dengan namanya jika memungkinkan
- Jika pelanggan adalah LOYAL, tawarkan produk favorit atau promo khusus
- Jika AT_RISK (lama tidak chat), tawarkan alasan untuk kembali
- Jawab HANYA pertanyaan seputar toko, produk, harga, jam buka, dan alamat
- Jika ditanya di luar topik bisnis toko, tolak dengan sopan dan arahkan ke topik toko
- Gunakan bahasa Indonesia yang ramah dan natural
- Respons singkat (maks 3 kalimat) kecuali diminta detail
- JANGAN pernah berbagi informasi yang tidak ada di knowledge base`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  if (historyText) {
    messages.push({ role: "user", content: `Histori percakapan sebelumnya:\n${historyText}` });
    messages.push({ role: "assistant", content: "Baik, saya sudah membaca histori percakapan." });
  }

  messages.push({ role: "user", content: messageText });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "Maaf, saya sedang tidak bisa membalas. Silakan coba lagi sebentar.";
}

async function updateCustomerAiContext(customerId: string, inboundMsg: string, aiReply: string) {
  const existing = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { aiContext: true, name: true },
  });

  const prevContext = existing?.aiContext ?? "";

  const summary = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Buat ringkasan singkat (1-2 kalimat) tentang minat/preferensi pelanggan berdasarkan percakapan terbaru ini. Gabungkan dengan catatan lama jika ada. Fokus pada produk yang diminati, pertanyaan yang sering diajukan, dan sinyal pembelian.`,
      },
      {
        role: "user",
        content: `Catatan lama: ${prevContext}\n\nPercakapan terbaru:\nPelanggan: ${inboundMsg}\nBot: ${aiReply}`,
      },
    ],
    max_tokens: 150,
  });

  const newContext = summary.choices[0]?.message?.content ?? prevContext;

  await prisma.customer.update({
    where: { id: customerId },
    data: { aiContext: newContext },
  });
}

async function sendWhatsAppMessage(to: string, message: string, apiKey?: string | null) {
  const token = apiKey ?? process.env.WHATSAPP_API_TOKEN;
  const apiUrl = process.env.WHATSAPP_API_URL ?? "https://api.fonnte.com/send";

  if (!token) {
    console.warn("[whatsapp] No API token configured — message not sent");
    return;
  }

  await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target: to, message }),
  });
}
