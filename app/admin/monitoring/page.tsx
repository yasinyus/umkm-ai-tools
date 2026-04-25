import { getAdminStats, getAllUsers } from "@/actions/admin";
import { AdminStatsCards } from "@/components/admin/stats-cards";
import { ActivityLogTable } from "@/components/admin/activity-log";
import { UsersTable } from "@/components/admin/users-table";
import { BackupButton } from "@/components/admin/backup-button";
import { Shield, Download } from "lucide-react";

export const metadata = { title: "Admin Monitoring — SosmedAI" };

export default async function AdminMonitoringPage() {
  const [stats, { users }] = await Promise.all([
    getAdminStats(),
    getAllUsers(0, 50),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold text-white">Admin Monitoring</h1>
          </div>
          <p className="text-sm text-gray-400">
            Dashboard internal SosmedAI — hanya bisa diakses oleh admin.
          </p>
        </div>
        <BackupButton />
      </div>

      {/* Stats */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Statistik Platform
        </h2>
        <AdminStatsCards stats={stats} />
      </section>

      {/* Activity Log */}
      <section id="activity">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Aktivitas Terbaru (50 Terakhir)
        </h2>
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <ActivityLogTable activities={stats.recentActivity} />
        </div>
      </section>

      {/* Users Table */}
      <section id="users">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Semua User ({users.length})
        </h2>
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <UsersTable users={users} />
        </div>
      </section>
    </div>
  );
}
