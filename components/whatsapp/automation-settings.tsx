"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertStoreSettings, toggleAutoReply } from "@/actions/whatsapp-settings";
import { Zap, Key, Save, CheckCircle2, Copy } from "lucide-react";

type ApiSettingsData = {
  autoReply?: boolean | null;
  waApiKey?: string | null;
  waToken?: string | null;
};

export function AutomationSettings({ initial }: { initial: ApiSettingsData | null }) {
  const [autoReply, setAutoReply] = useState(initial?.autoReply ?? false);
  const [waApiKey, setWaApiKey] = useState(initial?.waApiKey ?? "");
  const [waToken, setWaToken] = useState(initial?.waToken ?? "");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/whatsapp/webhook`
      : "/api/whatsapp/webhook";

  function handleToggleAutoReply() {
    const next = !autoReply;
    setAutoReply(next);
    startTransition(async () => {
      await toggleAutoReply(next);
    });
  }

  function handleSaveApiKeys(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await upsertStoreSettings({ waApiKey, waToken });
      setSaved(true);
    });
  }

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Auto-reply toggle */}
      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Auto-Reply Global</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Ketika aktif, setiap pesan WhatsApp masuk akan otomatis dibalas oleh AI menggunakan knowledge base toko Anda.
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={autoReply}
          onClick={handleToggleAutoReply}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none ${
            autoReply ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
              autoReply ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <p className={`text-xs font-medium ${autoReply ? "text-indigo-600" : "text-muted-foreground"}`}>
          {autoReply ? "Auto-Reply Aktif" : "Auto-Reply Nonaktif"}
        </p>
      </div>

      {/* Webhook URL */}
      <div className="rounded-xl border p-5 space-y-3">
        <h3 className="text-sm font-semibold">Webhook URL</h3>
        <p className="text-xs text-muted-foreground">
          Daftarkan URL ini ke dashboard Fonnte atau Meta Cloud API sebagai Webhook URL.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-muted rounded-md px-3 py-2 font-mono truncate">
            /api/whatsapp/webhook
          </code>
          <Button variant="outline" size="sm" onClick={copyWebhook}>
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="font-medium">Fonnte:</span> Masukkan ke kolom &quot;Webhook&quot; di dashboard fonnte.com</p>
          <p><span className="font-medium">Meta Cloud:</span> Tambahkan sebagai Callback URL di App Dashboard Facebook</p>
          <p><span className="font-medium">Verify Token:</span> Isi dengan nilai <code className="bg-muted px-1 rounded">WHATSAPP_VERIFY_TOKEN</code> dari file .env.local Anda</p>
        </div>
      </div>

      {/* API Key settings */}
      <form onSubmit={handleSaveApiKeys} className="rounded-xl border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold">Konfigurasi API WhatsApp</h3>
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Pilih salah satu provider:</p>
          <p>• <span className="font-medium">Fonnte</span> — Masukkan token dari fonnte.com (API key per device)</p>
          <p>• <span className="font-medium">Meta Cloud API</span> — Masukkan Access Token dari Meta Developer App</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="waApiKey">API Key / Access Token</Label>
          <Input
            id="waApiKey"
            type="password"
            placeholder="Token dari Fonnte atau Meta Cloud API"
            value={waApiKey}
            onChange={(e) => {
              setWaApiKey(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="waToken">
            Verify Token
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">(opsional untuk Fonnte)</span>
          </Label>
          <Input
            id="waToken"
            type="password"
            placeholder="Token verifikasi webhook Meta Cloud API"
            value={waToken}
            onChange={(e) => {
              setWaToken(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            <Save className="w-4 h-4 mr-1.5" />
            {isPending ? "Menyimpan..." : "Simpan API Keys"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              Tersimpan!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
