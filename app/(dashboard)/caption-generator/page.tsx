import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CaptionForm } from "@/components/caption-generator/caption-form";

export const metadata = {
  title: "Caption Generator — SosmedAI",
};

export default function CaptionGeneratorPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Caption Generator</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Buat caption menarik untuk semua platform media sosial dengan AI.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 shrink-0">
          <Sparkles className="w-3 h-3" />
          AI-Powered
        </Badge>
      </div>

      <CaptionForm />
    </div>
  );
}
