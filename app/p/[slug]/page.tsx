import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { incrementBioLinkViews } from "@/actions/bio-link";
import { MessageCircle, Music2, Globe, Zap, ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const bioLink = await prisma.bioLink.findUnique({ where: { slug } });
  if (!bioLink) return { title: "Halaman tidak ditemukan" };
  return {
    title: `${bioLink.storeName} — Bio Link`,
    description: bioLink.tagline ?? bioLink.description ?? undefined,
  };
}

export default async function PublicBioLinkPage({ params }: PageProps) {
  const { slug } = await params;

  const bioLink = await prisma.bioLink.findUnique({ where: { slug } });
  if (!bioLink || !bioLink.isPublic) notFound();

  // Increment view counter (fire-and-forget)
  incrementBioLinkViews(slug).catch(() => {});

  // Also fetch store products for display
  const products = await prisma.product.findMany({
    where: { userId: bioLink.userId },
    select: { name: true, sellingPrice: true },
    take: 12,
  });

  type LinkItem = { label: string; href: string; icon: LucideIcon; color: string };

  const links: LinkItem[] = [
    bioLink.waNumber
      ? { label: "Pesan via WhatsApp", href: `https://wa.me/${bioLink.waNumber.replace(/\D/g, "")}`, icon: MessageCircle, color: "bg-emerald-500 hover:bg-emerald-600 text-white" }
      : null,
    bioLink.igHandle
      ? { label: `Instagram ${bioLink.igHandle}`, href: `https://instagram.com/${bioLink.igHandle.replace("@", "")}`, icon: ExternalLink, color: "bg-pink-500 hover:bg-pink-600 text-white" }
      : null,
    bioLink.tiktokHandle
      ? { label: `TikTok ${bioLink.tiktokHandle}`, href: `https://tiktok.com/@${bioLink.tiktokHandle.replace("@", "")}`, icon: Music2, color: "bg-black hover:bg-gray-900 text-white" }
      : null,
    bioLink.fbHandle
      ? { label: "Facebook", href: bioLink.fbHandle.startsWith("http") ? bioLink.fbHandle : `https://${bioLink.fbHandle}`, icon: ExternalLink, color: "bg-blue-600 hover:bg-blue-700 text-white" }
      : null,
    bioLink.websiteUrl
      ? { label: "Website / Toko Online", href: bioLink.websiteUrl.startsWith("http") ? bioLink.websiteUrl : `https://${bioLink.websiteUrl}`, icon: Globe, color: "bg-gray-800 hover:bg-gray-900 text-white" }
      : null,
  ].filter((l): l is LinkItem => l !== null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero */}
      <section className="max-w-md mx-auto px-4 pt-14 pb-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">{bioLink.storeName}</h1>
        {bioLink.tagline && (
          <p className="text-indigo-600 font-semibold text-sm mb-3">{bioLink.tagline}</p>
        )}
        {bioLink.description && (
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">{bioLink.description}</p>
        )}
      </section>

      {/* Links */}
      <section className="max-w-md mx-auto px-4 space-y-3 pb-8">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md ${link.color}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.label}
            </a>
          );
        })}
        {links.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Belum ada tombol kontak yang ditambahkan.</p>
        )}
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="max-w-md mx-auto px-4 pb-10">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Menu & Harga</h2>
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            {products.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? "border-t" : ""}`}
              >
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-sm font-bold text-indigo-700">
                  Rp {p.sellingPrice.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="pb-8 text-center text-xs text-gray-400">
        <p>
          Dibuat dengan{" "}
          <a href="/" className="font-semibold text-indigo-500 hover:text-indigo-700">
            SosmedAI
          </a>
          {" "}· Platform AI untuk UMKM Indonesia
        </p>
      </footer>
    </div>
  );
}
