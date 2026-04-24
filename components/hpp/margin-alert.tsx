"use client";

import { useTransition } from "react";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "@/actions/hpp";
import type { Product, ProductIngredient, Ingredient } from "@prisma/client";

type ProductWithIngredients = Product & {
  productIngredients: (ProductIngredient & { ingredient: Ingredient })[];
};

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function MarginLevel(pct: number) {
  if (pct < 20) return { label: "Margin Kritis", color: "text-red-600", bg: "bg-red-50 border-red-200", Icon: AlertTriangle, dot: "bg-red-500" };
  if (pct < 35) return { label: "Margin Tipis", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", Icon: TrendingDown, dot: "bg-amber-500" };
  return { label: "Margin Sehat", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", Icon: CheckCircle2, dot: "bg-emerald-500" };
}

function ProductCard({ product }: { product: ProductWithIngredients }) {
  const [pending, startTransition] = useTransition();
  const { label, color, bg, Icon, dot } = MarginLevel(product.marginPct);

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-sm truncate">{product.name}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
            <span className={`text-xs font-medium ${color}`}>{label}</span>
          </div>
        </div>
        <button
          onClick={() => startTransition(() => deleteProduct(product.id))}
          disabled={pending}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/60 px-2 py-1.5 border border-white/80">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Harga Jual</p>
          <p className="text-xs font-bold mt-0.5">{formatIDR(product.sellingPrice)}</p>
        </div>
        <div className="rounded-lg bg-white/60 px-2 py-1.5 border border-white/80">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">HPP</p>
          <p className="text-xs font-bold mt-0.5">{formatIDR(product.cogs)}</p>
        </div>
        <div className="rounded-lg bg-white/60 px-2 py-1.5 border border-white/80">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Margin</p>
          <p className={`text-xs font-bold mt-0.5 ${color}`}>{product.marginPct.toFixed(1)}%</p>
        </div>
      </div>

      {/* Margin bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-white/60 border border-white/80 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              product.marginPct < 20 ? "bg-red-500" : product.marginPct < 35 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(product.marginPct, 100)}%` }}
          />
        </div>
        {product.productIngredients.length > 0 && (
          <p className="text-[10px] text-muted-foreground">
            Bahan: {product.productIngredients.map((pi) => `${pi.ingredient.name} ×${pi.quantity}`).join(", ")}
          </p>
        )}
      </div>

      {product.marginPct < 20 && (
        <div className="flex items-center gap-1.5 rounded-lg bg-red-100 border border-red-200 px-2.5 py-1.5 text-[11px] text-red-700">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Kenaikan harga bahan menggerus profit. Pertimbangkan kenaikan harga jual.
        </div>
      )}
    </div>
  );
}

export function MarginAlert({ products }: { products: ProductWithIngredients[] }) {
  const atRisk = products.filter((p) => p.marginPct < 20).length;
  const warning = products.filter((p) => p.marginPct >= 20 && p.marginPct < 35).length;
  const healthy = products.filter((p) => p.marginPct >= 35).length;

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8 border rounded-xl">
        Belum ada produk. Tambahkan produk terlebih dahulu.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {atRisk > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>{atRisk} produk</strong> dengan margin kritis (&lt;20%) terdeteksi. Periksa harga bahan dan harga jual.
          </span>
        </div>
      )}

      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{healthy} sehat</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />{warning} perlu perhatian</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{atRisk} kritis</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
