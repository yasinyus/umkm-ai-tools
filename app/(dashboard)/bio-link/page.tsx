import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBioLink } from "@/actions/bio-link";
import { BioLinkForm } from "@/components/bio-link/bio-link-form";
import { Link2, Eye } from "lucide-react";

export const metadata = { title: "Smart Bio-Link — SosmedAI" };

export default async function BioLinkPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const bioLink = await getBioLink();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-semibold">Smart Bio-Link Generator</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Buat halaman publik UMKM Anda dalam hitungan menit. Bagikan link ke bio Instagram, caption TikTok, atau status WhatsApp.
        </p>
      </div>

      {bioLink && (
        <div className="rounded-xl border bg-violet-50/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-700">{bioLink.storeName}</p>
            <code className="text-xs text-violet-600">/p/{bioLink.slug}</code>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            {bioLink.views.toLocaleString("id-ID")} tayangan
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-5">
        <BioLinkForm initial={bioLink} />
      </div>
    </div>
  );
}
