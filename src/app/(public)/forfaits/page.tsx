"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { PlanCard } from "@/components/cards/plan-card";
import { usePlans } from "@/lib/api/hooks";
import { PlanCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const { lang, t } = useLanguage();
  const [annual, setAnnual] = useState(false);
  const router = useRouter();
  const { data: plans, isLoading, error } = usePlans();

  const handleSelect = (planId: string) => {
    router.push(`/inscription?plan=${planId}`);
  };

  return (
    <div className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-400 px-5 md:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-14">
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
        <div className="mb-14 flex items-center justify-center">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <PlanCardSkeleton key={i} />)
            : plans?.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  lang={lang}
                  t={t}
                  annual={annual}
                  onSelect={handleSelect}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
