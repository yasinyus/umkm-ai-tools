import { Users, Star, AlertTriangle, Clock, UserPlus } from "lucide-react";

type Stats = {
  total: number;
  loyal: number;
  atRisk: number;
  inactive: number;
  newCustomers: number;
};

export function CrmStats({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Pelanggan", value: stats.total, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pelanggan Loyal", value: stats.loyal, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pelanggan Baru", value: stats.newCustomers, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Berisiko Churn", value: stats.atRisk, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Tidak Aktif 7 Hari", value: stats.inactive, icon: Clock, color: "text-gray-600", bg: "bg-gray-100" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}
