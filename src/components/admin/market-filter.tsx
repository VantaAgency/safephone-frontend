"use client";

import type { MarketCode } from "@/lib/api/types";

/** "" means "all markets" (no server-side filter). */
export type MarketFilterValue = "" | MarketCode;

const OPTIONS: { value: MarketFilterValue; label: string }[] = [
  { value: "", label: "Tous les marchés" },
  { value: "SN", label: "🇸🇳 Sénégal" },
  { value: "US", label: "🇺🇸 États-Unis" },
];

/**
 * Top-level admin filter that narrows every market-aware list to a single
 * market. The selected value is owned by the page (synced to the ?market=
 * URL param) so refresh and bookmarks keep the filter.
 */
export function MarketFilter({
  value,
  onChange,
}: {
  value: MarketFilterValue;
  onChange: (value: MarketFilterValue) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-slate-500">Marché</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MarketFilterValue)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value || "all"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
