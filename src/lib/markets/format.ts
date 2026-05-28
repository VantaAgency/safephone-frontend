import type { Market, SupportedCurrency } from "./config";

/**
 * Format a price for display.
 *
 * USD plans store price as cents (999 = $9.99); XOF plans store price as
 * whole units (3500 = 3 500 FCFA). The currency on the plan/subscription
 * decides which formatter to use — not the user's lang preference, since a
 * SN user toggling to EN should still see prices in FCFA.
 */
export function formatPrice(
  amount: number,
  currency: SupportedCurrency,
  options: { withSuffix?: boolean } = {},
): string {
  if (currency === "USD") {
    const dollars = amount / 100;
    const fractionDigits = amount % 100 === 0 ? 0 : 2;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(dollars);
  }
  // XOF
  const formatted = amount.toLocaleString("fr-FR");
  if (options.withSuffix === false) return formatted;
  return `${formatted} FCFA`;
}

/**
 * Period suffix to show next to a price ("/ month", "/ mois", "/ year").
 * The amount itself is already formatted by formatPrice() and renders as
 * a separate element — this returns only the trailing period text.
 */
export function periodLabel(
  market: Market,
  cadence: "monthly" | "annual",
  lang: "fr" | "en",
): string {
  if (market.currency === "USD") {
    return cadence === "monthly" ? "/ month" : "/ year";
  }
  // XOF — use language to pick FR vs EN suffix.
  if (lang === "fr") {
    return cadence === "monthly" ? "FCFA / mois" : "FCFA / an";
  }
  return cadence === "monthly" ? "FCFA / month" : "FCFA / year";
}

/**
 * Helper for components that already received the full pre-formatted price
 * (USD case) vs need to append the FCFA suffix.
 *
 * Use case: PlanCard currently renders `<span>{price}</span><span>{period}</span>`.
 * For USD plans, formatPrice already produces "$9.99" — the span next to it
 * should be "/ month" (no FCFA prefix). For XOF plans, the price is "3 500"
 * and the period span carries "FCFA / mois".
 *
 * splitPrice() returns the two parts in the right shape for that pattern.
 */
export function splitPrice(
  amount: number,
  market: Market,
  cadence: "monthly" | "annual",
  lang: "fr" | "en",
): { value: string; period: string } {
  if (market.currency === "USD") {
    return {
      value: formatPrice(amount, "USD"),
      period: cadence === "monthly" ? "/ month" : "/ year",
    };
  }
  // XOF: price separate from the FCFA suffix so existing PlanCard layout works.
  return {
    value: amount.toLocaleString("fr-FR"),
    period: periodLabel(market, cadence, lang),
  };
}
