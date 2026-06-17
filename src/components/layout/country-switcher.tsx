"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { useMarket } from "@/lib/markets/context";
import { listMarkets, type MarketCode } from "@/lib/markets/config";

interface CountrySwitcherProps {
  /** Smaller padding for the mobile navbar row. */
  compact?: boolean;
}

export function CountrySwitcher({ compact = false }: CountrySwitcherProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { market } = useMarket();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<MarketCode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const choose = async (code: MarketCode) => {
    if (code === market.code || pending) {
      setOpen(false);
      return;
    }
    setPending(code);
    try {
      const response = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market: code }),
      });
      if (!response.ok) throw new Error("Failed to save selection");
      const data = (await response.json()) as { redirectTo: string };
      const message =
        code === "SN"
          ? "Vous consultez maintenant SafePhone Sénégal."
          : "You're now viewing SafePhone United States.";
      toast(message, "success");
      // A dedicated-domain market is cross-origin → full navigation. A
      // same-host market stays a soft client navigation.
      if (/^https?:\/\//i.test(data.redirectTo)) {
        window.location.assign(data.redirectTo);
      } else {
        router.replace(data.redirectTo);
        router.refresh();
      }
    } catch {
      toast(
        market.language === "fr"
          ? "Impossible de changer de pays. Réessayez."
          : "Could not switch country. Please try again.",
        "error",
      );
    } finally {
      setPending(null);
      setOpen(false);
    }
  };

  const all = listMarkets();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-indigo-950 cursor-pointer",
          compact ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-xs",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change country"
      >
        <span aria-hidden className={compact ? "text-sm" : "text-base"}>
          {market.flag}
        </span>
        <span className="font-medium uppercase tracking-[0.12em]">
          {market.code}
        </span>
        <ChevronDownIcon
          size={12}
          className={cn(
            "text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
        >
          {all.map((entry) => {
            const isActive = entry.code === market.code;
            const isLoading = pending === entry.code;
            return (
              <button
                key={entry.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                disabled={pending !== null}
                onClick={() => choose(entry.code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed cursor-pointer",
                  isActive
                    ? "bg-indigo-50 text-indigo-950"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <span aria-hidden className="text-lg">
                  {entry.flag}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-indigo-950">
                    {entry.country}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {entry.currencyLabel} ·{" "}
                    {entry.language === "fr" ? "Français" : "English"}
                  </span>
                </span>
                <span className="ml-auto text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  {isLoading ? "…" : isActive ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
