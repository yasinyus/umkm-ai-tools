import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ScanText, Package, FlaskConical } from "lucide-react";
import { ReceiptUploader } from "@/components/hpp/receipt-uploader";
import { IngredientTable } from "@/components/hpp/ingredient-table";
import { MarginAlert } from "@/components/hpp/margin-alert";
import { AddProductForm } from "@/components/hpp/add-product-form";
import { getIngredients, getProducts } from "@/actions/hpp";

export const metadata = { title: "HPP Optimizer — SosmedAI" };

export default async function HppPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [ingredients, products] = await Promise.all([getIngredients(), getProducts()]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-lg font-semibold">AI Financial & HPP Optimizer</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Scan nota belanja → harga bahan otomatis diperbarui → HPP produk dihitung ulang.
        </p>
      </div>

      {/* ── Scan Receipt ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ScanText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Scan Nota Belanja</h3>
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <ReceiptUploader />
        </div>
      </section>

      {/* ── Margin Alert ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Produk & Margin Alert</h3>
          </div>
          <AddProductForm ingredients={ingredients} />
        </div>
        <MarginAlert products={products} />
      </section>

      {/* ── Ingredients ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Daftar Bahan Baku</h3>
          <span className="text-xs text-muted-foreground">({ingredients.length} bahan)</span>
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <IngredientTable ingredients={ingredients} />
        </div>
      </section>
    </div>
  );
}
