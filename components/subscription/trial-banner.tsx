import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const isLastDay = daysLeft <= 1;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm shrink-0 ${
        isLastDay
          ? "bg-red-50 border-b border-red-200 text-red-800"
          : "bg-amber-50 border-b border-amber-200 text-amber-800"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="w-4 h-4 shrink-0" />
        <span className="truncate">
          {isLastDay ? (
            <>
              <strong>Hari terakhir trial Anda!</strong> Upgrade sekarang agar tidak kehilangan akses.
            </>
          ) : (
            <>
              Trial Anda berakhir dalam <strong>{daysLeft} hari</strong>. Nikmati semua fitur sebelum masa trial habis.
            </>
          )}
        </span>
      </div>
      <Link
        href="/billing"
        className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
          isLastDay
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-amber-600 text-white hover:bg-amber-700"
        }`}
      >
        Upgrade
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
