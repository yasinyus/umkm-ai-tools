"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, Wand2, Download, RefreshCw, Scissors,
  Layers, Sparkles, AlertCircle, Check, X, ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveImage } from "@/actions/content";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProcessStatus =
  | "idle"
  | "removing_bg"
  | "generating_bg"
  | "compositing"
  | "complete"
  | "error";

type SSEEvent =
  | { status: "removing_bg" }
  | { status: "generating_bg" }
  | { status: "compositing" }
  | { status: "complete"; removedBgUrl: string; finalImageDataUrl: string }
  | { status: "error"; message: string };

type ResultTab = "final" | "removed";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "removing_bg" as const,
    icon: Scissors,
    label: "Hapus Background",
    sublabel: "remove.bg",
  },
  {
    id: "generating_bg" as const,
    icon: Wand2,
    label: "Buat Background",
    sublabel: "FLUX.1-schnell",
  },
  {
    id: "compositing" as const,
    icon: Layers,
    label: "Gabungkan",
    sublabel: "sharp",
  },
];

const STATUS_ORDER: ProcessStatus[] = [
  "removing_bg",
  "generating_bg",
  "compositing",
  "complete",
];

const PROMPT_SUGGESTIONS = [
  "Meja marmer putih minimalis dengan cahaya lembut",
  "Studio foto latar putih bersih profesional",
  "Taman bunga dengan bokeh yang indah",
  "Background gradient ungu ke biru yang elegan",
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stepState(
  stepId: ProcessStatus,
  currentStatus: ProcessStatus
): "done" | "active" | "pending" {
  const stepIdx = STATUS_ORDER.indexOf(stepId);
  const currIdx = STATUS_ORDER.indexOf(currentStatus);
  if (currentStatus === "complete" || currIdx > stepIdx) return "done";
  if (currIdx === stepIdx) return "active";
  return "pending";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ImageEditorForm() {
  const [file, setFile]               = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState("");
  const [prompt, setPrompt]           = useState("");
  const [isDragging, setIsDragging]   = useState(false);
  const [status, setStatus]           = useState<ProcessStatus>("idle");
  const [errorMsg, setErrorMsg]       = useState("");
  const [removedBgUrl, setRemovedBgUrl] = useState("");
  const [finalDataUrl, setFinalDataUrl] = useState("");
  const [activeTab, setActiveTab]     = useState<ResultTab>("final");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef     = useRef<AbortController | null>(null);

  // Clean up object URLs when component unmounts or new file is selected
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── File handling ──────────────────────────────────────────────────────────

  const acceptFile = useCallback((incoming: File | null) => {
    if (!incoming) return;
    if (!ALLOWED_TYPES.includes(incoming.type)) {
      alert("Format tidak didukung. Gunakan JPEG, PNG, atau WebP.");
      return;
    }
    if (incoming.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB} MB.`);
      return;
    }
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setFile(incoming);
    setPreviewUrl(URL.createObjectURL(incoming));
    // Reset results when a new file is loaded
    setStatus("idle");
    setRemovedBgUrl("");
    setFinalDataUrl("");
  }, [previewUrl]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      acceptFile(e.dataTransfer.files[0] ?? null);
    },
    [acceptFile]
  );

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setStatus("idle");
    setRemovedBgUrl("");
    setFinalDataUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Process ────────────────────────────────────────────────────────────────

  async function handleProcess() {
    if (!file || !prompt.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("removing_bg");
    setErrorMsg("");
    setRemovedBgUrl("");
    setFinalDataUrl("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("prompt", prompt.trim());

    try {
      const response = await fetch("/api/edit-image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `Server error ${response.status}`);
      }

      if (!response.body) throw new Error("No response body from server.");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          for (const line of part.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            let event: SSEEvent;
            try {
              event = JSON.parse(line.slice(6)) as SSEEvent;
            } catch {
              continue;
            }

            switch (event.status) {
              case "removing_bg":
                setStatus("removing_bg");
                break;
              case "generating_bg":
                setStatus("generating_bg");
                break;
              case "compositing":
                setStatus("compositing");
                break;
              case "complete":
                setRemovedBgUrl(event.removedBgUrl);
                setFinalDataUrl(event.finalImageDataUrl);
                setStatus("complete");
                setActiveTab("final");
                saveImage({
                  imageUrl: event.finalImageDataUrl,
                  prompt: prompt.trim(),
                }).catch(() => {});
                break;
              case "error":
                throw new Error(event.message);
            }
          }
        }
      }

      if (status !== "complete") setStatus("complete");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.");
      setStatus("error");
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const isProcessing = ["removing_bg", "generating_bg", "compositing"].includes(status);
  const hasResult    = status === "complete" && finalDataUrl;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="grid lg:grid-cols-2 gap-4 items-start">

      {/* ── LEFT: Upload + Prompt ───────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Upload zone */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide">
            Foto Produk <span className="text-destructive">*</span>
          </Label>

          <div
            role="button"
            tabIndex={0}
            onClick={() => !file && fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && !file && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-xl border-2 border-dashed transition-all overflow-hidden",
              "min-h-[220px] flex items-center justify-center",
              file
                ? "border-primary/40 bg-muted/20 cursor-default"
                : "cursor-pointer hover:border-primary/50 hover:bg-muted/30",
              isDragging && "border-primary bg-primary/5 scale-[1.01]",
              isProcessing && "pointer-events-none opacity-70"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
            />

            {file && previewUrl ? (
              <>
                {/* Image preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain max-h-[280px] p-2"
                />
                {/* File info bar */}
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 bg-background/90 backdrop-blur-sm px-3 py-2 text-xs border-t">
                  <span className="font-medium truncate max-w-[160px]">{file.name}</span>
                  <span className="text-muted-foreground shrink-0">{formatBytes(file.size)}</span>
                  {!isProcessing && (
                    <button
                      onClick={handleRemoveFile}
                      className="shrink-0 rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="sr-only">Hapus gambar</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center gap-3 p-8 text-center pointer-events-none select-none">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Drag & drop foto di sini</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    atau klik untuk pilih dari perangkat
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG · PNG · WebP · maks {MAX_SIZE_MB} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Change photo button (shown when file is loaded) */}
          {file && !isProcessing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary hover:underline"
            >
              Ganti foto
            </button>
          )}
        </div>

        {/* Background prompt */}
        <div className="space-y-1.5">
          <Label
            htmlFor="bg-prompt"
            className="text-xs font-semibold uppercase tracking-wide"
          >
            Deskripsi Background Baru <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="bg-prompt"
            placeholder="Contoh: meja marmer putih minimalis dengan cahaya lembut dan bunga putih..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
            rows={3}
            className="text-sm resize-none"
          />

          {/* Prompt suggestions */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {PROMPT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={isProcessing}
                onClick={() => setPrompt(s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs border transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  prompt === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Process button */}
        <Button
          className="w-full h-10 gap-2 font-semibold"
          onClick={handleProcess}
          disabled={!file || !prompt.trim() || isProcessing}
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? "Memproses..." : "Hapus Background & Terapkan AI"}
        </Button>
      </div>

      {/* ── RIGHT: Progress / Result ─────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col min-h-[420px]">

        {/* ── Idle state ──────────────────────────────────────────────────── */}
        {status === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Wand2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Hasil akan muncul di sini</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                Upload foto produk, tulis deskripsi background, lalu klik proses.
              </p>
            </div>
            {/* Mini pipeline preview */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Hapus BG
              </span>
              <span>→</span>
              <span className="flex items-center gap-1">
                <Wand2 className="w-3 h-3" /> Buat BG
              </span>
              <span>→</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" /> Gabungkan
              </span>
            </div>
          </div>
        )}

        {/* ── Processing: step indicator ───────────────────────────────────── */}
        {isProcessing && (
          <div className="flex-1 flex flex-col justify-center gap-6 p-8">
            <div>
              <p className="text-sm font-semibold text-center">Memproses gambar Anda…</p>
              <p className="text-xs text-muted-foreground text-center mt-0.5">
                Ini mungkin memakan waktu 30–90 detik
              </p>
            </div>

            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const state  = stepState(step.id, status);
                const Icon   = step.icon;
                const isLast = i === STEPS.length - 1;

                return (
                  <div key={step.id} className="flex gap-3">
                    {/* Icon column */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                          state === "done"   && "bg-emerald-500 text-white",
                          state === "active" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                          state === "pending"&& "bg-muted text-muted-foreground"
                        )}
                      >
                        {state === "done" ? (
                          <Check className="w-4 h-4" />
                        ) : state === "active" ? (
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "w-0.5 h-6 mt-1 rounded-full transition-colors",
                            state === "done" ? "bg-emerald-400" : "bg-border"
                          )}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="pb-1 pt-1">
                      <p
                        className={cn(
                          "text-sm font-medium leading-none",
                          state === "active" && "text-primary",
                          state === "pending" && "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {step.sublabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────────────────── */}
        {status === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">Terjadi kesalahan</p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcess}
              disabled={!file || !prompt.trim()}
              className="gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </Button>
          </div>
        )}

        {/* ── Complete: result viewer ───────────────────────────────────────── */}
        {hasResult && (
          <div className="flex flex-col flex-1">
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-4 py-2.5 border-b bg-muted/30">
              <button
                onClick={() => setActiveTab("final")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === "final"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ✨ Hasil Akhir
              </button>
              <button
                onClick={() => setActiveTab("removed")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === "removed"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                🔍 Tanpa Background
              </button>
            </div>

            {/* Image display */}
            <div className="flex-1 flex items-center justify-center p-4 bg-[repeating-conic-gradient(#f0f0f0_0%_25%,#fafafa_0%_50%)] bg-[length:20px_20px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeTab === "final" ? finalDataUrl : removedBgUrl}
                alt={activeTab === "final" ? "Hasil akhir" : "Tanpa background"}
                className="max-h-[280px] w-auto object-contain rounded-lg shadow-md"
              />
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatus("idle");
                  setRemovedBgUrl("");
                  setFinalDataUrl("");
                }}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Buat Ulang
              </Button>

              <Button
                size="sm"
                onClick={() =>
                  downloadDataUrl(
                    activeTab === "final" ? finalDataUrl : removedBgUrl,
                    activeTab === "final"
                      ? "sosmedai-final.png"
                      : "sosmedai-no-bg.png"
                  )
                }
                className="gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download{" "}
                {activeTab === "final" ? "Hasil Akhir" : "Tanpa BG"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
