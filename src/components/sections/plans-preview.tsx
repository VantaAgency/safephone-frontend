"use client";

import { useState } from "react";

import Link from "next/link";

import { useLanguage } from "@/lib/language-context";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DashIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

interface PlanItem {
  name: string;
  desc: string;
  monthlyPrice: number;
  annualPrice: number;
  featured: boolean;
  features: { text: string; bold?: string; suffix?: string; included: boolean }[];
  ctaLabel: string;
}

const PLANS_FR: PlanItem[] = [
  {
    name: "Forfait Essentiel",
    desc: "La couverture de base pour les appareils d'une valeur inférieure à 100 000 FCFA.",
    monthlyPrice: 2500,
    annualPrice: 25500,
    featured: false,
    ctaLabel: "Souscrire Essentiel",
    features: [
      { bold: "1 réparation d'écran", suffix: " payée par an", included: true },
      { text: "Réparation en centre agréé MobiTech", included: true },
      { text: "Non couvert contre l'oxydation (eau)", included: false },
    ],
  },
  {
    name: "Forfait Écran+",
    desc: "L'équilibre parfait. La protection idéale pour la majorité des smartphones récents.",
    monthlyPrice: 4000,
    annualPrice: 40800,
    featured: true,
    ctaLabel: "Souscrire Écran+",
    features: [
      { bold: "2 réparations d'écran", suffix: " payées par an", included: true },
      { text: "Prise en charge des dommages accidentels", included: true },
      { text: "Coupe-file au comptoir MobiTech", included: true },
    ],
  },
  {
    name: "Forfait Premium",
    desc: "Tranquillité absolue pour les smartphones haut de gamme (iPhone, Samsung Galaxy).",
    monthlyPrice: 6500,
    annualPrice: 66300,
    featured: false,
    ctaLabel: "Souscrire Premium",
    features: [
      { text: "Réparations d'écran ", bold: "illimitées", included: true },
      { text: "Oxydation et dégâts d'eau couverts", included: true },
      { text: "Téléphone de prêt pendant la réparation", included: true },
    ],
  },
];

const PLANS_EN: PlanItem[] = [
  {
    name: "Essential Plan",
    desc: "Basic coverage for devices valued under 100,000 FCFA.",
    monthlyPrice: 2500,
    annualPrice: 25500,
    featured: false,
    ctaLabel: "Subscribe Essential",
    features: [
      { bold: "1 screen repair", suffix: " covered per year", included: true },
      { text: "Repair at certified MobiTech center", included: true },
      { text: "Water damage not covered", included: false },
    ],
  },
  {
    name: "Screen+ Plan",
    desc: "The perfect balance. Ideal protection for most recent smartphones.",
    monthlyPrice: 4000,
    annualPrice: 40800,
    featured: true,
    ctaLabel: "Subscribe Screen+",
    features: [
      { bold: "2 screen repairs", suffix: " covered per year", included: true },
      { text: "Accidental damage coverage", included: true },
      { text: "Priority counter at MobiTech", included: true },
    ],
  },
  {
    name: "Premium Plan",
    desc: "Absolute peace of mind for high-end smartphones (iPhone, Samsung Galaxy).",
    monthlyPrice: 6500,
    annualPrice: 66300,
    featured: false,
    ctaLabel: "Subscribe Premium",
    features: [
      { text: "Screen repairs ", bold: "unlimited", included: true },
      { text: "Water and oxidation damage covered", included: true },
      { text: "Loaner phone during repair", included: true },
    ],
  },
];

export function PlansPreview() {
  const { lang } = useLanguage();
  const [annual, setAnnual] = useState(false);
  const plans = lang === "fr" ? PLANS_FR : PLANS_EN;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 md:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2">
        <div className="absolute top-20 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-100/40 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
          <h2 className="mb-5 text-3xl font-normal tracking-tight text-indigo-950 md:text-4xl lg:text-5xl">
            {lang === "fr" ? "Un abonnement clair, selon votre appareil" : "A clear plan, matched to your device"}
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-slate-500">
            {lang === "fr"
              ? "Choisissez la protection qui correspond à la valeur de votre smartphone. Sans engagement contraignant, sans frais cachés lors de la réparation."
              : "Choose the protection that matches your smartphone's value. No binding commitment, no hidden fees at repair time."}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-200/50 p-1.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                !annual
                  ? "border border-slate-200/50 bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950"
              }`}
            >
              {lang === "fr" ? "Mensuel" : "Monthly"}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`relative flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                annual
                  ? "border border-slate-200/50 bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950"
              }`}
            >
              {lang === "fr" ? "Annuel" : "Annual"}
              <span className="inline-flex items-center rounded-full border border-emerald-200/50 bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                -15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3 lg:gap-8">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const period = lang === "fr"
              ? (annual ? "FCFA / an" : "FCFA / mois")
              : (annual ? "FCFA / year" : "FCFA / month");

            if (plan.featured) {
              return (
                <div
                  key={plan.name}
                  className="relative z-10 flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-indigo-800 bg-indigo-950 p-8 shadow-2xl shadow-indigo-900/30 group md:scale-[1.03] lg:p-10"
                >
                  {/* Ambient glows */}
                  <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-indigo-500/20 blur-3xl transition-transform duration-700 group-hover:translate-x-1/4" />
                  <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-yellow-400/10 blur-3xl" />

                  <div className="relative z-10 mb-8">
                    <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-medium text-yellow-400 backdrop-blur-md">
                      <StarIcon />
                      {lang === "fr" ? "Le plus populaire" : "Most popular"}
                    </div>
                    <h3 className="mb-2 text-xl font-medium tracking-tight text-white">{plan.name}</h3>
                    <p className="text-sm leading-relaxed text-indigo-200/80">{plan.desc}</p>
                  </div>

                  <div className="relative z-10 mb-8 flex items-end gap-2">
                    <span className="text-4xl font-normal tracking-tighter text-white lg:text-5xl">
                      {price.toLocaleString("fr-FR")}
                    </span>
                    <span className="mb-1.5 text-sm font-medium text-indigo-300">{period}</span>
                  </div>

                  <div className="relative z-10 mb-8 h-px w-full bg-indigo-800/60" />

                  <ul className="relative z-10 mb-10 flex-grow space-y-4">
                    {plan.features.map((f) => (
                      <li key={`${f.text ?? ""}-${f.bold ?? ""}`} className="flex items-start gap-3 text-sm text-indigo-100">
                        <CheckIcon className="mt-0.5 flex-shrink-0 text-yellow-400" />
                        <span>
                          {f.bold && !f.text && <span className="font-medium text-white">{f.bold}</span>}
                          {f.bold && !f.text && f.suffix}
                          {f.text && !f.bold && f.text}
                          {f.text && f.bold && <>{f.text}<span className="font-medium text-white">{f.bold}</span></>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/inscription"
                    className="relative z-10 w-full rounded-xl border border-yellow-300 bg-yellow-400 py-3.5 text-center text-sm font-medium text-indigo-950 transition-all duration-300 hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-400/20"
                  >
                    {plan.ctaLabel}
                  </Link>
                </div>
              );
            }

            return (
              <div
                key={plan.name}
                className="relative z-0 flex h-full flex-col rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md lg:p-10"
              >
                <div className="mb-8">
                  <h3 className="mb-2 text-lg font-medium tracking-tight text-indigo-950">{plan.name}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{plan.desc}</p>
                </div>

                <div className="mb-8 flex items-end gap-2">
                  <span className="text-4xl font-normal tracking-tighter text-indigo-950 lg:text-5xl">
                    {price.toLocaleString("fr-FR")}
                  </span>
                  <span className="mb-1.5 text-sm font-medium text-slate-400">{period}</span>
                </div>

                <div className="mb-8 h-px w-full bg-slate-100" />

                <ul className="mb-10 flex-grow space-y-4">
                  {plan.features.map((f) => (
                    <li key={`${f.text ?? ""}-${f.bold ?? ""}`} className={`flex items-start gap-3 text-sm ${f.included ? "text-slate-600" : "text-slate-400"}`}>
                      {f.included
                        ? <CheckIcon className="mt-0.5 flex-shrink-0 text-indigo-500" />
                        : <DashIcon className="mt-0.5 flex-shrink-0 text-slate-300" />
                      }
                      <span>
                        {f.bold && !f.text && <span className="font-medium text-slate-900">{f.bold}</span>}
                        {f.bold && !f.text && f.suffix}
                        {f.text && !f.bold && f.text}
                        {f.text && f.bold && <>{f.text}<span className="font-medium text-slate-900">{f.bold}</span></>}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/inscription"
                  className={`w-full rounded-xl py-3.5 text-center text-sm font-medium transition-all duration-200 ${
                    plans.indexOf(plan) === 0
                      ? "border border-slate-200 bg-white text-indigo-950 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                      : "border border-transparent bg-slate-100 text-indigo-950 hover:bg-slate-200"
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
