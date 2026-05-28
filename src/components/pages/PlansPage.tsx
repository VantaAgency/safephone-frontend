"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useMarket } from "@/lib/markets/context";
import { routesFor } from "@/lib/markets/routes";
import { PlanCard } from "@/components/cards/plan-card";
import { usePlans } from "@/lib/api/hooks";
import { PlanCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

/**
 * Shared plans page body. Phase 3 will refactor the plan filtering and the
 * `/inscription` redirect to be market-aware via routesFor() so the same
 * component drives both /sn/forfaits and /us/pricing.
 */
export default function PlansPage() {
  const { lang, t } = useLanguage();
  const { market } = useMarket();
  const routes = routesFor(market.code);
  const [annual, setAnnual] = useState(false);
  const router = useRouter();
  const { data: allPlans, isLoading, error } = usePlans();

  // Filter plans by active market. US plans are prefixed with us_;
  // everything else is SN-side.
  const plans = useMemo(() => {
    if (!allPlans) return undefined;
    return allPlans.filter((p) =>
      market.code === "US" ? p.slug.startsWith("us_") : !p.slug.startsWith("us_"),
    );
  }, [allPlans, market.code]);

  const handleSelect = (planId: string) => {
    // US signup needs the plan slug (Stripe lookups happen by slug);
    // SN signup still keys off plan.id like before.
    if (market.code === "US") {
      const plan = plans?.find((p) => p.id === planId);
      const key = plan?.slug ?? planId;
      router.push(`${routes.signup}?plan=${encodeURIComponent(key)}`);
      return;
    }
    router.push(`${routes.signup}?plan=${planId}`);
  };

  return (
    <div className="relative isolate overflow-hidden bg-[#FAFAF8] py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-28 right-0 h-[420px] w-[420px] rounded-full bg-indigo-100/35 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-[320px] w-[320px] rounded-full bg-yellow-100/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-400 px-5 md:px-10">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            {lang === "fr" ? "Nos forfaits" : "Our plans"}
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl lg:text-5xl">
            {t.plans.title}
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            {t.plans.sub}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mb-10 flex items-center justify-center md:mb-12">
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-200/50 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all cursor-pointer",
                !annual
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950"
              )}
            >
              {t.plans.monthly}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all cursor-pointer",
                annual
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950"
              )}
            >
              {t.plans.annual}
              {annual && (
                <span className="ml-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  {t.plans.save}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mx-auto max-w-md rounded-[2rem] border border-red-200/80 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-600">
              {lang === "fr" ? "Impossible de charger les forfaits." : "Could not load plans."}
            </p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <PlanCardSkeleton key={i} />)
            : plans?.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  lang={lang}
                  t={t}
                  annual={annual}
                  compact
                  onSelect={handleSelect}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
