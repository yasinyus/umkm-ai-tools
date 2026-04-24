import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/actions/billing";

// Thin wrapper so the billing page can also call this via fetch if needed.
// The primary path is the server action; this route exists for Midtrans JS SDK callbacks.
export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await createCheckoutSession();
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json(result);
}
