"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateAdminNote } from "@/actions/admin";
import { SubscriptionStatus } from "@prisma/client";
import { StickyNote, Check, X } from "lucide-react";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndAt: Date | null;
  createdAt: Date;
  adminNote: string | null;
  _count: { contents: number; customers: number; activityLogs: number };
};

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  ACTIVE: { label: "Aktif", variant: "default" },
  TRIAL: { label: "Trial", variant: "secondary" },
  INACTIVE: { label: "Expired", variant: "destructive" },
};

function AdminNoteCell({ userId, initialNote }: { userId: string; initialNote: string | null }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateAdminNote(userId, note);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="flex items-start gap-1">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="text-xs min-w-[180px]"
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave} disabled={isPending}>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(false)}>
            <X className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-start gap-1.5 text-left group w-full"
    >
      <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 group-hover:text-amber-600" />
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
        {note || "Tambah catatan..."}
      </span>
    </button>
  );
}

export function UsersTable({ users }: { users: UserRow[] }) {
  return (
    <ScrollArea className="rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Aktivitas</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Bergabung</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Admin Notes</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-10 text-muted-foreground">
                Belum ada user.
              </td>
            </tr>
          )}
          {users.map((user) => {
            const statusCfg = STATUS_CONFIG[user.subscriptionStatus];
            return (
              <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">{user.name ?? "(Tanpa nama)"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusCfg.variant} className="text-xs">
                    {statusCfg.label}
                  </Badge>
                  {user.subscriptionEndAt && user.subscriptionStatus === "ACTIVE" && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Hingga {new Date(user.subscriptionEndAt).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="text-xs space-y-0.5 text-muted-foreground">
                    <p>{user._count.contents} konten</p>
                    <p>{user._count.customers} pelanggan</p>
                    <p>{user._count.activityLogs} aktivitas</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <AdminNoteCell userId={user.id} initialNote={user.adminNote} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollArea>
  );
}
