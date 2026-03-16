"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/api/types";
import type { Lang, Translations } from "@/lib/i18n";

interface PlanCardProps {
  plan: Plan;
  lang: Lang;
  t: Translations;
  annual?: boolean;
  onSelect?: (planId: string) => void;
  compact?: boolean;
}

export function PlanCard({ plan, lang, t, annual = false, onSelect, compact = false }: PlanCardProps) {
  const price = annual ? plan.price_annual : plan.price_monthly;
  const period = annual ? t.plans.perYear : t.plans.perMonth;
  const name = lang === "fr" ? plan.name_fr : plan.name_en;
  const features = lang === "fr" ? plan.features_fr : plan.features_en;
  const notCovered = lang === "fr" ? plan.not_covered_fr : plan.not_covered_en;
  const deviceRange = lang === "fr" ? plan.device_range_fr : plan.device_range_en;

  if (plan.is_popular) {
    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-[2.5rem] border border-indigo-800 bg-indigo-950 shadow-2xl shadow-indigo-900/30 md:scale-[1.03]",
          compact ? "p-6" : "p-8 lg:p-10"
        )}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 translate-y-1/3 -translate-x-1/3 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative z-10 mb-8">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-medium text-yellow-400 backdrop-blur-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {t.plans.popular}
          </div>
          <h3 className="mb-2 text-xl font-medium tracking-tight text-white">{name}</h3>
          {deviceRange && (
            <p className="text-sm leading-relaxed text-indigo-200/80">{deviceRange}</p>
          )}
        </div>

        <div className="relative z-10 mb-8 flex items-end gap-2">
          <span className="text-4xl font-normal tracking-tighter text-white lg:text-5xl">
            {price.toLocaleString("fr-FR")}
          </span>
          <span className="mb-1.5 text-sm font-medium text-indigo-300">{period}</span>
        </div>

        <div className="relative z-10 mb-8 h-px w-full bg-indigo-800/60" />

        <ul className="relative z-10 mb-10 flex-grow space-y-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-indigo-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-yellow-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
          {notCovered.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-indigo-400/60">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-indigo-600">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <Button
          variant="primary"
          size={compact ? "md" : "lg"}
          fullWidth
          onClick={() => onSelect?.(plan.id)}
          className="relative z-10 rounded-xl border border-yellow-300"
        >
          {t.plans.cta} {name}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[2rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md",
        compact ? "p-5" : "p-8 lg:p-10"
      )}
    >
      <div className={cn(compact ? "mb-4" : "mb-8")}>
        <h3 className="mb-2 text-lg font-medium tracking-tight text-indigo-950">{name}</h3>
        {deviceRange && (
          <p className="text-sm leading-relaxed text-slate-500">{deviceRange}</p>
        )}
      </div>

      <div className={cn(compact ? "mb-4" : "mb-8", "flex items-end gap-2")}>
        <span className={cn(
          "font-normal tracking-tighter text-indigo-950",
          compact ? "text-2xl" : "text-4xl lg:text-5xl"
        )}>
          {price.toLocaleString("fr-FR")}
        </span>
        <span className="mb-1.5 text-sm font-medium text-slate-400">{period}</span>
      </div>

      {!compact && <div className="mb-8 h-px w-full bg-slate-100" />}

      <ul className={cn("flex-grow space-y-4", compact ? "mb-4" : "mb-10")}>
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-indigo-500">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
        {notCovered.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-slate-300">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        size={compact ? "sm" : "lg"}
        fullWidth
        onClick={() => onSelect?.(plan.id)}
        className="rounded-xl"
      >
        {t.plans.cta} {name}
      </Button>
    </div>
  );
}
