"use client";

import { useTransition } from "react";
import { Lock, Sparkles, Loader2, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/actions/billing";
import { signOutUser } from "@/actions/auth";

export function TrialExpiredOverlay() {
  const [isPending, startTransition] = useTransition();

  function handleUpgrade() {
    startTransition(async () => {
      const result = await createCheckoutSession();
      if ("redirectUrl" in result) {
        window.location.href = result.redirectUrl;
      } else {
        alert(result.error);
      }
    });
  }

  return (
    /* Covers the <main> area; sidebar & header remain interactive */
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      {/* Dialog card */}
      <div
        className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-expired-title"
      >
        {/* Decorative top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

        <div className="p-8 space-y-6 text-center">
          {/* Icon */}
          <div className="inline-flex w-16 h-16 rounded-2xl bg-red-50 border border-red-100 items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-red-500" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2
              id="trial-expired-title"
              className="text-xl font-bold tracking-tight"
            >
              Masa Trial Berakhir
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Periode trial 7 hari Anda telah habis. Upgrade ke paket{" "}
              <span className="font-semibold text-indigo-600">UMKM Bulanan</span> untuk
              terus menggunakan semua fitur AI.
            </p>
          </div>

          {/* Plan card */}
          <div className="rounded-xl border bg-indigo-50 border-indigo-100 p-4 text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-sm text-indigo-900">Paket UMKM</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-indigo-700">Rp 49.000</span>
                <span className="text-xs text-indigo-500">/bulan</span>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-indigo-800">
              {[
                "Semua fitur AI tanpa batas",
                "HPP Optimizer & Competitor Intel",
                "AI Reply Assistant",
                "Katalog Digital & Content Calendar",
                "Support via WhatsApp",
              ].map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <Button
              className="w-full gap-2 h-11 text-sm font-semibold"
              onClick={handleUpgrade}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {isPending ? "Mengarahkan ke pembayaran..." : "Upgrade Sekarang — Rp 49.000"}
            </Button>

            <form action={signOutUser} className="w-full">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar dari akun
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
