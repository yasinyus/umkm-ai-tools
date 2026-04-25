"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendCoachMessage, clearCoachHistory } from "@/actions/ai-coach";
import type { CoachMessageOut } from "@/actions/ai-coach";
import { BrainCircuit, User, Send, Trash2, Loader2, Sparkles } from "lucide-react";

const STARTER_PROMPTS = [
  "Produk mana yang margin-nya paling rendah dan apa strategi untuk meningkatkannya?",
  "Bagaimana cara saya meningkatkan retensi pelanggan yang mulai churn?",
  "Berikan saran strategi harga untuk bersaing dengan kompetitor.",
  "Analisis kesehatan keuangan bisnis saya berdasarkan data HPP saat ini.",
];

export function ChatInterface({ initialMessages }: { initialMessages: CoachMessageOut[] }) {
  const [messages, setMessages] = useState<CoachMessageOut[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isPending || isThinking) return;

    const optimistic: CoachMessageOut = {
      id: `opt-${Date.now()}`,
      role: "user",
      content: msg,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setIsThinking(true);

    startTransition(async () => {
      try {
        const reply = await sendCoachMessage(msg);
        setMessages((prev) => [...prev, reply]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Maaf, terjadi kesalahan. Pastikan OPENAI_API_KEY sudah dikonfigurasi.",
            createdAt: new Date(),
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    });
  }

  function handleClear() {
    startTransition(async () => {
      await clearCoachHistory();
      setMessages([]);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[750px] rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 bg-indigo-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Business Coach</p>
            <p className="text-xs text-muted-foreground">Powered by GPT-4o · Konteks bisnis Anda otomatis dimuat</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={isPending}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
            <div className="text-center space-y-2">
              <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
              <h3 className="font-semibold text-base">Tanyakan Apa Saja Tentang Bisnis Anda</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                AI Coach sudah memiliki akses ke data HPP, produk, dan pelanggan Anda untuk saran yang lebih tepat sasaran.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  disabled={isPending}
                  className="text-left text-xs p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
              >
                {msg.content}
                <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-indigo-200" : "text-muted-foreground"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span className="text-sm text-muted-foreground">AI sedang menganalisis data bisnis Anda...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3 shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            placeholder="Tanyakan tentang strategi harga, analisis margin, retensi pelanggan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="resize-none flex-1 text-sm"
            disabled={isPending || isThinking}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isPending || isThinking}
            className="h-[60px] px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Enter untuk kirim · Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
}
