import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon, MessageSquare, Calculator, BarChart2, Sparkles, BrainCircuit, Link2, ShoppingBag, FileText, Zap,
} from "lucide-react";

type ActivityEntry = {
  id: string;
  action: string;
  metadata: string | null;
  createdAt: Date;
  user: { name: string | null; email: string; image: string | null };
};

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  generate_caption: { label: "Generate Caption", icon: MessageSquare, color: "text-indigo-600" },
  generate_image: { label: "Edit Image", icon: ImageIcon, color: "text-violet-600" },
  scan_receipt: { label: "Scan Nota OCR", icon: Calculator, color: "text-orange-600" },
  competitor_price: { label: "Cek Harga Kompetitor", icon: BarChart2, color: "text-blue-600" },
  ai_coach_chat: { label: "AI Business Coach", icon: BrainCircuit, color: "text-indigo-600" },
  update_bio_link: { label: "Update Bio-Link", icon: Link2, color: "text-violet-600" },
  create_catalog: { label: "Buat Katalog", icon: ShoppingBag, color: "text-amber-600" },
  schedule_post: { label: "Jadwalkan Posting", icon: Zap, color: "text-purple-600" },
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] ?? { label: action, icon: FileText, color: "text-gray-600" };
}

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return email[0]?.toUpperCase() ?? "U";
}

export function ActivityLogTable({ activities }: { activities: ActivityEntry[] }) {
  return (
    <ScrollArea className="rounded-xl border h-96">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 border-b sticky top-0">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">User</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Aktivitas</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Detail</th>
            <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {activities.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                Belum ada aktivitas tercatat.
              </td>
            </tr>
          )}
          {activities.map((a) => {
            const cfg = getActionConfig(a.action);
            const Icon = cfg.icon;
            return (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                      {getInitials(a.user.name, a.user.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{a.user.name ?? a.user.email}</p>
                      <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{a.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 hidden md:table-cell">
                  {a.metadata && (
                    <span className="text-[11px] text-muted-foreground line-clamp-1">{a.metadata}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString("id-ID", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollArea>
  );
}
