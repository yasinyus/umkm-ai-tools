import Replicate from "replicate";

// Singleton — one client per Node.js process
let _client: Replicate | null = null;

export function getReplicateClient(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      "REPLICATE_API_TOKEN is not set. Add it to your .env.local file."
    );
  }
  if (!_client) {
    _client = new Replicate({ auth: token });
  }
  return _client;
}

// Replicate FileOutput has a .url() method that returns a URL object.
// This helper normalises any output format (FileOutput | URL | string) to a plain string.
export function resolveOutputUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (output instanceof URL) return output.href;
  if (output !== null && typeof output === "object") {
    if ("url" in output && typeof (output as Record<string, unknown>).url === "function") {
      const url = (output as { url(): URL }).url();
      return url instanceof URL ? url.href : String(url);
    }
    // toString() fallback (FileOutput implements ReadableStream which has toString)
    if ("toString" in output) {
      const str = String(output);
      if (str.startsWith("http")) return str;
    }
  }
  throw new Error(
    `Cannot resolve a URL from Replicate output: ${JSON.stringify(output)}`
  );
}
