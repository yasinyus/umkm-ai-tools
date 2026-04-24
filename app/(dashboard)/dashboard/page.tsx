import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ImageIcon,
  MessageSquare,
  FileText,
  Zap,
  TrendingUp,
  ArrowRight,
  Clock,
  Calculator,
  Sparkles,
  Store,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} hari lalu`;
}

export const metadata = { title: "Dashboard — SosmedAI" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const userId = session.user.id;

  const [contentCounts, recentContent, user] = await Promise.all([
    prisma.aiContent.groupBy({
      by: ["type"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.aiContent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, type: true, title: true, platform: true, createdAt: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        subscriptionStatus: true,
        subscriptionEndAt: true,
        createdAt: true,
      },
    }),
  ]);

  const totalImages = contentCounts.find((c) => c.type === "IMAGE")?._count._all ?? 0;
  const totalCaptions = contentCounts.find((c) => c.type === "CAPTION")?._count._all ?? 0;
  const totalPosts = totalImages + totalCaptions;

  // Trial days left
  const now = new Date();
  const trialEnd = user
    ? new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    : now;
  const trialDaysLeft = Math.max(
    0,
    Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  );

  const isActive = user?.subscriptionStatus === "ACTIVE";
  const isTrial = user?.subscriptionStatus === "TRIAL";

  const stats = [
    {
      label: "Total Konten",
      value: String(totalPosts),
      change: "caption + gambar",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "AI Images",
      value: String(totalImages),
      change: "foto produk digenerate",
      icon: ImageIcon,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
    {
      label: "Captions",
      value: String(totalCaptions),
      change: "caption dibuat",
      icon: MessageSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    isActive
      ? {
          label: "Status",
          value: "Pro",
          change: user?.subscriptionEndAt
            ? `s/d ${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(user.subscriptionEndAt)}`
            : "Aktif",
          icon: Zap,
          color: "text-indigo-500",
          bg: "bg-indigo-50",
        }
      : {
          label: "Trial",
          value: isTrial && trialDaysLeft > 0 ? `${trialDaysLeft}h` : "Habis",
          change: isTrial && trialDaysLeft > 0 ? "hari tersisa" : "Upgrade sekarang",
          icon: Zap,
          color: trialDaysLeft > 0 ? "text-amber-500" : "text-red-500",
          bg: trialDaysLeft > 0 ? "bg-amber-50" : "bg-red-50",
        },
  ];

  const quickActions = [
    {
      label: "Generate Gambar",
      description: "Buat foto produk profesional dengan AI",
      href: "/ai-image-editor",
      icon: ImageIcon,
      badge: "Popular",
    },
    {
      label: "Buat Caption",
      description: "Caption viral untuk Instagram & TikTok",
      href: "/caption-generator",
      icon: MessageSquare,
      badge: null,
    },
    {
      label: "Scan Nota HPP",
      description: "Update harga bahan & hitung margin otomatis",
      href: "/hpp",
      icon: Calculator,
      badge: null,
    },
    {
      label: "Magic Reply",
      description: "Balas pesan pembeli dengan 3 gaya AI",
      href: "/reply-assistant",
      icon: Sparkles,
      badge: "Baru",
    },
  ];

  const firstName = user?.name?.split(" ")[0] ?? "Pengguna";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-semibold">Selamat datang, {firstName} 👋</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Berikut ringkasan aktivitas AI bisnis Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-xl border bg-card p-4 shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{action.label}</p>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs h-4 px-1.5">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Aktivitas Terakhir</h3>
          <Link
            href="/history"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 text-xs gap-1")}
          >
            Lihat semua
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentContent.length === 0 ? (
          <div className="rounded-xl border bg-card shadow-sm p-8 text-center">
            <Store className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Belum ada aktivitas. Mulai buat konten AI pertama Anda!
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm divide-y">
            {recentContent.map((item) => {
              const Icon = item.type === "IMAGE" ? ImageIcon : MessageSquare;
              const typeLabel = item.type === "IMAGE" ? "Gambar AI" : "Caption";
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                      item.type === "IMAGE" ? "bg-violet-50" : "bg-indigo-50"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        item.type === "IMAGE" ? "text-violet-500" : "text-indigo-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {item.title ?? `${typeLabel} dibuat`}
                      {item.platform && (
                        <span className="text-muted-foreground"> · {item.platform}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatRelative(item.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
