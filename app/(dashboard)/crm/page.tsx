import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCustomers, getCrmStats } from "@/actions/crm";
import { CustomerTable } from "@/components/crm/customer-table";
import { CrmStats } from "@/components/crm/crm-stats";
import { Users } from "lucide-react";

export const metadata = { title: "CRM Dashboard — SosmedAI" };

export default async function CrmPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [customers, stats] = await Promise.all([
    getCustomers(),
    getCrmStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">CRM Dashboard</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Kelola data pelanggan, pantau percakapan AI, dan analisis segmen bisnis Anda.
        </p>
      </div>

      {stats && <CrmStats stats={stats} />}

      <div>
        <h3 className="text-sm font-semibold mb-3">Daftar Pelanggan</h3>
        <CustomerTable initialCustomers={customers} />
      </div>
    </div>
  );
}
