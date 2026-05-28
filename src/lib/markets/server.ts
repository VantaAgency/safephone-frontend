import "server-only";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_MARKET,
  MARKETS,
  MARKET_COOKIE,
  isMarketCode,
  type Market,
  type MarketCode,
} from "./config";

export type MarketResolution =
  | { status: "resolved"; market: Market; source: "url" | "manual" | "geo" | "default" }
  | { status: "unsupported"; detectedCountry: string | null };

function marketFromCountry(country: string | null): MarketCode | null {
  if (!country) return null;
  const upper = country.toUpperCase();
  return isMarketCode(upper) ? upper : null;
}

function readGeoCountry(headerStore: Awaited<ReturnType<typeof headers>>): string | null {
  const vercel = headerStore.get("x-vercel-ip-country");
  if (vercel) return vercel;
  const cloudflare = headerStore.get("cf-ipcountry");
  if (cloudflare) return cloudflare;
  return null;
}

/**
 * Derive a market from a URL pathname. Recognises both the canonical
 * prefixes (`/sn`, `/us`) and the redirect endpoints emitted by the
 * country switcher.
 */
function marketFromPathname(pathname: string | null): MarketCode | null {
  if (!pathname) return null;
  if (pathname === "/sn" || pathname.startsWith("/sn/")) return "SN";
  if (pathname === "/us" || pathname.startsWith("/us/")) return "US";
  return null;
}

/**
 * Server-side market resolution. Priority:
 *   1. URL pathname (`x-pathname` header set by proxy) — the URL prefix
 *      always wins so visiting `/sn` with a US cookie shows SN content.
 *   2. sp_market cookie (manual choice via the country switcher).
 *   3. Geo header from upstream edge (x-vercel-ip-country / cf-ipcountry).
 *   4. Unsupported → caller decides whether to fall back or prompt.
 */
export async function resolveMarket(): Promise<MarketResolution> {
  const headerStore = await headers();

  const pathnameMarket = marketFromPathname(headerStore.get("x-pathname"));
  if (pathnameMarket) {
    return { status: "resolved", market: MARKETS[pathnameMarket], source: "url" };
  }

  const cookieStore = await cookies();
  const manual = cookieStore.get(MARKET_COOKIE)?.value;
  if (isMarketCode(manual)) {
    return { status: "resolved", market: MARKETS[manual], source: "manual" };
  }

  const geoCountry = readGeoCountry(headerStore);
  const geoMarket = marketFromCountry(geoCountry);
  if (geoMarket) {
    return { status: "resolved", market: MARKETS[geoMarket], source: "geo" };
  }

  return { status: "unsupported", detectedCountry: geoCountry };
}

/**
 * Convenience for pages that always need a Market. Falls back to
 * DEFAULT_MARKET when detection is unsupported so the page always renders
 * something rather than crashing.
 */
export async function getActiveMarket(): Promise<Market> {
  const result = await resolveMarket();
  if (result.status === "resolved") return result.market;
  return MARKETS[DEFAULT_MARKET];
}
