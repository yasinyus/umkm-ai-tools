import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { incrementCatalogViews } from "@/actions/catalog";
import { generateWhatsAppLink } from "@/services/whatsapp";
import { MessageCircle, Store, Copy } from "lucide-react";
import { CopyCatalogLink } from "@/components/catalog/copy-catalog-link";
import type { AiContent } from "@prisma/client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await prisma.catalogPage.findUnique({ where: { slug } });
  if (!page) return { title: "Katalog tidak ditemukan" };
  return {
    title: `${page.title} — Katalog Digital`,
    description: page.description ?? undefined,
  };
}

export default async function PublicCatalogPage({ params }: PageProps) {
  const { slug } = await params;

  const catalog = await prisma.catalogPage.findUnique({ where: { slug } });
  if (!catalog || !catalog.isPublic) notFound();

  // Increment view counter (fire-and-forget)
  incrementCatalogViews(slug).catch(() => {});

  const contentIds = Array.isArray(catalog.contentIds) ? (catalog.contentIds as string[]) : [];
  const contents: AiContent[] = contentIds.length
    ? await prisma.aiContent.findMany({ where: { id: { in: contentIds } } })
    : [];

  // Sort by the order in contentIds
  const sorted = contentIds
    .map((id) => contents.find((c) => c.id === id))
    .filter(Boolean) as AiContent[];

  const images = sorted.filter((c) => c.type === "IMAGE");
  const captions = sorted.filter((c) => c.type === "CAPTION");

  const pageUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/catalog/${slug}`;

  const waLink = catalog.waNumber
    ? generateWhatsAppLink({
        phone: catalog.waNumber,
        businessName: catalog.title,
        catalogUrl: pageUrl,
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm truncate">{catalog.title}</span>
          </div>
          <CopyCatalogLink url={pageUrl} />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-white border-b py-8">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">{catalog.title}</h1>
          {catalog.description && (
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">{catalog.description}</p>
          )}
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi via WhatsApp
            </a>
          )}
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* ── Product images ── */}
        {images.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Foto Produk</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((item) => (
                <div key={item.id} className="rounded-xl overflow-hidden border bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl!}
                    alt={item.title ?? "Produk"}
                    className="w-full aspect-square object-cover"
                  />
                  {item.title && (
                    <div className="p-2">
                      <p className="text-xs font-medium text-center truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Captions ── */}
        {captions.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Konten & Promosi</h2>
            <div className="space-y-3">
              {captions.map((item) => (
                <div key={item.id} className="rounded-xl border bg-white shadow-sm p-4 space-y-2">
                  {item.title && <p className="font-semibold text-sm">{item.title}</p>}
                  {item.platform && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      {item.platform}
                    </span>
                  )}
                  {item.text && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.text}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {sorted.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">Katalog ini belum memiliki konten.</p>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t bg-white py-6 text-center text-xs text-gray-400 space-y-1">
        <p>Dibuat dengan <span className="font-semibold text-indigo-600">SosmedAI</span></p>
        <p>© {new Date().getFullYear()} {catalog.title}</p>
      </footer>
    </div>
  );
}
