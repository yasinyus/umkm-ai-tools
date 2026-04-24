"use client";

import { useState, useRef } from "react";
import {
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { saveCaption } from "@/actions/content";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = ["Instagram", "TikTok", "Facebook", "Twitter/X", "LinkedIn"] as const;

const TONES = [
  { value: "santai",   label: "😊 Santai",    desc: "Ramah & kasual" },
  { value: "formal",   label: "💼 Formal",    desc: "Profesional" },
  { value: "lucu",     label: "😄 Lucu",      desc: "Humor & playful" },
  { value: "hardsell", label: "🔥 Hard Sell", desc: "Urgensi & FOMO" },
] as const;

type ToneValue = (typeof TONES)[number]["value"];
type Platform  = (typeof PLATFORMS)[number];

// ─── SSE parsing helpers ──────────────────────────────────────────────────────

type SSEPayload =
  | { token: string }
  | { done: true }
  | { error: string };

function parseLine(line: string): SSEPayload | null {
  if (!line.startsWith("data: ")) return null;
  try {
    return JSON.parse(line.slice(6)) as SSEPayload;
  } catch {
    return null;
  }
}

// ─── Status type ─────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "streaming" | "done" | "error";

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-xs font-semibold text-foreground uppercase tracking-wide"
    >
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CaptionForm() {
  const [productName, setProductName]     = useState("");
  const [tone, setTone]                   = useState<ToneValue>("santai");
  const [platform, setPlatform]           = useState<Platform>("Instagram");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [status, setStatus]               = useState<Status>("idle");
  const [result, setResult]               = useState("");
  const [errorMsg, setErrorMsg]           = useState("");
  const [copied, setCopied]               = useState(false);

  const abortRef    = useRef<AbortController | null>(null);
  const fullTextRef = useRef("");

  // ── Generate ─────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!productName.trim()) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setResult("");
    setErrorMsg("");
    setCopied(false);
    fullTextRef.current = "";

    try {
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          productName: productName.trim(),
          tone,
          platform,
          additionalInfo: additionalInfo.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Server error" }));
        throw new Error((err as { error: string }).error ?? "Server error");
      }

      if (!response.body) throw new Error("No response body from server.");

      setStatus("streaming");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines.
        // We split on \n\n and keep any trailing incomplete event in buffer.
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          for (const line of part.split("\n")) {
            const payload = parseLine(line);
            if (!payload) continue;

            if ("token" in payload) {
              fullTextRef.current += payload.token;
              setResult((prev) => prev + payload.token);
            } else if ("done" in payload) {
              setStatus("done");
              saveCaption({
                text: fullTextRef.current,
                platform,
                productName: productName.trim(),
                tone,
              }).catch(() => {});
            } else if ("error" in payload) {
              throw new Error(payload.error);
            }
          }
        }
      }

      // If stream closed without a done event, still mark as done.
      setStatus((s) => (s === "streaming" ? "done" : s));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.");
      setStatus("error");
    }
  }

  // ── Copy ──────────────────────────────────────────────────────────────────

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const isGenerating = status === "loading" || status === "streaming";
  const hasResult    = result.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="grid md:grid-cols-2 gap-4 items-start">

      {/* ── LEFT: Form ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm p-5 space-y-5">

        {/* Product name */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="productName" required>
            Nama Produk
          </FieldLabel>
          <Input
            id="productName"
            placeholder="Contoh: Kerudung Motif Bunga"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            maxLength={200}
            disabled={isGenerating}
            className="h-9 text-sm"
          />
        </div>

        {/* Platform + Tone row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="platform">Platform</FieldLabel>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              disabled={isGenerating}
              className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="tone">Tone / Gaya</FieldLabel>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as ToneValue)}
              disabled={isGenerating}
              className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tone pills (visual feedback) */}
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              disabled={isGenerating}
              onClick={() => setTone(t.value)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                "border disabled:cursor-not-allowed disabled:opacity-50",
                tone === t.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {t.label}
              <span className="text-[10px] opacity-70 hidden sm:inline">{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Additional info */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="additionalInfo">
            Info Tambahan
            <span className="text-muted-foreground font-normal ml-1">(opsional)</span>
          </FieldLabel>
          <Textarea
            id="additionalInfo"
            placeholder="Contoh: bahan katun premium, harga 75rb, tersedia 5 warna, gratis ongkir..."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            disabled={isGenerating}
            rows={3}
            className="text-sm resize-none"
          />
        </div>

        {/* Generate button */}
        <Button
          className="w-full gap-2 h-10 font-semibold"
          onClick={handleGenerate}
          disabled={isGenerating || !productName.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {status === "loading" ? "Menghubungi AI..." : "Generating..."}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Caption
            </>
          )}
        </Button>
      </div>

      {/* ── RIGHT: Result ────────────────────────────────────────────────── */}
      <div
        className={cn(
          "rounded-2xl border bg-card shadow-sm flex flex-col min-h-[360px] transition-colors",
          status === "error" && "border-destructive/40 bg-destructive/5"
        )}
      >
        {/* Result header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hasil Caption
          </span>
          {hasResult && status !== "error" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={cn(
                "h-7 gap-1.5 text-xs transition-colors",
                copied && "text-emerald-600 hover:text-emerald-600"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>

        {/* Result body */}
        <div className="flex-1 p-5">

          {/* Idle / Empty state */}
          {status === "idle" && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Caption akan muncul di sini</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Isi form di sebelah kiri dan klik Generate.
                </p>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {status === "loading" && (
            <div className="space-y-2.5 animate-pulse">
              <div className="h-3 rounded-full bg-muted w-11/12" />
              <div className="h-3 rounded-full bg-muted w-9/12" />
              <div className="h-3 rounded-full bg-muted w-10/12" />
              <div className="h-3 rounded-full bg-muted w-7/12" />
              <div className="h-3 rounded-full bg-muted w-8/12 mt-4" />
              <div className="h-3 rounded-full bg-muted w-11/12" />
            </div>
          )}

          {/* Streaming / Done result */}
          {(status === "streaming" || status === "done") && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {result}
              {status === "streaming" && (
                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-text-bottom animate-[blink_1s_step-end_infinite]" />
              )}
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-semibold text-destructive">Terjadi kesalahan</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">{errorMsg}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="mt-1 text-xs"
              >
                Coba Lagi
              </Button>
            </div>
          )}
        </div>

        {/* Footer: character count */}
        {hasResult && status === "done" && (
          <div className="px-5 py-2.5 border-t">
            <p className="text-xs text-muted-foreground">
              {result.length} karakter · {result.split(/\s+/).filter(Boolean).length} kata
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
