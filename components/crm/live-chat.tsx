"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleBotForCustomer } from "@/actions/crm";
import { Bot, BotOff, User, RefreshCw } from "lucide-react";

type ChatMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  message: string;
  createdAt: Date;
};

type Props = {
  customerId: string;
  customerName: string;
  isBotActive: boolean;
  initialMessages: ChatMessage[];
};

export function LiveChat({ customerId, customerName, isBotActive: initialBotActive, initialMessages }: Props) {
  const [botActive, setBotActive] = useState(initialBotActive);
  const [messages, setMessages] = useState(initialMessages);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleToggleBot() {
    startTransition(async () => {
      await toggleBotForCustomer(customerId, !botActive);
      setBotActive((v) => !v);
    });
  }

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <div className="rounded-xl border bg-card flex flex-col h-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">{customerName}</p>
            <div className="flex items-center gap-1.5">
              {botActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-emerald-600">Bot Aktif</p>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <p className="text-xs text-muted-foreground">Bot Nonaktif</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            variant={botActive ? "destructive" : "default"}
            size="sm"
            onClick={handleToggleBot}
            disabled={isPending}
          >
            {botActive ? (
              <>
                <BotOff className="w-3.5 h-3.5 mr-1.5" />
                Take Over
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 mr-1.5" />
                Aktifkan Bot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            Belum ada percakapan.
          </p>
        )}
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  msg.direction === "OUTBOUND"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
              >
                {msg.direction === "OUTBOUND" && (
                  <div className="flex items-center gap-1 mb-1 opacity-75">
                    <Bot className="w-3 h-3" />
                    <span className="text-[10px] font-medium">AI Bot</span>
                  </div>
                )}
                <p>{msg.message}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.direction === "OUTBOUND" ? "text-indigo-200" : "text-muted-foreground"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Footer notice */}
      {!botActive && (
        <div className="px-4 py-2 border-t bg-amber-50 shrink-0">
          <p className="text-xs text-amber-700 text-center">
            Bot dinonaktifkan — percakapan dipantau secara manual.
          </p>
        </div>
      )}
    </div>
  );
}
