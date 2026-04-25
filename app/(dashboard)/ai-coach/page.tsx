import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCoachHistory } from "@/actions/ai-coach";
import { ChatInterface } from "@/components/ai-coach/chat-interface";
import { BrainCircuit, Info } from "lucide-react";

export const metadata = { title: "AI Business Coach — SosmedAI" };

export default async function AiCoachPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const history = await getCoachHistory();

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">AI Business Coach</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Konsultan bisnis AI yang memiliki akses ke data HPP, produk, dan pelanggan Anda — untuk saran strategis yang presisi.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2.5 text-xs text-indigo-700">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          AI Coach membaca data real-time dari akun Anda: margin produk, segmentasi pelanggan, dan histori transaksi untuk memberikan saran yang relevan dan actionable.
        </span>
      </div>

      <ChatInterface initialMessages={history} />
    </div>
  );
}
