import Groq from "groq-sdk";

let _client: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to your .env.local file. " +
        "Get a free key at https://console.groq.com/keys"
    );
  }
  if (!_client) {
    _client = new Groq({ apiKey });
  }
  return _client;
}
