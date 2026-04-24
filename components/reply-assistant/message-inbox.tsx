"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus, Sparkles, Trash2, Loader2, Plus, X, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addMessage, deleteMessage } from "@/actions/reply-assistant";
import { MagicReplyPanel } from "./magic-reply-panel";
import type { MessageHistory } from "@prisma/client";
import type { ReplyOption } from "@/services/reply-generator";

const SAMPLE_MESSAGES = [
  { senderName: "Rina Sari", senderPhone: "081234567890", message: "Min, dimsumnya ready? Kirim ke Jaksel berapa ongkirnya ya?" },
  { senderName: "Budi Santoso", senderPhone: "082345678901", message: "Harga nasi box untuk 50 pax berapa kak? Buat acara kantor minggu depan." },
  { senderName: "Dewi", senderPhone: "083456789012", message: "Kak ada promo gak? Mau order buat arisan ibu-ibu." },
];

function formatTime(d: Date) {
  const now = new Date();
  const date = new Date(d);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}j lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(date);
}

function AddMessageForm({ onClose }: { onClose: () => void }) {
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!senderName.trim() || !message.trim()) return;
    startTransition(async () => {
      await addMessage({ senderName: senderName.trim(), senderPhone: senderPhone.trim() || undefined, message: message.trim() });
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-md">
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <MessageSquarePlus className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Tambah Pesan Masuk</h2>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Nama Pengirim *</Label>
            <Input placeholder="misal: Budi Santoso" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">No. WhatsApp <span className="font-normal text-muted-foreground">(opsional)</span></Label>
            <Input placeholder="misal: 08123456789" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">Isi Pesan *</Label>
            <Textarea placeholder="Ketik atau paste pesan dari calon pembeli..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="text-sm resize-none" />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Atau coba contoh pesan:</p>
            <div className="space-y-1">
              {SAMPLE_MESSAGES.map((s, i) => (
                <button
                  key={i}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors"
                  onClick={() => { setSenderName(s.senderName); setSenderPhone(s.senderPhone); setMessage(s.message); }}
                >
                  <span className="font-medium">{s.senderName}:</span> {s.message}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isPending}>Batal</Button>
          <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={!senderName.trim() || !message.trim() || isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Tambah
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteBtn({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); startTransition(() => deleteMessage(id)); }}
      disabled={pending}
      className="text-muted-foreground hover:text-destructive disabled:opacity-40 shrink-0"
    >
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}

export function MessageInbox({ messages }: { messages: MessageHistory[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<MessageHistory | null>(null);

  const unread = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="space-y-4">
      {addOpen && <AddMessageForm onClose={() => setAddOpen(false)} />}
      {selected && (
        <MagicReplyPanel
          messageId={selected.id}
          senderName={selected.senderName}
          senderPhone={selected.senderPhone}
          messageText={selected.message}
          existingReplies={selected.replies as ReplyOption[] | null}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Pesan Masuk</h3>
          {unread > 0 && (
            <Badge className="h-5 px-1.5 text-xs bg-primary text-primary-foreground">{unread}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Tambah Pesan
        </Button>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageSquarePlus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm">Belum ada pesan masuk</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Tambah pesan dari calon pembeli untuk mencoba Magic Reply.</p>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Pesan Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border bg-card shadow-sm p-4 flex gap-3 cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-colors ${
                msg.status === "UNREAD" ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => setSelected(msg)}
            >
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-bold">
                {msg.senderName[0]?.toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-semibold truncate ${msg.status === "UNREAD" ? "text-foreground" : "text-muted-foreground"}`}>
                    {msg.senderName}
                  </span>
                  {msg.senderPhone && (
                    <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0">
                      <Phone className="w-2.5 h-2.5" />
                      {msg.senderPhone}
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{formatTime(msg.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{msg.message}</p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <DeleteBtn id={msg.id} />
                <button
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                  onClick={(e) => { e.stopPropagation(); setSelected(msg); }}
                >
                  <Sparkles className="w-3 h-3" />
                  Magic Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
