"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateAndSendBackup } from "@/actions/backup";
import { Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function BackupButton() {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleBackup() {
    startTransition(async () => {
      try {
        const res = await generateAndSendBackup();
        setResult(res);
      } catch (err) {
        setResult({ ok: false, message: String(err instanceof Error ? err.message : err) });
      }
      setTimeout(() => setResult(null), 5000);
    });
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className={`flex items-center gap-1.5 text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
          {result.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {result.message}
        </span>
      )}
      <Button onClick={handleBackup} disabled={isPending} variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5 mr-1.5" />
        )}
        Backup Sekarang
      </Button>
    </div>
  );
}
