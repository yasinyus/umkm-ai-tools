import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCustomerWithHistory } from "@/actions/crm";
import { LiveChat } from "@/components/crm/live-chat";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Phone, ShoppingBag, Star, AlertTriangle, UserPlus } from "lucide-react";
import Link from "next/link";
import { CustomerSegment } from "@prisma/client";

const SEGMENT_CONFIG: Record<CustomerSegment, { label: string; color: string; icon: React.ElementType }> = {
  LOYAL:   { label: "Loyal",   color: "bg-amber-100 text-amber-700",  icon: Star },
  NEW:     { label: "Baru",    color: "bg-blue-100 text-blue-700",    icon: UserPlus },
  AT_RISK: { label: "At-Risk", color: "bg-red-100 text-red-700",      icon: AlertTriangle },
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { customerId } = await params;
  const customer = await getCustomerWithHistory(customerId);
  if (!customer) notFound();

  const seg = SEGMENT_CONFIG[customer.segment];
  const SegIcon = seg.icon;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div>
        <Link
          href="/crm"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke CRM
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{customer.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                {customer.whatsappNumber}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${seg.color}`}>
                <SegIcon className="w-3 h-3" />
                {seg.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Belanja</p>
            <p className="text-lg font-bold">Rp {customer.totalSpend.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* AI Insights card */}
      {customer.aiContext && (
        <div className="rounded-xl border bg-indigo-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <p className="text-sm font-semibold text-indigo-700">AI Insights</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{customer.aiContext}</p>
        </div>
      )}

      {/* Live Chat */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Live Chat Monitor</h3>
        <LiveChat
          customerId={customer.id}
          customerName={customer.name}
          isBotActive={customer.isBotActive}
          initialMessages={customer.chatHistory.map((m) => ({
            id: m.id,
            direction: m.direction as "INBOUND" | "OUTBOUND",
            message: m.message,
            createdAt: m.createdAt,
          }))}
        />
      </div>
    </div>
  );
}
