import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CalendarClock, Info } from "lucide-react";
import { ContentCalendar } from "@/components/scheduler/content-calendar";
import { getScheduledContent } from "@/actions/scheduler";

export const metadata = { title: "Content Calendar — SosmedAI" };

export default async function SchedulerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const items = await getScheduledContent();

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Content Calendar</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lihat dan kelola antrean postingan yang sudah dijadwalkan.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border bg-amber-50 border-amber-200 px-4 py-3 text-xs text-amber-800">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          Untuk menjadwalkan konten, buka halaman <strong>History</strong> dan klik tombol{" "}
          <strong>Post Later</strong> pada konten yang diinginkan.
        </span>
      </div>

      <ContentCalendar items={items} />
    </div>
  );
}
