"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIngredient, deleteIngredient } from "@/actions/hpp";
import type { Ingredient } from "@prisma/client";

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(d)
  );
}

function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => deleteIngredient(id))}
      className="text-muted-foreground hover:text-destructive disabled:opacity-40 transition-colors"
      title="Hapus bahan"
    >
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}

export function IngredientTable({ ingredients }: { ingredients: Ingredient[] }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [cost, setCost] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!name.trim() || !unit.trim() || !cost) return;
    startTransition(async () => {
      await createIngredient({ name: name.trim(), unit: unit.trim(), costPerUnit: parseFloat(cost) });
      setName("");
      setUnit("");
      setCost("");
    });
  }

  return (
    <div className="space-y-4">
      {ingredients.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 border rounded-xl">
          Belum ada bahan baku. Tambahkan di bawah atau scan nota terlebih dahulu.
        </p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold">Nama Bahan</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold">Satuan</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold">Harga/Satuan</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold">Diperbarui</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {ingredients.map((ing) => (
                <tr key={ing.id} className="bg-background hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium">{ing.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{ing.unit}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatIDR(ing.costPerUnit)}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground text-xs">
                    {formatDate(ing.updatedAt)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <DeleteButton id={ing.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide">Tambah Bahan Baku</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nama Bahan</Label>
            <Input
              placeholder="misal: Tepung Terigu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Satuan</Label>
            <Input
              placeholder="misal: kg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Harga/Satuan (Rp)</Label>
            <Input
              type="number"
              placeholder="misal: 12000"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!name.trim() || !unit.trim() || !cost || isPending}
          className="gap-1.5"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Tambah
        </Button>
      </div>
    </div>
  );
}
