"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSubscriptionInfo() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      subscriptionStatus: true,
      subscriptionEndAt: true,
      createdAt: true,
    },
  });
  if (!user) return null;

  const now = new Date();
  const trialEnd = new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const trialDaysLeft = Math.max(
    0,
    Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  );
  const isTrialExpired = user.subscriptionStatus === "TRIAL" && trialDaysLeft === 0;

  const subDaysLeft =
    user.subscriptionStatus === "ACTIVE" && user.subscriptionEndAt
      ? Math.max(
          0,
          Math.ceil(
            (user.subscriptionEndAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          )
        )
      : 0;

  return {
    ...user,
    trialEnd,
    trialDaysLeft,
    isTrialExpired,
    subDaysLeft,
  };
}

export async function createCheckoutSession(): Promise<
  { redirectUrl: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return {
      error:
        "Payment gateway belum dikonfigurasi. Hubungi admin untuk mengatur MIDTRANS_SERVER_KEY.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const orderId = `sub-${session.user.id}-${Date.now()}`;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
  const encodedKey = Buffer.from(`${serverKey}:`).toString("base64");
  const appUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: 49000 },
      customer_details: {
        first_name: user?.name?.split(" ")[0] ?? "User",
        last_name: user?.name?.split(" ").slice(1).join(" ") ?? "",
        email: user?.email ?? "",
      },
      item_details: [
        {
          id: "plan-umkm-monthly",
          price: 49000,
          quantity: 1,
          name: "SosmedAI UMKM — Langganan Bulanan",
        },
      ],
      callbacks: {
        finish: `${appUrl}/billing?payment=success`,
        error: `${appUrl}/billing?payment=error`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[midtrans checkout]", res.status, err);
    let friendlyMsg = "Gagal membuat transaksi. Silakan coba lagi.";
    try {
      const errJson = JSON.parse(err);
      const msgs: string[] = errJson.error_messages ?? [];
      if (msgs.length) friendlyMsg = msgs.join(" ");
    } catch {
      // not JSON — keep default
    }
    return { error: friendlyMsg };
  }

  const data = await res.json();
  if (!data.redirect_url) {
    console.error("[midtrans checkout] no redirect_url in response", data);
    return { error: "Respons Midtrans tidak valid. Cek server key." };
  }
  return { redirectUrl: data.redirect_url as string };
}

// Called manually (dev/admin) to activate a user — NOT exposed to end users
export async function activateSubscription(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const subscriptionEndAt = new Date();
  subscriptionEndAt.setDate(subscriptionEndAt.getDate() + 30);

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "ACTIVE", subscriptionEndAt },
  });
  revalidatePath("/billing");
  revalidatePath("/dashboard");
}
