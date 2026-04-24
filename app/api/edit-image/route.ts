/**
 * POST /api/edit-image
 *
 * Pipeline:
 *   1. Remove background  → remove.bg API          (free, 50 calls/month)
 *   2. Generate background → HuggingFace FLUX.1-schnell (free)
 *   3. Composite           → sharp (server-side)
 *
 * Response: Server-Sent Events so the client gets live progress updates.
 *
 * FormData fields:
 *   image   File    Product photo (JPEG / PNG / WebP, max 10 MB)
 *   prompt  string  Background description, e.g. "minimalist marble kitchen table"
 *
 * Required env vars:
 *   REMOVEBG_API_KEY — free key from https://www.remove.bg/api  (50 calls/month free)
 *   HF_TOKEN         — free token from https://huggingface.co/settings/tokens
 */

import { NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 300;

// ─── SSE event union ────────────────────────────────────────────────────────

type SSEEvent =
  | { status: "removing_bg" }
  | { status: "generating_bg" }
  | { status: "compositing" }
  | {
      status: "complete";
      removedBgUrl: string;       // base64 PNG data-URI (transparent foreground)
      finalImageDataUrl: string;  // base64 PNG data-URI (composited result)
    }
  | { status: "error"; message: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEncoder() {
  const enc = new TextEncoder();
  return (event: SSEEvent) =>
    enc.encode(`data: ${JSON.stringify(event)}\n\n`);
}

async function removeBackground(
  imageBytes: ArrayBuffer,
  mimeType: string,
  apiKey: string
): Promise<Buffer> {
  const form = new FormData();
  form.append("size", "auto");
  form.append(
    "image_file",
    new Blob([imageBytes], { type: mimeType }),
    "image"
  );

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`remove.bg failed (${res.status}): ${text}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function generateBackground(
  prompt: string,
  hfToken: string
): Promise<Buffer> {
  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({
        inputs: `${prompt}, professional product photography background, clean, high quality`,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`FLUX.1-schnell failed (${res.status}): ${text}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function compositeImages(
  fgBuf: Buffer,
  bgBuf: Buffer
): Promise<string> {
  const { width = 1024, height = 1024 } = await sharp(fgBuf).metadata();

  const bgResized = await sharp(bgBuf)
    .resize(width, height, { fit: "cover", position: "center" })
    .png()
    .toBuffer();

  const composited = await sharp(bgResized)
    .composite([{ input: fgBuf, gravity: "center" }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${composited.toString("base64")}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const removeBgKey = process.env.REMOVEBG_API_KEY;
  const hfToken = process.env.HF_TOKEN;

  if (!removeBgKey) {
    return Response.json(
      {
        error:
          "REMOVEBG_API_KEY is not configured. Get a free key at https://www.remove.bg/api " +
          "and add it to your .env.local file.",
      },
      { status: 500 }
    );
  }
  if (!hfToken) {
    return Response.json(
      {
        error:
          "HF_TOKEN is not configured. Get a free token at https://huggingface.co/settings/tokens " +
          "and add it to your .env.local file.",
      },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Could not parse request body as multipart/form-data." },
      { status: 400 }
    );
  }

  const imageFile = formData.get("image");
  const promptRaw = formData.get("prompt");

  if (!(imageFile instanceof File)) {
    return Response.json(
      { error: "Field 'image' is required and must be a file." },
      { status: 400 }
    );
  }

  const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
  if (!ALLOWED_MIME.includes(imageFile.type)) {
    return Response.json(
      { error: "Image must be JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  if (imageFile.size > 10 * 1024 * 1024) {
    return Response.json(
      { error: "Image must be smaller than 10 MB." },
      { status: 400 }
    );
  }

  if (typeof promptRaw !== "string" || !promptRaw.trim()) {
    return Response.json(
      { error: "Field 'prompt' is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  let imageBytes: ArrayBuffer;
  try {
    imageBytes = await imageFile.arrayBuffer();
  } catch {
    return Response.json(
      { error: "Could not read the uploaded image." },
      { status: 400 }
    );
  }

  const prompt = promptRaw.trim();
  const mimeType = imageFile.type;
  const encode = makeEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SSEEvent) => {
        try {
          controller.enqueue(encode(event));
        } catch {
          // Client disconnected — ignore.
        }
      };

      try {
        // ── Step 1: Remove background ───────────────────────────────────────
        send({ status: "removing_bg" });

        const fgBuf = await removeBackground(imageBytes, mimeType, removeBgKey);
        const removedBgUrl = `data:image/png;base64,${fgBuf.toString("base64")}`;

        // ── Step 2: Generate background ─────────────────────────────────────
        send({ status: "generating_bg" });

        const bgBuf = await generateBackground(prompt, hfToken);

        // ── Step 3: Composite ────────────────────────────────────────────────
        send({ status: "compositing" });

        const finalImageDataUrl = await compositeImages(fgBuf, bgBuf);

        send({ status: "complete", removedBgUrl, finalImageDataUrl });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        send({ status: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
