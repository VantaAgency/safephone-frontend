"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/api/types";
import type { Lang, Translations } from "@/lib/i18n";
import { isDevelopmentPlan } from "@/lib/plans";

interface PlanCardProps {
  plan: Plan;
  lang: Lang;
  t: Translations;
  annual?: boolean;
  onSelect?: (planId: string) => void;
  compact?: boolean;
}

function getProgressiveContent(plan: Plan, lang: Lang) {
  const isFr = lang === "fr";

  switch (plan.slug) {
    case "essentiel":
      return {
        kicker: isFr ? "Forfait Essentiel" : "Essential plan",
        bullets: isFr
          ? ["Écran après chute", "Panne simple", "Suivi standard"]
          : ["Screen after a drop", "Basic malfunction", "Standard tracking"],
        exclusion: isFr ? "Hors liquides et vol" : "Excludes liquid damage and theft",
      };
    case "ecran-plus":
      return {
        kicker: isFr ? "Forfait Écran+" : "Screen+ plan",
        bullets: isFr
          ? ["Écran avant et arrière", "Petits dommages du quotidien", "Contact liquide léger", "Suivi prioritaire"]
          : ["Front and back screen", "Minor daily damage", "Light liquid contact", "Priority tracking"],
        exclusion: isFr ? "Hors immersion complète et vol" : "Excludes full immersion and theft",
      };
    case "plus":
      return {
        kicker: isFr ? "Forfait Plus · Écran+ inclus" : "Plus plan · Screen+ included",
        bullets: isFr
          ? ["Liquides et immersion", "Dommages accidentels étendus", "Panne matérielle", "Traitement accéléré"]
          : ["Liquid damage and immersion", "Extended accidental damage", "Hardware failure", "Faster handling"],
        exclusion: isFr ? "Hors vol et perte" : "Excludes theft and loss",
      };
    case "haute":
      return {
        kicker: isFr ? "Forfait Haute · Plus inclus" : "Haute plan · Plus included",
        bullets: isFr
          ? ["Vol et perte", "Dommages importants", "Support express", "Solution de remplacement si disponible"]
          : ["Theft and loss", "Major damage", "Express support", "Replacement solution when available"],
        exclusion: isFr ? "Appareil enregistré requis" : "Registered device required",
      };
    case "totale":
      return {
        kicker: isFr ? "Forfait Totale · Haute incluse" : "Totale plan · Haute included",
        bullets: isFr
          ? ["Appareils du foyer déclarés", "Casse, panne, liquides", "Vol et perte", "Accompagnement premium"]
          : ["Declared household devices", "Breakage, malfunction, liquids", "Theft and loss", "Premium assistance"],
        exclusion: isFr ? "Hors matériel non déclaré" : "Excludes undeclared equipment",
      };
    default:
      return {
        kicker: isFr ? "Protection" : "Protection",
        bullets: (lang === "fr" ? plan.features_fr : plan.features_en).slice(0, 4),
        exclusion: (lang === "fr" ? plan.not_covered_fr : plan.not_covered_en)[0],
      };
  }
}

export function PlanCard({
  plan,
  lang,
  t,
  annual = false,
  onSelect,
  compact = false,
}: PlanCardProps) {
  const price = annual ? plan.price_annual : plan.price_monthly;
  const period = annual ? t.plans.perYear : t.plans.perMonth;
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
            {price.toLocaleString("fr-FR")}
          </span>
          <span className={cn("font-medium text-indigo-300", compact ? "mb-1 text-xs" : "mb-1.5 text-sm")}>
            {period}
          </span>
        </div>

        {!compact && <div className="relative z-10 mb-8 h-px w-full bg-indigo-800/60" />}

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
          {price.toLocaleString("fr-FR")}
        </span>
        <span className="mb-1.5 text-sm font-medium text-slate-400">
          {period}
        </span>
      </div>

      {!compact && <div className="mb-8 h-px w-full bg-slate-100" />}

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
    </div>
  );
}
