"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Market, MarketCode } from "@/lib/markets/config";

interface Props {
  markets: Market[];
}

export function CountryChoiceList({ markets }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selecting, setSelecting] = useState<MarketCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (code: MarketCode) => {
    setSelecting(code);
    setError(null);
    try {
      const response = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market: code }),
      });
      if (!response.ok) {
        throw new Error("Failed to save selection");
      }
      const data = (await response.json()) as { redirectTo: string };
      startTransition(() => {
        router.replace(data.redirectTo);
        router.refresh();
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong",
      );
      setSelecting(null);
    }
  };

  return (
    <div className="w-full space-y-3">
      {markets.map((market) => {
        const isLoading = selecting === market.code;
        return (
          <button
            key={market.code}
            type="button"
            onClick={() => choose(market.code)}
            disabled={selecting !== null}
            className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-4">
              <span className="text-2xl" aria-hidden>
                {market.flag}
              </span>
              <span className="flex flex-col">
                <span className="text-base font-medium text-indigo-950">
                  {market.country}
                </span>
                <span className="text-xs text-slate-500">
                  {market.currencyLabel} ·{" "}
                  {market.language === "fr" ? "Français" : "English"}
                </span>
              </span>
            </span>
            <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
              {isLoading ? "…" : "Choose"}
            </span>
          </button>
        );
      })}
      {error && (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
