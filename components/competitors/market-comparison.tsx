"use client";

import { useState, useTransition } from "react";
import { BarChart2, Loader2, RefreshCw, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeCompetitor, type CompetitorAnalysisResult } from "@/actions/competitors";

interface Props {
  initialProducts: { id: string; name: string; sellingPrice: number }[];
}

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

const PLATFORM_COLORS: Record<string, string> = {
  Tokopedia: "bg-emerald-500",
  Shopee: "bg-orange-500",
  GrabFood: "bg-green-500",
  GoFood: "bg-red-500",
  Bukalapak: "bg-red-700",
};

function PriceBar({
  label,
  price,
  maxPrice,
  isOurs,
  platform,
  detail,
}: {
  label: string;
  price: number;
  maxPrice: number;
  isOurs?: boolean;
  platform?: string;
  detail?: string;
}) {
  const width = Math.max((price / maxPrice) * 100, 5);
  const barColor = isOurs
    ? "bg-primary"
    : platform
    ? (PLATFORM_COLORS[platform] ?? "bg-indigo-400")
    : "bg-indigo-400";

  return (
    <div className="flex items-center gap-3 group">
      <div className={`w-28 text-right shrink-0 text-xs ${isOurs ? "font-bold text-primary" : "text-muted-foreground"} truncate`}>
        {label}
      </div>
      <div className="flex-1 relative h-8 bg-muted rounded-lg overflow-hidden">
        <div
          className={`h-full rounded-lg transition-all duration-700 ${barColor} ${isOurs ? "opacity-100" : "opacity-70"}`}
          style={{ width: `${width}%` }}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground">
          {formatIDR(price)}
        </span>
      </div>
      {detail && (
        <span className="text-[10px] text-muted-foreground w-16 shrink-0 text-right">{detail}</span>
      )}
    </div>
  );
}

function PositionBadge({ position }: { position: CompetitorAnalysisResult["pricePosition"] }) {
  const map = {
    expensive: { label: "Lebih Mahal", color: "bg-red-100 text-red-700 border-red-200", Icon: TrendingUp },
    competitive: { label: "Kompetitif", color: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: Minus },
    cheap: { label: "Lebih Murah", color: "bg-blue-100 text-blue-700 border-blue-200", Icon: TrendingDown },
  };
  const { label, color, Icon } = map[position];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export function MarketComparison({ initialProducts }: Props) {
  const [productName, setProductName] = useState("");
  const [ourPrice, setOurPrice] = useState("");
  const [result, setResult] = useState<CompetitorAnalysisResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadFromProduct(id: string) {
    const p = initialProducts.find((x) => x.id === id);
    if (p) {
      setProductName(p.name);
      setOurPrice(String(p.sellingPrice));
    }
  }

  function handleAnalyze() {
    if (!productName.trim() || !ourPrice) return;
    startTransition(async () => {
      const res = await analyzeCompetitor(productName.trim(), parseFloat(ourPrice));
      setResult(res);
    });
  }

  const maxPrice = result
    ? Math.max(parseFloat(ourPrice), ...result.competitors.map((c) => c.price))
    : 0;

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Analisis Harga Kompetitor</h3>
        </div>

        {initialProducts.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Isi dari produk tersimpan</Label>
            <select
              onChange={(e) => loadFromProduct(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue=""
            >
              <option value="" disabled>Pilih produk...</option>
              {initialProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatIDR(p.sellingPrice)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Nama Produk</Label>
            <Input
              placeholder="misal: Dimsum Original"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Harga Jual Anda (Rp)</Label>
            <Input
              type="number"
              placeholder="misal: 25000"
              value={ourPrice}
              onChange={(e) => setOurPrice(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!productName.trim() || !ourPrice || isPending}
          className="gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {isPending ? "Menganalisis..." : result ? "Refresh Analisis" : "Analisis Kompetitor"}
        </Button>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3 shrink-0" />
          Data kompetitor disimulasikan berdasarkan nama produk. Diperbarui setiap kali Anda klik Analisis.
        </p>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Rata-rata Kompetitor", value: formatIDR(result.avgPrice) },
              { label: "Termurah", value: formatIDR(result.minPrice) },
              { label: "Termahal", value: formatIDR(result.maxPrice) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-card shadow-sm p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className="font-bold text-sm mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="rounded-xl border bg-card shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Perbandingan Harga</h4>
              <PositionBadge position={result.pricePosition} />
            </div>

            <div className="space-y-2 pt-1">
              <PriceBar
                label="Harga Anda"
                price={parseFloat(ourPrice)}
                maxPrice={maxPrice}
                isOurs
              />
              {result.competitors.map((c, i) => (
                <PriceBar
                  key={i}
                  label={c.name}
                  price={c.price}
                  maxPrice={maxPrice}
                  platform={c.platform}
                  detail={`⭐${c.rating} · ${c.sold} terjual`}
                />
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="rounded-xl border bg-indigo-50 border-indigo-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-sm text-indigo-900">Rekomendasi AI</h4>
            </div>
            <p className="text-sm text-indigo-800 leading-relaxed">{result.recommendation}</p>
            <div className="rounded-lg bg-white/70 border border-indigo-200 px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Saran Tindakan</p>
              <p className="text-sm text-indigo-800 leading-relaxed">{result.strategy}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
