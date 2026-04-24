import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { scanReceiptOCR } from "@/services/ocr";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File terlalu besar (maks 10MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const result = await scanReceiptOCR(base64, mimeType);
    return Response.json(result);
  } catch (err) {
    console.error("[scan-receipt]", err);
    return Response.json({ error: "Gagal memproses gambar" }, { status: 500 });
  }
}
