import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MarketComparison } from "@/components/competitors/market-comparison";
import { getUserProducts } from "@/actions/competitors";

export const metadata = { title: "Competitor Intelligence — SosmedAI" };

export default async function CompetitorsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const products = await getUserProducts();

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold">Competitor & Price Intelligence</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Bandingkan harga produk Anda dengan kompetitor di marketplace dan dapatkan rekomendasi strategi harga dari AI.
        </p>
      </div>

      <MarketComparison initialProducts={products} />
    </div>
  );
}
