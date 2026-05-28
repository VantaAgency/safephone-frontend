import type { Metadata } from "next";
import { listMarkets } from "@/lib/markets/config";
import { CountryChoiceList } from "./country-choice-list";

export const metadata: Metadata = {
  title: "Choose your country · SafePhone",
  robots: { index: false, follow: false },
};

export default function SelectCountryPage() {
  const markets = listMarkets();
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-start justify-center gap-8 px-6 py-24">
      <header className="space-y-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
          SafePhone
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-indigo-950 sm:text-4xl">
          Choose your country to continue
        </h1>
        <p className="text-slate-600">
          We couldn&apos;t detect your country automatically. Pick the version
          of SafePhone you&apos;d like to use — you can change this any time
          from the navigation bar.
        </p>
      </header>
      <CountryChoiceList markets={markets} />
    </section>
  );
}
