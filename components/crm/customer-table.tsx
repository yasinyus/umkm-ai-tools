"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toggleBotForCustomer, updateCustomerSegment, deleteCustomer } from "@/actions/crm";
import type { CustomerWithStats } from "@/actions/crm";
import { CustomerSegment } from "@prisma/client";
import {
  BotOff,
  Bot,
  Trash2,
  MessageCircle,
  Search,
  ChevronRight,
  Star,
  AlertTriangle,
  UserPlus,
  Brain,
} from "lucide-react";

const SEGMENT_CONFIG: Record<CustomerSegment, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ElementType }> = {
  LOYAL:  { label: "Loyal",   variant: "default",      icon: Star },
  NEW:    { label: "Baru",    variant: "secondary",    icon: UserPlus },
  AT_RISK:{ label: "At-Risk", variant: "destructive",  icon: AlertTriangle },
};

export function CustomerTable({ initialCustomers }: { initialCustomers: CustomerWithStats[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | "ALL">("ALL");
  const [inactiveFilter, setInactiveFilter] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsappNumber.includes(search);
    const matchesSegment = segmentFilter === "ALL" || c.segment === segmentFilter;
    const matchesInactive = !inactiveFilter || (c.lastContactedAt ? c.lastContactedAt < sevenDaysAgo : true);
    return matchesSearch && matchesSegment && matchesInactive;
  });

  function handleToggleBot(id: string, current: boolean) {
    startTransition(async () => {
      await toggleBotForCustomer(id, !current);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isBotActive: !current } : c))
      );
    });
  }

  function handleSegmentChange(id: string, segment: CustomerSegment) {
    startTransition(async () => {
      await updateCustomerSegment(id, segment);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, segment } : c))
      );
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau nomor WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "LOYAL", "NEW", "AT_RISK"] as const).map((seg) => (
            <Button
              key={seg}
              variant={segmentFilter === seg ? "default" : "outline"}
              size="sm"
              onClick={() => setSegmentFilter(seg)}
            >
              {seg === "ALL" ? "Semua" : SEGMENT_CONFIG[seg as CustomerSegment].label}
            </Button>
          ))}
          <Button
            variant={inactiveFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setInactiveFilter((v) => !v)}
          >
            Tidak Aktif 7 Hari
          </Button>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pelanggan</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Segmen</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Total Belanja</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">AI Insights</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Chat</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground">
                  Tidak ada pelanggan ditemukan.
                </td>
              </tr>
            )}
            {filtered.map((customer) => {
              const seg = SEGMENT_CONFIG[customer.segment];
              const SegIcon = seg.icon;
              return (
                <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">{customer.whatsappNumber}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <select
                      value={customer.segment}
                      onChange={(e) => handleSegmentChange(customer.id, e.target.value as CustomerSegment)}
                      disabled={isPending}
                      className="text-xs rounded border px-2 py-1 bg-background"
                    >
                      <option value="NEW">Baru</option>
                      <option value="LOYAL">Loyal</option>
                      <option value="AT_RISK">At-Risk</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-medium">Rp {customer.totalSpend.toLocaleString("id-ID")}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell max-w-xs">
                    {customer.aiContext ? (
                      <div className="flex items-start gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground line-clamp-2">{customer.aiContext}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Belum ada data</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {customer._count.chatHistory}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        title={customer.isBotActive ? "Matikan bot" : "Aktifkan bot"}
                        onClick={() => handleToggleBot(customer.id, customer.isBotActive)}
                        disabled={isPending}
                      >
                        {customer.isBotActive ? (
                          <Bot className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <BotOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        title="Hapus pelanggan"
                        onClick={() => handleDelete(customer.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Link href={`/crm/${customer.id}`}>
                        <Button variant="ghost" size="icon" className="w-7 h-7">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
