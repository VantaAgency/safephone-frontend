import type { MarketCode, SupportedCurrency } from "./config";

/**
 * Maps a market code to its canonical currency. Single source of truth.
 *
 * Mirrors the backend's CurrencyForMarket in internal/domain/market.go.
 * We never store currency next to market — always derive at read time.
 */
export function currencyForMarket(code: MarketCode): SupportedCurrency {
  return code === "US" ? "USD" : "XOF";
}
