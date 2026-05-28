"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  DEFAULT_MARKET,
  MARKETS,
  type Market,
  type MarketCode,
} from "./config";

interface MarketContextValue {
  market: Market;
  /** True when the active market came from URL/manual/geo, not the default fallback. */
  resolved: boolean;
}

const MarketContext = createContext<MarketContextValue | null>(null);

interface MarketProviderProps {
  marketCode: MarketCode | null;
  resolved: boolean;
  children: ReactNode;
}

export function MarketProvider({
  marketCode,
  resolved,
  children,
}: MarketProviderProps) {
  const market = MARKETS[marketCode ?? DEFAULT_MARKET];
  return (
    <MarketContext.Provider value={{ market, resolved }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error("useMarket must be used within a MarketProvider");
  }
  return ctx;
}
