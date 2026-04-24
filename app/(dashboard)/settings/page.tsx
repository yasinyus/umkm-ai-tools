import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata = { title: "Settings — SosmedAI" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      subscriptionStatus: true,
      subscriptionEndAt: true,
    },
  });

  return <SettingsClient profile={profile} />;
}
