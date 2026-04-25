"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertBioLink } from "@/actions/bio-link";
import { Save, CheckCircle2, ExternalLink, Copy } from "lucide-react";

type BioLinkData = {
  slug?: string | null;
  storeName?: string | null;
  tagline?: string | null;
  description?: string | null;
  waNumber?: string | null;
  igHandle?: string | null;
  tiktokHandle?: string | null;
  fbHandle?: string | null;
  websiteUrl?: string | null;
  isPublic?: boolean | null;
};

export function BioLinkForm({ initial }: { initial: BioLinkData | null }) {
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    storeName: initial?.storeName ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    waNumber: initial?.waNumber ?? "",
    igHandle: initial?.igHandle ?? "",
    tiktokHandle: initial?.tiktokHandle ?? "",
    fbHandle: initial?.fbHandle ?? "",
    websiteUrl: initial?.websiteUrl ?? "",
    isPublic: initial?.isPublic ?? true,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${form.slug}`
      : `/p/${form.slug}`;

  function handleChange(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.slug || !form.storeName) {
      setError("Slug dan Nama Toko wajib diisi.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setError("Slug hanya boleh huruf kecil, angka, dan tanda hubung (-).");
      return;
    }
    startTransition(async () => {
      try {
        await upsertBioLink(form);
        setSaved(true);
      } catch (err) {
        setError(String(err instanceof Error ? err.message : err));
      }
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Live URL Preview */}
      {form.slug && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2.5">
          <code className="flex-1 text-xs font-mono truncate text-indigo-700">/p/{form.slug}</code>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={copyLink}>
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          {initial?.slug && (
            <a href={`/p/${initial.slug}`} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="slug">
            Slug URL <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground px-3 py-2 border border-r-0 rounded-l-md bg-muted">/p/</span>
            <Input
              id="slug"
              placeholder="nama-toko-saya"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="rounded-l-none"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="storeName">
            Nama Toko <span className="text-destructive">*</span>
          </Label>
          <Input
            id="storeName"
            placeholder="Warung Makan Bu Yati"
            value={form.storeName}
            onChange={(e) => handleChange("storeName", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          placeholder="Masakan rumahan terlezat di Depok sejak 2010"
          value={form.tagline}
          onChange={(e) => handleChange("tagline", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi Singkat</Label>
        <Textarea
          id="description"
          placeholder="Ceritakan tentang toko Anda..."
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-semibold mb-3">Tombol Kontak & Sosial Media</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="waNumber">Nomor WhatsApp</Label>
            <Input id="waNumber" placeholder="628123456789" value={form.waNumber} onChange={(e) => handleChange("waNumber", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="igHandle">Instagram Handle</Label>
            <Input id="igHandle" placeholder="@namatoko" value={form.igHandle} onChange={(e) => handleChange("igHandle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tiktokHandle">TikTok Handle</Label>
            <Input id="tiktokHandle" placeholder="@namatoko" value={form.tiktokHandle} onChange={(e) => handleChange("tiktokHandle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fbHandle">Facebook</Label>
            <Input id="fbHandle" placeholder="fb.com/namatoko" value={form.fbHandle} onChange={(e) => handleChange("fbHandle", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="websiteUrl">Website / Tokopedia / Shopee URL</Label>
            <Input id="websiteUrl" placeholder="https://tokopedia.com/namatoko" value={form.websiteUrl} onChange={(e) => handleChange("websiteUrl", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.isPublic}
          onClick={() => handleChange("isPublic", !form.isPublic)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${form.isPublic ? "bg-indigo-600" : "bg-gray-200"}`}
        >
          <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.isPublic ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <Label className="cursor-pointer select-none" onClick={() => handleChange("isPublic", !form.isPublic)}>
          {form.isPublic ? "Halaman Publik (bisa diakses siapa saja)" : "Halaman Private"}
        </Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          <Save className="w-4 h-4 mr-1.5" />
          {isPending ? "Menyimpan..." : "Simpan Bio-Link"}
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
