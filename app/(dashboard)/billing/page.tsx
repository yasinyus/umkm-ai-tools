"use client";

import { useTransition, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession, getSubscriptionInfo } from "@/actions/billing";

type SubscriptionInfo = Awaited<ReturnType<typeof getSubscriptionInfo>>;

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Aktif", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    TRIAL: { label: "Trial", className: "bg-amber-100 text-amber-700 border-amber-200" },
    INACTIVE: { label: "Tidak Aktif", className: "bg-red-100 text-red-700 border-red-200" },
  };
  const s = map[status] ?? map.INACTIVE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.className}`}>
      {s.label}
    </span>
  );
}

function UpgradeButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUpgrade() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession();
      if ("redirectUrl" in result) {
        window.location.href = result.redirectUrl;
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleUpgrade} disabled={isPending} className="w-full gap-2 h-11">
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}
        {isPending ? "Mengarahkan ke pembayaran..." : "Bayar Sekarang — Rp 49.000"}
      </Button>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const [info, setInfo] = useState<SubscriptionInfo>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionInfo().then((data) => {
      setInfo(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isActive = info?.subscriptionStatus === "ACTIVE";
  const isTrial = info?.subscriptionStatus === "TRIAL";
  const needsUpgrade = info?.isTrialExpired || info?.subscriptionStatus === "INACTIVE";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Billing & Langganan</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kelola paket langganan dan riwayat pembayaran Anda.
        </p>
      </div>

      {/* Payment success banner */}
      {paymentStatus === "success" && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">Pembayaran berhasil! 🎉</p>
            <p className="text-xs mt-0.5">Akun Anda sudah aktif. Selamat menggunakan semua fitur SosmedAI.</p>
          </div>
        </div>
      )}

      {paymentStatus === "error" && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Pembayaran gagal</p>
            <p className="text-xs mt-0.5">Silakan coba lagi. Hubungi support jika masalah berlanjut.</p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {isActive ? "Paket UMKM" : isTrial ? "Trial Gratis" : "Tidak Berlangganan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {info?.email}
              </p>
            </div>
          </div>
          {info && <StatusBadge status={info.subscriptionStatus} />}
        </div>

        {/* Status details */}
        {isActive && info?.subscriptionEndAt && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Aktif hingga{" "}
            <strong>{formatDate(info.subscriptionEndAt)}</strong>
            {info.subDaysLeft > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                {info.subDaysLeft} hari lagi
              </Badge>
            )}
          </div>
        )}

        {isTrial && !info?.isTrialExpired && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            <Clock className="w-4 h-4 shrink-0" />
            Trial berakhir{" "}
            <strong>{info?.trialEnd ? formatDate(info.trialEnd) : "-"}</strong>
            <Badge variant="secondary" className="ml-auto text-xs bg-amber-100 text-amber-700 border-amber-200">
              {info?.trialDaysLeft} hari lagi
            </Badge>
          </div>
        )}

        {needsUpgrade && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Masa trial Anda telah berakhir. Upgrade untuk mengakses semua fitur.
          </div>
        )}
      </div>

      {/* Pricing cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Free trial */}
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trial Gratis</p>
            <p className="text-3xl font-bold mt-1">Rp 0</p>
            <p className="text-xs text-muted-foreground mt-0.5">7 hari akses penuh</p>
          </div>
          <ul className="space-y-2 text-sm">
            {["Semua fitur AI", "HPP Optimizer", "Reply Assistant", "Katalog Digital"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-muted/50 border px-3 py-2 text-xs text-center text-muted-foreground">
            {isTrial && !info?.isTrialExpired
              ? `Aktif · ${info?.trialDaysLeft} hari tersisa`
              : "Sudah digunakan"}
          </div>
        </div>

        {/* UMKM Plan */}
        <div className="rounded-xl border-2 border-indigo-500 bg-card shadow-lg p-5 space-y-4 relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold uppercase tracking-wide">
              Direkomendasikan
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Paket UMKM</p>
            <p className="text-3xl font-bold mt-1">Rp 49.000</p>
            <p className="text-xs text-muted-foreground mt-0.5">per bulan · perbarui kapan saja</p>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              "Semua fitur AI tanpa batas",
              "HPP Optimizer + Competitor Intel",
              "Reply Assistant + Magic Reply",
              "Katalog Digital + Content Calendar",
              "Support via WhatsApp",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {isActive ? (
            <Button variant="outline" className="w-full gap-2" disabled>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Paket Aktif
            </Button>
          ) : (
            <UpgradeButton />
          )}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        Pembayaran diproses secara aman melalui Midtrans. Data kartu Anda tidak disimpan di server kami.
      </div>
    </div>
  );
}
