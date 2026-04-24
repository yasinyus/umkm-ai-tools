import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrendWatch } from "@/components/trends/trend-watch";

export const metadata = { title: "Trend Watch — SosmedAI" };

export default function TrendsPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Trend Watch</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pantau tren produk marketplace dan dapatkan rekomendasi konten dari AI secara real-time.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 shrink-0">
          <TrendingUp className="w-3 h-3" />
          Tokopedia & Shopee
        </Badge>
      </div>

      <TrendWatch />
    </div>
  );
}
