"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, ScanText, Check, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processInvoiceItems, type InvoiceItemInput } from "@/actions/hpp";

interface ExtractedItem extends InvoiceItemInput {
  _editing?: boolean;
}

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function ReceiptUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState<ExtractedItem[] | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function handleFile(f: File) {
    setFile(f);
    setItems(null);
    setScanError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }

  async function handleScan() {
    if (!file) return;
    setScanning(true);
    setScanError(null);
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      const res = await fetch("/api/hpp/scan-receipt", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal scan");
      if (!data.items || data.items.length === 0) {
        setScanError("Tidak ada item yang terdeteksi. Pastikan gambar nota terlihat jelas.");
      } else {
        setItems(data.items);
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setScanning(false);
    }
  }

  function updateItem(idx: number, field: keyof ExtractedItem, value: string | number) {
    setItems((prev) =>
      prev
        ? prev.map((item, i) =>
            i === idx ? { ...item, [field]: typeof value === "string" ? value : Number(value) } : item
          )
        : prev
    );
  }

  function removeItem(idx: number) {
    setItems((prev) => (prev ? prev.filter((_, i) => i !== idx) : prev));
  }

  function handleConfirm() {
    if (!items || items.length === 0) return;
    startTransition(async () => {
      const result = await processInvoiceItems(
        items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          pricePerUnit: i.pricePerUnit,
          totalPrice: i.totalPrice,
        })),
        ""
      );
      showToast(
        `Berhasil! ${result.updated} bahan diperbarui, ${result.created} bahan baru, ${result.productsUpdated} produk dihitung ulang HPP-nya.`
      );
      setFile(null);
      setPreview(null);
      setItems(null);
    });
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <Check className="w-4 h-4 shrink-0" />
          {toast}
        </div>
      )}

      {!file ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Klik atau seret foto nota ke sini</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Maks 10MB</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative rounded-xl overflow-hidden border bg-muted aspect-video flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview!} alt="Receipt preview" className="max-h-full max-w-full object-contain" />
            <button
              onClick={() => { setFile(null); setPreview(null); setItems(null); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            <Button onClick={handleScan} disabled={scanning} className="gap-2">
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanText className="w-4 h-4" />}
              {scanning ? "Memindai..." : "Scan dengan AI"}
            </Button>
            {scanError && (
              <div className="flex items-start gap-1.5 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {scanError}
              </div>
            )}
          </div>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {items.length} item terdeteksi — edit jika perlu
            </p>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Nama Bahan</th>
                  <th className="text-right px-3 py-2 font-semibold">Qty</th>
                  <th className="text-left px-3 py-2 font-semibold">Satuan</th>
                  <th className="text-right px-3 py-2 font-semibold">Harga/Satuan</th>
                  <th className="text-right px-3 py-2 font-semibold">Total</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, idx) => (
                  <tr key={idx} className="bg-background">
                    <td className="px-3 py-2">
                      <input
                        className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none py-0.5"
                        value={item.name}
                        onChange={(e) => updateItem(idx, "name", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        className="w-16 bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none text-right py-0.5"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-14 bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none py-0.5"
                        value={item.unit}
                        onChange={(e) => updateItem(idx, "unit", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        className="w-24 bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none text-right py-0.5"
                        value={item.pricePerUnit}
                        onChange={(e) => updateItem(idx, "pricePerUnit", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {formatIDR(item.quantity * item.pricePerUnit)}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button onClick={handleConfirm} disabled={isPending} className="gap-2 w-full sm:w-auto">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isPending ? "Menyimpan..." : "Konfirmasi & Update Harga Bahan"}
          </Button>
        </div>
      )}
    </div>
  );
}
