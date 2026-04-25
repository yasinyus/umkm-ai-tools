import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStoreSettings } from "@/actions/whatsapp-settings";
import { KnowledgeBaseForm } from "@/components/whatsapp/knowledge-base-form";
import { AutomationSettings } from "@/components/whatsapp/automation-settings";
import { MessageSquareText } from "lucide-react";

export const metadata = { title: "WhatsApp Automation — SosmedAI" };

export default async function WhatsAppSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const settings = await getStoreSettings();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquareText className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold">WhatsApp AI Automation</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Konfigurasi knowledge base toko dan integrasi API untuk mengaktifkan balasan otomatis berbasis AI.
        </p>
      </div>

      {/* Knowledge Base */}
      <div className="rounded-xl border bg-card p-5">
        <KnowledgeBaseForm initial={settings} />
      </div>

      {/* Automation Settings */}
      <AutomationSettings initial={settings} />
    </div>
  );
}
