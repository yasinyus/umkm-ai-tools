import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Users, Activity, Shield, Zap } from "lucide-react";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "yasinyusuf89@gmail.com";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user?.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-800">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-800 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm">Admin Panel</span>
            <p className="text-[10px] text-gray-500">SosmedAI Internal</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { label: "Monitoring", href: "/admin/monitoring", icon: LayoutDashboard },
            { label: "Users", href: "/admin/monitoring#users", icon: Users },
            { label: "Activity Log", href: "/admin/monitoring#activity", icon: Activity },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-gray-800 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
