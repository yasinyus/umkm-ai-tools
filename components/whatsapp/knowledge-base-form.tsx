"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertStoreSettings } from "@/actions/whatsapp-settings";
import { BookOpen, Save, CheckCircle2 } from "lucide-react";

type KnowledgeBaseData = {
  storeName?: string | null;
  description?: string | null;
  menu?: string | null;
  prices?: string | null;
  openHours?: string | null;
  address?: string | null;
};

export function KnowledgeBaseForm({ initial }: { initial: KnowledgeBaseData | null }) {
  const [form, setForm] = useState({
    storeName: initial?.storeName ?? "",
    description: initial?.description ?? "",
    menu: initial?.menu ?? "",
    prices: initial?.prices ?? "",
    openHours: initial?.openHours ?? "",
    address: initial?.address ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await upsertStoreSettings(form);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-semibold">Knowledge Base Toko</h3>
      </div>
      <p className="text-xs text-muted-foreground -mt-3">
        Data ini menjadi referensi utama AI saat menjawab pertanyaan pelanggan di WhatsApp.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="storeName">Nama Toko</Label>
          <Input
            id="storeName"
            placeholder="Warung Makan Bu Yati"
            value={form.storeName}
            onChange={(e) => handleChange("storeName", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="openHours">Jam Buka</Label>
          <Input
            id="openHours"
            placeholder="Senin–Sabtu, 07.00–21.00 WIB"
            value={form.openHours}
            onChange={(e) => handleChange("openHours", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Alamat</Label>
        <Input
          id="address"
          placeholder="Jl. Raya Bogor No. 123, Depok"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi Toko</Label>
        <Textarea
          id="description"
          placeholder="Ceritakan singkat tentang toko Anda, spesialisasi, dan keunggulan..."
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="menu">Daftar Menu / Produk</Label>
        <Textarea
          id="menu"
          placeholder="Nasi Goreng Spesial, Mie Ayam Bakso, Es Teh Manis, Jus Alpukat, ..."
          value={form.menu}
          onChange={(e) => handleChange("menu", e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">Pisahkan dengan koma atau baris baru.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prices">Daftar Harga</Label>
        <Textarea
          id="prices"
          placeholder="Nasi Goreng Spesial: Rp 25.000&#10;Mie Ayam Bakso: Rp 20.000&#10;Es Teh Manis: Rp 5.000"
          value={form.prices}
          onChange={(e) => handleChange("prices", e.target.value)}
          rows={5}
        />
        <p className="text-xs text-muted-foreground">Format bebas — AI akan membacanya secara natural.</p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          <Save className="w-4 h-4 mr-1.5" />
          {isPending ? "Menyimpan..." : "Simpan Knowledge Base"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            Tersimpan!
          </span>
        )}
      </div>
    </form>
  );
}
