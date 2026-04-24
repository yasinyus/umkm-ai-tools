import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sparkles, MessageSquare, ImageIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteContentButton } from "@/components/history/delete-content-button";
import { PostLaterButton } from "@/components/scheduler/post-later-button";

export const metadata = { title: "History — SosmedAI" };

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const contents = await prisma.aiContent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Semua konten AI yang pernah kamu buat tersimpan di sini.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 shrink-0">
          <Sparkles className="w-3 h-3" />
          {contents.length} item
        </Badge>
      </div>

      {contents.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm">Belum ada riwayat</p>
          <p className="text-xs text-muted-foreground mt-1">
            Buat caption atau edit gambar pertamamu untuk memulai.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contents.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border bg-card shadow-sm p-4 flex gap-4"
            >
              {/* Type icon */}
              <div className="shrink-0 mt-0.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    item.type === "CAPTION"
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {item.type === "CAPTION" ? (
                    <MessageSquare className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs h-5 px-1.5 shrink-0">
                    {item.type === "CAPTION" ? "Caption" : "Image"}
                  </Badge>
                  {item.platform && (
                    <Badge variant="outline" className="text-xs h-5 px-1.5 shrink-0">
                      {item.platform}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {item.title && (
                  <p className="text-sm font-medium truncate mb-1">{item.title}</p>
                )}

                {item.type === "CAPTION" && item.text && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.text}
                  </p>
                )}

                {item.type === "IMAGE" && item.imageUrl && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title ?? "AI Image"}
                      className="h-24 w-24 rounded-lg object-cover border"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0 flex flex-col gap-1.5 items-end">
                <DeleteContentButton id={item.id} />
                <PostLaterButton contentId={item.id} currentStatus={item.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
