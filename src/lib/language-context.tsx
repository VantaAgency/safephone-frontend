"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { T, type Lang, type Translations } from "./i18n";
import { US_OVERRIDES, mergeOverrides } from "./i18n-us";
import { MARKETS, type MarketCode } from "./markets/config";
import { useMarket } from "./markets/context";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Derive the active market from the URL pathname. Used inside the language
 * provider so language follows the URL prefix directly — no waiting for the
 * MarketProvider context to update across client-side navigations.
 */
function marketFromPathname(pathname: string): MarketCode | null {
  if (pathname === "/us" || pathname.startsWith("/us/")) return "US";
  if (pathname === "/sn" || pathname.startsWith("/sn/")) return "SN";
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const { market } = useMarket();

  // Source of truth for which market the language should follow: URL prefix
  // wins, then the resolved market from cookie/geo. usePathname() updates
  // synchronously on every client navigation, so /us → /sn flips immediately.
  const urlMarket = marketFromPathname(pathname);
  const activeMarketCode: MarketCode = urlMarket ?? market.code;
  const defaultLang = MARKETS[activeMarketCode].language;

  // `manualLang` holds an explicit FR/EN toggle from the user. It survives
  // within a market session and resets when the user crosses to the other
  // market (so /sn always starts in FR, /us always starts in EN).
  const [manualLang, setManualLang] = useState<Lang | null>(null);
  const prevMarketRef = useRef<MarketCode>(activeMarketCode);
  useEffect(() => {
    if (prevMarketRef.current !== activeMarketCode) {
      prevMarketRef.current = activeMarketCode;
      setManualLang(null);
    }
  }, [activeMarketCode]);

  const lang: Lang = manualLang ?? defaultLang;
  const setLang = (next: Lang) => setManualLang(next);

  // On US + EN, deep-merge the US copy overrides on top of T.en. SN users
  // who toggle to EN still see the unmodified Senegal-flavoured English.
  const t = useMemo<Translations>(() => {
    const base = T[lang];
    if (activeMarketCode === "US" && lang === "en") {
      return mergeOverrides(base, US_OVERRIDES);
    }
    return base;
  }, [lang, activeMarketCode]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
