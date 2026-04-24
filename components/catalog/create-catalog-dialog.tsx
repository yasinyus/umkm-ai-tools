"use client";

import { useState, useTransition } from "react";
import { Plus, Store, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCatalogPage } from "@/actions/catalog";
import type { AiContent } from "@prisma/client";

interface Props {
  availableContent: AiContent[];
  onCreated?: () => void;
}

export function CreateCatalogDialog({ availableContent, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSubmit() {
    if (!title.trim() || selected.size === 0) return;
    startTransition(async () => {
      await createCatalogPage({
        title: title.trim(),
        description: description.trim() || undefined,
        waNumber: waNumber.trim() || undefined,
        contentIds: [...selected],
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setWaNumber("");
      setSelected(new Set());
      onCreated?.();
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Buat Katalog Baru
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Buat Katalog Digital</h2>
            <p className="text-xs text-muted-foreground">Pilih konten dan buat halaman publik yang bisa dibagikan</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">
              Nama Katalog <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Contoh: Koleksi Hijab Lebaran 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">
              Deskripsi <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Textarea
              placeholder="Deskripsi singkat tentang katalog ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* WA Number */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">
              Nomor WhatsApp <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Input
              placeholder="Contoh: 08123456789"
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Content selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide">
              Pilih Konten <span className="text-destructive">*</span>
              <span className="ml-1 text-muted-foreground font-normal">({selected.size} dipilih)</span>
            </Label>

            {availableContent.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center border rounded-lg">
                Belum ada konten. Buat caption atau gambar terlebih dahulu.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {availableContent.map((item) => {
                  const isSelected = selected.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      className={`text-left rounded-lg border p-3 transition-all text-xs ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mb-1 ${item.type === "IMAGE" ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"}`}>
                            {item.type === "IMAGE" ? "Gambar" : "Caption"}
                          </span>
                          <p className="font-medium truncate">{item.title ?? "Tanpa judul"}</p>
                          {item.text && (
                            <p className="text-muted-foreground line-clamp-1 mt-0.5">{item.text}</p>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || selected.size === 0 || isPending}
            className="gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
            Buat Katalog
          </Button>
        </div>
      </div>
    </div>
  );
}
