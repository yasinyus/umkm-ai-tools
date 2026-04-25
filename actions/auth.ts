"use server";

import { signIn, signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}

export async function signOutAllDevices() {
  const session = await auth();
  if (!session?.user?.id) return;

  // Delete all DB sessions for this user (works with NextAuth Prisma adapter)
  await prisma.session.deleteMany({ where: { userId: session.user.id } });

  // Sign out current session & clear JWT cookie
  await signOut({ redirectTo: "/" });
}
