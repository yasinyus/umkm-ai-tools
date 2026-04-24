"use client";

import { useState, useCallback } from "react";
import { TrendingUp, RefreshCw, Zap, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketplaceTrendData, TrendCategory } from "@/services/trend-data";
import type { TrendAnalysisResult, TrendInsight } from "@/services/trend-analysis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrendApiResponse {
  trendData: MarketplaceTrendData;
  analysis: TrendAnalysisResult;
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

function CategoryBar({ cat, index, maxGrowth }: { cat: TrendCategory; index: number; maxGrowth: number }) {
  const pct = Math.round((cat.growth / maxGrowth) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium truncate max-w-[160px]">{cat.category}</span>
        <span className="font-bold text-emerald-600 ml-2 shrink-0">+{cat.growth}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", CATEGORY_COLORS[index % CATEGORY_COLORS.length])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-1 flex-wrap">
        {cat.topKeywords.slice(0, 3).map((kw) => (
          <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

const URGENCY_STYLES = {
  high:   { badge: "bg-rose-100 text-rose-700 border-rose-200",   label: "Urgent" },
  medium: { badge: "bg-amber-100 text-amber-700 border-amber-200", label: "Penting" },
  low:    { badge: "bg-slate-100 text-slate-600 border-slate-200", label: "Info" },
};

function InsightCard({ insight }: { insight: TrendInsight }) {
  const style = URGENCY_STYLES[insight.urgency] ?? URGENCY_STYLES.low;
  return (
    <div className="rounded-xl border bg-card p-4 space-y-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{insight.emoji}</span>
          <p className="text-sm font-semibold leading-snug">{insight.category}</p>
        </div>
        <span className={cn("shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border", style.badge)}>
          {style.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{insight.insight}</p>
      <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5">
        <p className="text-xs font-medium text-primary leading-relaxed">
          💡 {insight.suggestion}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrendWatch() {
  const [data, setData] = useState<TrendApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/trends", { cache: "no-store" });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json() as TrendApiResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data tren.");
    } finally {
      setLoading(false);
    }
  }, []);

  const maxGrowth = data
    ? Math.max(...data.trendData.categories.map((c) => c.growth))
    : 100;

  return (
    <div className="space-y-5">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {data ? `Data: ${data.trendData.period} · AI diperbarui ${new Date(data.analysis.generatedAt).toLocaleTimeString("id-ID")}` : "Klik untuk memuat data tren"}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchTrends} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {data ? "Refresh" : "Muat Tren"}
        </Button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* ── Empty / Loading state ── */}
      {!data && !loading && !error && (
        <div className="rounded-xl border bg-card shadow-sm p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">Trend Watch siap</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &quot;Muat Tren&quot; untuk melihat produk yang sedang naik di Tokopedia & Shopee + rekomendasi AI.
            </p>
          </div>
        </div>
      )}

      {loading && !data && (
        <div className="rounded-xl border bg-card shadow-sm p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Menganalisis tren marketplace…</p>
        </div>
      )}

      {/* ── Content ── */}
      {data && (
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Left: Bar Chart */}
          <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Pertumbuhan per Kategori</h3>
            </div>
            <div className="space-y-4">
              {data.trendData.categories
                .sort((a, b) => b.growth - a.growth)
                .map((cat, i) => (
                  <CategoryBar key={cat.category} cat={cat} index={i} maxGrowth={maxGrowth} />
                ))}
            </div>

            {/* Top products table */}
            <div className="pt-3 border-t space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produk Terlaris Minggu Ini</p>
              {data.trendData.categories
                .flatMap((c) => c.topProducts.slice(0, 1))
                .slice(0, 4)
                .map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[180px]">{p.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-muted-foreground">{p.priceRange}</span>
                      <span className="text-emerald-600 font-semibold">+{p.growth}%</span>
                      <Badge variant="outline" className="text-[9px] h-4 px-1 capitalize">{p.platform}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right: AI Insights */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold">AI Actionable Insights</h3>
              <span className="text-xs text-muted-foreground">({data.analysis.summary})</span>
            </div>
            {data.analysis.insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}

            <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
              <ExternalLink className="w-3 h-3" />
              Data disimulasikan dari tren Tokopedia &amp; Shopee · Dianalisis oleh Llama 4
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
