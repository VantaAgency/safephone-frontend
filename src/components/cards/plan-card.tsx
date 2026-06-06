"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/api/types";
import type { Lang, Translations } from "@/lib/i18n";
import { isDevelopmentPlan } from "@/lib/plans";
import { MARKETS } from "@/lib/markets/config";
import { splitPrice } from "@/lib/markets/format";

interface PlanCardProps {
  plan: Plan;
  lang: Lang;
  t: Translations;
  annual?: boolean;
  onSelect?: (planId: string) => void;
  compact?: boolean;
}

// Plans v2 dropped the per-slug "progressive content" switch — every plan
// in v2 ships the same standard services and the differentiation is the
// device coverage matrix. Compact view bullets list every standard service
// (incl. hardware-failure and battery-damage support) and the kicker is just
// the plan name, which keeps the homepage preview row visually consistent.
function getProgressiveContent(plan: Plan, lang: Lang) {
  const isFr = lang === "fr";
  const name = isFr ? plan.name_fr : plan.name_en;
  return {
    kicker: isFr ? `Forfait ${name}` : `${name} plan`,
    bullets: isFr ? plan.features_fr : plan.features_en,
    exclusion: "",
  };
}

// DeviceCoverageBlock renders the per-plan device-type caps as icons +
// counts. Skipped silently when every cap is 0 (legacy plans that
// pre-date plans v2 still render but without the block).
function DeviceCoverageBlock({ plan, lang }: { plan: Plan; lang: Lang }) {
  const items: Array<{ icon: string; count: number; label: string }> = [
    {
      icon: "📱",
      count: plan.max_smartphones,
      label: lang === "fr" ? "smartphones" : "phones",
    },
    {
      icon: "📋",
      count: plan.max_tablets,
      label: lang === "fr" ? "tablettes" : "tablets",
    },
    {
      icon: "💻",
      count: plan.max_computers,
      label: lang === "fr" ? "ordinateurs" : "computers",
    },
    {
      icon: "🎮",
      count: plan.max_game_consoles,
      label: lang === "fr" ? "consoles" : "consoles",
    },
    { icon: "📺", count: plan.max_tvs, label: "TV" },
  ].filter((item) => item.count > 0);

  if (items.length === 0) return null;

  return (
    <div className="mb-5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {lang === "fr" ? "Couvre" : "Covers"}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-medium text-indigo-950">
        {items.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1">
            <span aria-hidden>{item.icon}</span>
            <span>{item.count}</span>
            <span className="text-xs font-normal text-slate-500">{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// WaitingPeriodNotice renders the universal 30-day-first-claim callout
// beneath the CTA. Hidden when claim_waiting_period_days is 0 (dev plan).
function WaitingPeriodNotice({ days, lang }: { days: number; lang: Lang }) {
  if (!days) return null;
  return (
    <p className="mt-3 text-[11px] text-slate-400">
      {lang === "fr"
        ? `Premier sinistre éligible ${days} jours après activation.`
        : `First claim eligible ${days} days after activation.`}
    </p>
  );
}

export function PlanCard({
  plan,
  lang,
  t,
  annual = false,
  onSelect,
  compact = false,
}: PlanCardProps) {
  const rawPrice = annual ? plan.price_annual : plan.price_monthly;
  // Currency is a property of the PLAN, not of the visitor's market. SN
  // plans always render as XOF (no division), US plans always render as
  // USD (cents → dollars). This way a US visitor browsing /sn/forfaits
  // still sees the SN plans in FCFA, not in dollars.
  const isUSPlan = plan.slug.startsWith("us_");
  const planMarket = isUSPlan ? MARKETS.US : MARKETS.SN;
  const { value: price, period } = splitPrice(
    rawPrice,
    planMarket,
    annual ? "annual" : "monthly",
    lang,
  );
  const name = lang === "fr" ? plan.name_fr : plan.name_en;
  const features = lang === "fr" ? plan.features_fr : plan.features_en;
  const notCovered = lang === "fr" ? plan.not_covered_fr : plan.not_covered_en;
  const deviceRange =
    lang === "fr" ? plan.device_range_fr : plan.device_range_en;
  const isDevPlan = isDevelopmentPlan(plan);
  const progressive = getProgressiveContent(plan, lang);
  const ctaLabel = compact ? (lang === "fr" ? "Choisir" : "Choose") : `${t.plans.cta} ${name}`;

  if (plan.is_popular) {
    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-[2.2rem] border border-indigo-800 bg-indigo-950 md:scale-[1.01]",
          compact ? "p-5" : "p-8 lg:p-10",
        )}
      >
        <div className={cn("relative z-10", compact ? "mb-4" : "mb-8")}>
          <div className={cn("inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-medium text-yellow-400", compact ? "mb-3" : "mb-6")}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {t.plans.popular}
          </div>
          {compact && (
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
              {progressive.kicker}
            </div>
          )}
          {isDevPlan && (
            <div className="mb-4 inline-flex items-center rounded-full border border-yellow-300/50 bg-yellow-400/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
              {lang === "fr" ? "Développement" : "Development"}
            </div>
          )}
          <h3 className={cn("font-medium tracking-tight text-white", compact ? "mb-1 text-lg" : "mb-2 text-xl")}>
            {name}
          </h3>
          {deviceRange && (
            <p className={cn("text-indigo-200/80", compact ? "text-xs leading-5" : "text-sm leading-relaxed")}>
              {deviceRange}
            </p>
          )}
        </div>

        <div className={cn("relative z-10 flex items-end gap-2", compact ? "mb-4" : "mb-8")}>
          <span className={cn("font-normal tracking-tighter text-white", compact ? "text-3xl" : "text-4xl lg:text-5xl")}>
            {price}
          </span>
          <span className={cn("font-medium text-indigo-300", compact ? "mb-1 text-xs" : "mb-1.5 text-sm")}>
            {period}
          </span>
        </div>

        {!compact && <div className="relative z-10 mb-8 h-px w-full bg-indigo-800/60" />}

        {!compact && (
          <div className="relative z-10 mb-6 rounded-xl border border-indigo-700/60 bg-indigo-900/40 px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
              {lang === "fr" ? "Couvre" : "Covers"}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-medium text-white">
              {[
                { icon: "📱", count: plan.max_smartphones, label: lang === "fr" ? "smartphones" : "phones" },
                { icon: "📋", count: plan.max_tablets, label: lang === "fr" ? "tablettes" : "tablets" },
                { icon: "💻", count: plan.max_computers, label: lang === "fr" ? "ordinateurs" : "computers" },
                { icon: "🎮", count: plan.max_game_consoles, label: lang === "fr" ? "consoles" : "consoles" },
                { icon: "📺", count: plan.max_tvs, label: "TV" },
              ]
                .filter((it) => it.count > 0)
                .map((it) => (
                  <span key={it.label} className="inline-flex items-center gap-1">
                    <span aria-hidden>{it.icon}</span>
                    <span>{it.count}</span>
                    <span className="text-xs font-normal text-indigo-200">{it.label}</span>
                  </span>
                ))}
            </div>
          </div>
        )}

        <ul className={cn("relative z-10 flex-grow", compact ? "mb-5 space-y-2.5" : "mb-10 space-y-4")}>
          {(compact ? progressive.bullets : features).map((feature) => (
            <li
              key={feature}
              className={cn("flex items-start gap-3", compact ? "text-[13px] leading-5 text-indigo-100" : "text-sm text-indigo-100")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 flex-shrink-0 text-yellow-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
          {(compact ? (progressive.exclusion ? [progressive.exclusion] : []) : notCovered).map((item) => (
            <li
              key={item}
              className={cn("flex items-start gap-3", compact ? "text-[12px] leading-5 text-indigo-300/80" : "text-sm text-indigo-400/60")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 flex-shrink-0 text-indigo-600"
              >
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
          {ctaLabel}
        </Button>
        {!compact && (
          <p className="relative z-10 mt-3 text-[11px] text-indigo-300">
            {lang === "fr"
              ? `Premier sinistre éligible ${plan.claim_waiting_period_days} jours après activation.`
              : `First claim eligible ${plan.claim_waiting_period_days} days after activation.`}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[2rem] border border-slate-200/80 bg-white transition-all duration-300",
        compact ? "p-5" : "p-8 lg:p-10",
      )}
    >
      <div className={cn(compact ? "mb-4" : "mb-8")}>
        {compact && (
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
            {progressive.kicker}
          </div>
        )}
        {isDevPlan && (
          <div className="mb-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
            {lang === "fr" ? "Plan test dev" : "Dev test plan"}
          </div>
        )}
        <h3 className={cn("font-medium tracking-tight text-indigo-950", compact ? "mb-1 text-lg" : "mb-2 text-lg")}>
          {name}
        </h3>
        {deviceRange && (
          <p className={cn("text-slate-500", compact ? "text-xs leading-5" : "text-sm leading-relaxed")}>
            {deviceRange}
          </p>
        )}
      </div>

      <div className={cn(compact ? "mb-4" : "mb-8", "flex items-end gap-2")}>
        <span
          className={cn(
            "font-normal tracking-tighter text-indigo-950",
            compact ? "text-2xl" : "text-4xl lg:text-5xl",
          )}
        >
          {price}
        </span>
        <span className="mb-1.5 text-sm font-medium text-slate-400">
          {period}
        </span>
      </div>

      {!compact && <div className="mb-6 h-px w-full bg-slate-100" />}

      {!compact && <DeviceCoverageBlock plan={plan} lang={lang} />}

      <ul className={cn("flex-grow", compact ? "mb-5 space-y-2.5" : "mb-10 space-y-4")}>
        {(compact ? progressive.bullets : features).map((feature) => (
          <li
            key={feature}
            className={cn("flex items-start gap-3", compact ? "text-[13px] leading-5 text-slate-600" : "text-sm text-slate-600")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 flex-shrink-0 text-indigo-500"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
              <span>{feature}</span>
          </li>
        ))}
        {(compact ? (progressive.exclusion ? [progressive.exclusion] : []) : notCovered).map((item) => (
          <li
            key={item}
            className={cn("flex items-start gap-3", compact ? "text-[12px] leading-5 text-slate-400" : "text-sm text-slate-400")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 flex-shrink-0 text-slate-300"
            >
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
        {ctaLabel}
      </Button>
      {!compact && <WaitingPeriodNotice days={plan.claim_waiting_period_days} lang={lang} />}
    </div>
  );
}
