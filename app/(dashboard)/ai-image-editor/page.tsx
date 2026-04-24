import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageEditorForm } from "@/components/ai-image-editor/image-editor-form";

export const metadata = {
  title: "AI Image Editor — SosmedAI",
};

export default function AIImageEditorPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Image Editor</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hapus background foto produk dan ganti dengan background baru menggunakan AI.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 shrink-0">
          <Sparkles className="w-3 h-3" />
          Replicate AI
        </Badge>
      </div>

      <ImageEditorForm />
    </div>
  );
}
