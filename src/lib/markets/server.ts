import "server-only";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_MARKET,
  MARKETS,
  MARKET_COOKIE,
  isMarketCode,
  type Market,
} from "./config";

import { geoCountry, geoMarket, isUnder, marketForHost } from "./domains";

export type MarketResolution =
  | { status: "resolved"; market: Market; source: "domain" | "url" | "manual" | "geo" }
  | { status: "unsupported"; detectedCountry: string | null };

export async function resolveMarket(): Promise<MarketResolution> {
  const headerStore = await headers();

  const domainMarket = marketForHost(headerStore.get("host") ?? headerStore.get("x-forwarded-host"));
  if (domainMarket) {
    return { status: "resolved", market: MARKETS[domainMarket], source: "domain" };
  }

  const pathname = headerStore.get("x-pathname") ?? "";
  const pathnameMarket = isUnder(pathname, "/sn") ? "SN" : isUnder(pathname, "/us") ? "US" : null;
  if (pathnameMarket) {
    return { status: "resolved", market: MARKETS[pathnameMarket], source: "url" };
  }

  const cookieStore = await cookies();
  const manual = cookieStore.get(MARKET_COOKIE)?.value;
  if (isMarketCode(manual)) {
    return { status: "resolved", market: MARKETS[manual], source: "manual" };
  }

  const detected = geoMarket(headerStore);
  if (detected) {
    return { status: "resolved", market: MARKETS[detected], source: "geo" };
  }

  return { status: "unsupported", detectedCountry: geoCountry(headerStore) };
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
