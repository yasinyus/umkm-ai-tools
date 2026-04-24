import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TrialExpiredOverlay } from "@/components/subscription/trial-expired-overlay";
import { TrialBanner } from "@/components/subscription/trial-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  // Read pathname injected by proxy.ts so we can skip the paywall on /billing.
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isBillingPage = pathname === "/billing";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionStatus: true,
      subscriptionEndAt: true,
      createdAt: true,
    },
  });

  const now = new Date();

  // Trial: 7 days from account creation
  const trialEnd = user
    ? new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    : now;
  const trialDaysLeft = Math.max(
    0,
    Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  );

  const isTrialExpired =
    user?.subscriptionStatus === "TRIAL" && trialDaysLeft === 0;

  const isSubscriptionExpired =
    user?.subscriptionStatus === "ACTIVE" &&
    user.subscriptionEndAt !== null &&
    now > (user.subscriptionEndAt ?? now);

  // Block everything except /billing
  const isExpired = !isBillingPage && (isTrialExpired || isSubscriptionExpired);

  // Warn during final 2 days of trial (only when not expired and not on billing page)
  const showTrialWarning =
    !isExpired &&
    !isBillingPage &&
    user?.subscriptionStatus === "TRIAL" &&
    trialDaysLeft > 0 &&
    trialDaysLeft <= 2;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={session.user} />
        {showTrialWarning && <TrialBanner daysLeft={trialDaysLeft} />}
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6 relative">
          {isExpired && <TrialExpiredOverlay />}
          {children}
        </main>
      </div>
    </div>
  );
}
