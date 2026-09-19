import { TypeSafeClient } from "@typesafe-ai/sdk";

let client: TypeSafeClient | null = null;

export function getTypeSafeClient(): TypeSafeClient {
  const apiKey = process.env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing TYPESAFE_API_KEY. Add it to .env.local and restart the dev server.",
    );
  }

  if (!client) {
    client = new TypeSafeClient({
      apiKey,
      defaultModel: "jev-latest",
    });
  }

  return client;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.TYPESAFE_API_KEY?.trim());
}
