import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_MODEL_SUGGESTIONS } from "@/lib/data";

// Groq-backed phone-model suggestions for the register-device combobox.
//
// POST { brand, brandSlug?, query? } -> { models: string[], source }
//
// The key stays server-side. When GROQ_API_KEY is unset (or the call
// fails) we fall back to the static DEVICE_MODEL_SUGGESTIONS list keyed
// by brandSlug, so the combobox keeps working before the key is wired.
// Anonymous callers (no Better Auth session cookie) only ever get the
// static list — Groq calls are reserved for signed-in users so the
// endpoint can't be abused as a free LLM proxy.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";
const MAX_MODELS = 12;

type StaticBrandKey = keyof typeof DEVICE_MODEL_SUGGESTIONS;

function staticFallback(brandSlug?: string): string[] {
  if (brandSlug && brandSlug in DEVICE_MODEL_SUGGESTIONS) {
    return [...DEVICE_MODEL_SUGGESTIONS[brandSlug as StaticBrandKey]];
  }
  return [];
}

function hasSessionCookie(req: NextRequest): boolean {
  return (
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token")
  );
}

// In-memory cache keyed by `${brand}::${query}` (lowercased). Survives
// for the life of the server process — popular brand/query pairs hit
// Groq once. Bounded so a flood of distinct queries can't grow it
// unbounded.
const cache = new Map<string, string[]>();
const CACHE_MAX = 500;

function cacheGet(key: string): string[] | undefined {
  return cache.get(key);
}

function cacheSet(key: string, value: string[]) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

async function fetchFromGroq(
  apiKey: string,
  brand: string,
  query: string,
): Promise<string[]> {
  const userPrompt = query
    ? `Brand: ${brand}. The user has typed: "${query}". List up to ${MAX_MODELS} real phone model names for this brand, prioritizing ones that match what they typed.`
    : `Brand: ${brand}. List up to ${MAX_MODELS} popular, recent, real phone model names for this brand.`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You suggest real smartphone model names for a device-registration form. " +
            'Reply ONLY with a JSON object of the shape {"models": string[]}. ' +
            "Use the canonical commercial model name without the manufacturer's company name as a prefix " +
            "unless it is part of the name (e.g. 'Galaxy A54', 'iPhone 15 Pro', 'Spark 20'). " +
            "Never invent models that do not exist. If unsure, return fewer items.",
        },
        { role: "user", content: userPrompt },
      ],
    }),
    // Don't let a slow LLM hang the form.
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    throw new Error(`groq responded ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { models?: unknown };
  if (!Array.isArray(parsed.models)) return [];
  return parsed.models
    .filter((m): m is string => typeof m === "string")
    .map((m) => m.trim())
    .filter(Boolean)
    .slice(0, MAX_MODELS);
}

export async function POST(request: NextRequest) {
  let body: { brand?: unknown; brandSlug?: unknown; query?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const brand =
    typeof body.brand === "string" ? body.brand.trim().slice(0, 80) : "";
  const brandSlug =
    typeof body.brandSlug === "string" ? body.brandSlug.trim() : undefined;
  const query =
    typeof body.query === "string" ? body.query.trim().slice(0, 60) : "";

  const fallback = staticFallback(brandSlug);
  const apiKey = process.env.GROQ_API_KEY;

  // No brand, no key, or anonymous caller → static list only.
  if (!brand || !apiKey || !hasSessionCookie(request)) {
    return NextResponse.json({ models: fallback, source: "static" });
  }

  const cacheKey = `${brand.toLowerCase()}::${query.toLowerCase()}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json({ models: cached, source: "cache" });
  }

  try {
    const models = await fetchFromGroq(apiKey, brand, query);
    const result = models.length > 0 ? models : fallback;
    if (models.length > 0) cacheSet(cacheKey, models);
    return NextResponse.json({
      models: result,
      source: models.length > 0 ? "groq" : "static",
    });
  } catch {
    return NextResponse.json({ models: fallback, source: "static-error" });
  }
}
