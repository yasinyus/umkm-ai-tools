"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCatalogPage } from "@/actions/catalog";

export function DeleteCatalogButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={() => startTransition(async () => { await deleteCatalogPage(id); })}
      aria-label="Hapus katalog"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}
