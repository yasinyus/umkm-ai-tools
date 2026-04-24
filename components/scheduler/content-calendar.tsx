"use client";

import { useTransition } from "react";
import { CalendarClock, CheckCircle2, Clock, ImageIcon, FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { unscheduleContent, markAsPosted } from "@/actions/scheduler";
import type { AiContent } from "@prisma/client";

interface Props {
  items: AiContent[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === "SCHEDULED") {
    return (
      <Badge variant="secondary" className="gap-1 text-xs bg-amber-100 text-amber-700 border-amber-200">
        <Clock className="w-3 h-3" />
        Terjadwal
      </Badge>
    );
  }
  if (status === "POSTED") {
    return (
      <Badge variant="secondary" className="gap-1 text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Terposting
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      Draft
    </Badge>
  );
}

function CalendarItem({ item }: { item: AiContent }) {
  const [isPending, startTransition] = useTransition();

  const scheduledDate = item.scheduledAt
    ? new Date(item.scheduledAt).toLocaleString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const postedDate = item.postedAt
    ? new Date(item.postedAt).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card shadow-sm p-4">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        {item.type === "IMAGE" ? (
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
        ) : (
          <FileText className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold truncate">{item.title ?? "Tanpa judul"}</p>
          <StatusBadge status={item.status} />
        </div>

        {item.text && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.text}</p>
        )}

        <div className="flex items-center gap-3 flex-wrap pt-1">
          {item.platform && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
              {item.platform}
            </span>
          )}
          {scheduledDate && item.status === "SCHEDULED" && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <CalendarClock className="w-3 h-3" />
              {scheduledDate}
            </span>
          )}
          {postedDate && item.status === "POSTED" && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              {postedDate}
            </span>
          )}
        </div>

        {item.status === "SCHEDULED" && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7"
              disabled={isPending}
              onClick={() => startTransition(async () => { await markAsPosted(item.id); })}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tandai Terposting
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-destructive"
              disabled={isPending}
              onClick={() => startTransition(async () => { await unscheduleContent(item.id); })}
            >
              <X className="w-3.5 h-3.5" />
              Batalkan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContentCalendar({ items }: Props) {
  const scheduled = items.filter((i) => i.status === "SCHEDULED");
  const posted = items.filter((i) => i.status === "POSTED");

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
          <CalendarClock className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-sm">Belum ada jadwal</p>
        <p className="text-xs text-muted-foreground mt-1">
          Buka History, lalu klik &quot;Post Later&quot; pada konten yang ingin dijadwalkan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {scheduled.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Antrean Jadwal</h3>
            <span className="text-xs text-muted-foreground">({scheduled.length})</span>
          </div>
          <div className="space-y-2">
            {scheduled.map((item) => (
              <CalendarItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {posted.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold">Sudah Terposting</h3>
            <span className="text-xs text-muted-foreground">({posted.length})</span>
          </div>
          <div className="space-y-2 opacity-75">
            {posted.map((item) => (
              <CalendarItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
