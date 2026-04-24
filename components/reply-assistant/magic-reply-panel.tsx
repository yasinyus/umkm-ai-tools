"use client";

import { useState, useTransition } from "react";
import { Sparkles, Copy, Check, MessageCircle, Loader2, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateRepliesForMessage } from "@/actions/reply-assistant";
import { generateWhatsAppLink } from "@/services/whatsapp";
import type { ReplyOption } from "@/services/reply-generator";

const TONE_STYLES: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  ramah: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    text: "text-pink-900",
  },
  informatif: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    text: "text-blue-900",
  },
  urgency: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    text: "text-orange-900",
  },
};

function ReplyCard({ reply, senderPhone }: { reply: ReplyOption; senderPhone?: string | null }) {
  const [copied, setCopied] = useState(false);
  const style = TONE_STYLES[reply.tone] ?? TONE_STYLES.informatif;

  function handleCopy() {
    navigator.clipboard.writeText(reply.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waLink = senderPhone
    ? generateWhatsAppLink({ phone: senderPhone, caption: reply.text })
    : null;

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${style.bg} ${style.border}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style.badge}`}>
          {reply.label}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
              copied
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-white/70 hover:bg-white text-muted-foreground hover:text-foreground border-white/80"
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Tersalin" : "Copy"}
          </button>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Kirim WA
            </a>
          )}
        </div>
      </div>
      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${style.text}`}>{reply.text}</p>
    </div>
  );
}

interface Props {
  messageId: string;
  senderName: string;
  senderPhone?: string | null;
  messageText: string;
  existingReplies?: ReplyOption[] | null;
  onClose: () => void;
}

export function MagicReplyPanel({
  messageId,
  senderName,
  senderPhone,
  messageText,
  existingReplies,
  onClose,
}: Props) {
  const [replies, setReplies] = useState<ReplyOption[] | null>(
    Array.isArray(existingReplies) && existingReplies.length > 0 ? existingReplies : null
  );
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateRepliesForMessage(messageId);
      setReplies(result.replies);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl border shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm">Magic Reply</h2>
            <p className="text-xs text-muted-foreground truncate">Dari: {senderName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incoming message */}
        <div className="px-5 py-3 bg-muted/30 border-b shrink-0">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Pesan masuk</p>
          <p className="text-sm text-foreground leading-relaxed line-clamp-3">{messageText}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!replies ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                AI akan membuat 3 balasan berdasarkan pesan dan konteks produk Anda.
              </p>
              <Button onClick={handleGenerate} disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isPending ? "Membuat balasan..." : "Generate Magic Reply"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">3 Opsi Balasan AI</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={handleGenerate}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Buat Ulang
                </Button>
              </div>
              {replies.map((r, i) => (
                <ReplyCard key={i} reply={r} senderPhone={senderPhone} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
