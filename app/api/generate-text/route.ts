/**
 * POST /api/generate-text
 *
 * Generates a social-media caption using the Groq API (free tier).
 * Returns Server-Sent Events so the client receives tokens as they stream in.
 *
 * JSON body:
 *   productName    string   required  e.g. "Kerudung Motif Bunga"
 *   tone           string   required  "santai" | "formal" | "lucu" | "hardsell"
 *   platform       string   required  e.g. "Instagram"
 *   additionalInfo string   optional  extra context / features / price
 *
 * Required env var:
 *   GROQ_API_KEY   — free key from https://console.groq.com/keys
 */

import { NextRequest } from "next/server";
import { getGroqClient } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Model ────────────────────────────────────────────────────────────────────
// llama-3.3-70b-versatile  → highest quality, ~2–4 s
// llama-3.1-8b-instant     → fastest, ~0.5–1 s
// meta-llama/llama-4-scout-17b-16e-instruct → latest Llama 4, very fast
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// ─── Types ───────────────────────────────────────────────────────────────────

type RequestBody = {
  productName: string;
  tone: string;
  platform: string;
  additionalInfo?: string;
};

type SSEPayload =
  | { token: string }
  | { done: true }
  | { error: string };

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  "Kamu adalah copywriter media sosial profesional yang ahli membuat konten untuk UMKM Indonesia. " +
  "Tulis caption yang menarik, relevan secara budaya, dan dalam Bahasa Indonesia yang natural. " +
  "Sertakan 2–4 emoji yang tepat di dalam teks dan 3–5 hashtag relevan di bagian akhir. " +
  "Caption maksimal 3 paragraf pendek. Tulis langsung caption-nya saja tanpa penjelasan tambahan.";

const TONE_DESCRIPTIONS: Record<string, string> = {
  santai:   "santai dan ramah seperti berbicara kepada teman",
  formal:   "profesional dan formal, cocok untuk audiens korporat",
  lucu:     "lucu dan menghibur, penuh humor yang cerdas",
  hardsell: "hard sell yang mendesak, menciptakan rasa urgensi dan FOMO",
};

function buildUserMessage(body: RequestBody): string {
  const toneDesc = TONE_DESCRIPTIONS[body.tone] ?? body.tone;
  const parts = [
    `Buatkan caption dengan gaya ${toneDesc} untuk produk "${body.productName}" yang akan dipost di ${body.platform}.`,
  ];
  if (body.additionalInfo?.trim()) {
    parts.push(`Informasi tambahan: ${body.additionalInfo.trim()}`);
  }
  return parts.join("\n");
}

// ─── SSE helper ───────────────────────────────────────────────────────────────

function makeSend(controller: ReadableStreamDefaultController<Uint8Array>) {
  const enc = new TextEncoder();
  return (payload: SSEPayload) => {
    try {
      controller.enqueue(enc.encode(`data: ${JSON.stringify(payload)}\n\n`));
    } catch {
      // Client disconnected — ignore.
    }
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      {
        error:
          "GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys " +
          "and add it to your .env.local file.",
      },
      { status: 500 }
    );
  }

  // ── Parse & validate ────────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body.productName?.trim()) {
    return Response.json({ error: "Field 'productName' is required." }, { status: 400 });
  }
  if (!body.tone?.trim()) {
    return Response.json({ error: "Field 'tone' is required." }, { status: 400 });
  }
  if (!body.platform?.trim()) {
    return Response.json({ error: "Field 'platform' is required." }, { status: 400 });
  }
  if (body.productName.length > 200) {
    return Response.json(
      { error: "'productName' must be under 200 characters." },
      { status: 400 }
    );
  }

  // ── SSE stream ──────────────────────────────────────────────────────────────
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = makeSend(controller);

      try {
        const groq = getGroqClient();

        // Groq returns a real token stream — no simulation needed.
        const stream = await groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: buildUserMessage(body) },
          ],
          max_tokens: 600,
          temperature: 0.75,
          top_p: 0.9,
          stream: true,
        });

        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content;
          if (token) send({ token });
        }

        send({ done: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        send({ error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
