"use client";

import { useState, useTransition } from "react";
import { CalendarClock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { scheduleContent } from "@/actions/scheduler";

interface Props {
  contentId: string;
  currentStatus: string;
}

export function PostLaterButton({ contentId, currentStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("09:00");
  const [isPending, startTransition] = useTransition();

  const isScheduled = currentStatus === "SCHEDULED";

  function handleOpen() {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    setDateValue(now.toISOString().split("T")[0]);
    setOpen(true);
  }

  function handleSubmit() {
    if (!dateValue || !timeValue) return;
    const scheduledAt = new Date(`${dateValue}T${timeValue}:00`);
    if (isNaN(scheduledAt.getTime())) return;

    startTransition(async () => {
      await scheduleContent({ contentId, scheduledAt });
      setOpen(false);
    });
  }

  if (isScheduled) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-1.5 text-xs h-7"
      >
        <CalendarClock className="w-3.5 h-3.5" />
        Post Later
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl border shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Jadwalkan Postingan</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide">Tanggal</Label>
                <input
                  type="date"
                  value={dateValue}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide">Jam Tayang</Label>
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="rounded-lg bg-muted/50 border px-3 py-2 text-xs text-muted-foreground">
                Postingan akan ditandai sebagai <strong>Terjadwal</strong>. Gunakan cron endpoint untuk memproses otomatis.
              </div>
            </div>

            <div className="flex gap-2 px-5 pb-5">
              <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSubmit}
                disabled={!dateValue || !timeValue || isPending}
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
                Jadwalkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
