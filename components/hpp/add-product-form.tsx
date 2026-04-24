"use client";

import { useState, useTransition } from "react";
import { Plus, Package, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct } from "@/actions/hpp";
import type { Ingredient } from "@prisma/client";

interface Props {
  ingredients: Ingredient[];
}

interface SelectedLine {
  ingredientId: string;
  quantity: number;
  ingredient: Ingredient;
}

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function AddProductForm({ ingredients }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [pickedId, setPickedId] = useState("");
  const [pickedQty, setPickedQty] = useState("");
  const [lines, setLines] = useState<SelectedLine[]>([]);
  const [isPending, startTransition] = useTransition();

  function addLine() {
    if (!pickedId || !pickedQty || parseFloat(pickedQty) <= 0) return;
    if (lines.some((l) => l.ingredientId === pickedId)) return;
    const ingredient = ingredients.find((i) => i.id === pickedId);
    if (!ingredient) return;
    setLines((prev) => [...prev, { ingredientId: pickedId, quantity: parseFloat(pickedQty), ingredient }]);
    setPickedId("");
    setPickedQty("");
  }

  const estimatedCOGS = lines.reduce((sum, l) => sum + l.ingredient.costPerUnit * l.quantity, 0);
  const sellingPrice = parseFloat(price) || 0;
  const marginPct = sellingPrice > 0 ? ((sellingPrice - estimatedCOGS) / sellingPrice) * 100 : 0;

  function handleSubmit() {
    if (!name.trim() || !price || lines.length === 0) return;
    startTransition(async () => {
      await createProduct({
        name: name.trim(),
        sellingPrice,
        ingredients: lines.map((l) => ({ ingredientId: l.ingredientId, quantity: l.quantity })),
      });
      setOpen(false);
      setName("");
      setPrice("");
      setLines([]);
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Tambah Produk
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Tambah Produk</h2>
            <p className="text-xs text-muted-foreground">HPP dihitung otomatis dari bahan baku</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide">Nama Produk *</Label>
              <Input
                placeholder="misal: Dimsum Original"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide">Harga Jual (Rp) *</Label>
              <Input
                type="number"
                placeholder="misal: 25000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide">Bahan Baku *</Label>

            {ingredients.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center border rounded-lg">
                Belum ada bahan baku. Tambahkan di tabel Bahan Baku terlebih dahulu.
              </p>
            ) : (
              <div className="flex gap-2">
                <select
                  value={pickedId}
                  onChange={(e) => setPickedId(e.target.value)}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Pilih bahan...</option>
                  {ingredients
                    .filter((i) => !lines.some((l) => l.ingredientId === i.id))
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit}) — {formatIDR(i.costPerUnit)}
                      </option>
                    ))}
                </select>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={pickedQty}
                  onChange={(e) => setPickedQty(e.target.value)}
                  className="h-9 w-20 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addLine}
                  disabled={!pickedId || !pickedQty}
                  className="shrink-0 h-9"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {lines.length > 0 && (
              <div className="rounded-lg border divide-y text-xs">
                {lines.map((l) => (
                  <div key={l.ingredientId} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <span className="font-medium">{l.ingredient.name}</span>
                      <span className="text-muted-foreground ml-1">
                        ×{l.quantity} {l.ingredient.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono">
                        {formatIDR(l.ingredient.costPerUnit * l.quantity)}
                      </span>
                      <button
                        onClick={() => setLines((prev) => prev.filter((x) => x.ingredientId !== l.ingredientId))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lines.length > 0 && sellingPrice > 0 && (
            <div className="rounded-xl border bg-muted/30 p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-muted-foreground">HPP Estimasi</p>
                <p className="font-bold mt-0.5">{formatIDR(estimatedCOGS)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Harga Jual</p>
                <p className="font-bold mt-0.5">{formatIDR(sellingPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Margin</p>
                <p className={`font-bold mt-0.5 ${marginPct < 20 ? "text-red-600" : marginPct < 35 ? "text-amber-600" : "text-emerald-600"}`}>
                  {marginPct.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-3 border-t">
          <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleSubmit}
            disabled={!name.trim() || !price || lines.length === 0 || isPending}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Simpan Produk
          </Button>
        </div>
      </div>
    </div>
  );
}
