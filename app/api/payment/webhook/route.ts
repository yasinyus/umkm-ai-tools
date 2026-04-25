import { createHash } from "crypto";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    order_id,
    transaction_status,
    gross_amount,
    status_code,
    signature_key,
  } = body as {
    order_id: string;
    transaction_status: string;
    gross_amount: string;
    status_code: string;
    signature_key: string;
  };

  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";

  // Verify Midtrans signature: SHA512(orderId + statusCode + grossAmount + serverKey)
  const expectedSignature = createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    console.warn("[webhook] Invalid signature for order", order_id);
    return Response.json({ error: "Invalid signature" }, { status: 403 });
  }

  // Only activate on successful payment
  const successStatuses = ["settlement", "capture"];
  if (!successStatuses.includes(transaction_status)) {
    return Response.json({ ok: true, skipped: transaction_status });
  }

  // Extract userId — order_id format: "sub-{userId}-{timestamp}"
  const parts = order_id.split("-");
  if (parts.length < 3 || parts[0] !== "sub") {
    return Response.json({ error: "Unrecognised order_id format" }, { status: 400 });
  }
  // userId is parts[1]; timestamp is parts[2]
  const userId = parts[1];

  const subscriptionEndAt = new Date();
  subscriptionEndAt.setDate(subscriptionEndAt.getDate() + 30);

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: "ACTIVE", subscriptionEndAt },
      }),
      prisma.transaction.upsert({
        where: { orderId: order_id },
        update: { status: "success" },
        create: {
          userId,
          orderId: order_id,
          amount: parseFloat(gross_amount),
          status: "success",
        },
      }),
    ]);
    console.log(`[webhook] Activated subscription for user ${userId} until ${subscriptionEndAt.toISOString()}`);
  } catch (err) {
    console.error("[webhook] DB update failed", err);
    return Response.json({ error: "DB update failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
