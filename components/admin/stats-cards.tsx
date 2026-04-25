import { Users, UserCheck, UserX, Clock, TrendingUp, BadgeDollarSign } from "lucide-react";

type Stats = {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  inactiveUsers: number;
  totalRevenue: number;
  newUsersThisWeek: number;
};

export function AdminStatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Total User",
      value: stats.totalUsers.toLocaleString("id-ID"),
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "User Aktif (Berlangganan)",
      value: stats.activeUsers.toLocaleString("id-ID"),
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "User Trial",
      value: stats.trialUsers.toLocaleString("id-ID"),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "User Expired",
      value: stats.inactiveUsers.toLocaleString("id-ID"),
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      icon: BadgeDollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "User Baru Minggu Ini",
      value: stats.newUsersThisWeek.toLocaleString("id-ID"),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="rounded-xl border bg-card p-4 space-y-3">
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
