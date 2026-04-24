import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Store, Copy, Trash2, Eye, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateCatalogDialog } from "@/components/catalog/create-catalog-dialog";
import { DeleteCatalogButton } from "@/components/catalog/delete-catalog-button";
import { CopyCatalogLink } from "@/components/catalog/copy-catalog-link";

export const metadata = { title: "Katalog Digital — SosmedAI" };

export default async function CatalogDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [catalogPages, availableContent] = await Promise.all([
    prisma.catalogPage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiContent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Katalog Digital</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Buat mini landing page dari konten AI kamu dan bagikan ke bio Instagram atau WhatsApp.
          </p>
        </div>
        <CreateCatalogDialog availableContent={availableContent} />
      </div>

      {catalogPages.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm">Belum ada katalog</p>
          <p className="text-xs text-muted-foreground mt-1">
            Klik &quot;Buat Katalog Baru&quot; untuk membuat landing page produk pertamamu.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {catalogPages.map((catalog) => {
            const contentIds = Array.isArray(catalog.contentIds) ? catalog.contentIds : [];
            const publicUrl = `${baseUrl}/catalog/${catalog.slug}`;

            return (
              <div key={catalog.id} className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{catalog.title}</h3>
                    {catalog.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{catalog.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                    <Eye className="w-3 h-3" />
                    {catalog.views}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span>{contentIds.length} konten</span>
                  {catalog.waNumber && <span>· WA: {catalog.waNumber}</span>}
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-mono text-muted-foreground border overflow-hidden">
                  <span className="truncate">/catalog/{catalog.slug}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <CopyCatalogLink url={publicUrl} />
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview
                  </a>
                  <div className="ml-auto">
                    <DeleteCatalogButton id={catalog.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
