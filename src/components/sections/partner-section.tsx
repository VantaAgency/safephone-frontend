"use client";

import Link from "next/link";

import { useLanguage } from "@/lib/language-context";
import { useMarket } from "@/lib/markets/context";
import { routesFor } from "@/lib/markets/routes";

export function PartnerSection() {
  const { lang, t } = useLanguage();
  const { market } = useMarket();
  const routes = routesFor(market.code);

  const learnMoreLabel = lang === "fr" ? "En savoir plus" : "Learn more";

  const benefits = [
    {
      title: t.home.partnerBenefit1Title,
      desc: t.home.partnerBenefit1Desc,
    },
    {
      title: t.home.partnerBenefit2Title,
      desc: t.home.partnerBenefit2Desc,
    },
    {
      title: t.home.partnerBenefit3Title,
      desc: t.home.partnerBenefit3Desc,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-indigo-950 pb-20 pt-20 md:py-24">
      {/* Background decor */}
      <div className="pointer-events-none absolute top-0 right-0 h-200 w-200 translate-x-1/3 -translate-y-1/3 rounded-full bg-indigo-900 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-150 w-150 -translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-900/40 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top header — two-column split: title left, description + CTA right */}
        <div className="mb-12 flex flex-col gap-10 md:mb-16 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              {t.home.partnerTitle}
            </h2>
          </div>

          <div className="md:max-w-md">
            <p className="mb-8 text-base leading-relaxed text-indigo-200/90 md:text-lg">
              {t.home.partnerSub}
            </p>
            <Link
              href={routes.partners}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-8 py-4 text-sm font-medium text-indigo-950 transition-colors hover:bg-yellow-500"
            >
              {t.home.partnerCta}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Cards row — 3 benefits as their own visual cards */}
        <div className="grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-indigo-800/40 bg-indigo-900/40 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-indigo-700/60 hover:shadow-2xl hover:shadow-indigo-950/30 md:p-7"
            >
              {/* Title + description */}
              <div className="mb-8 flex-grow space-y-3">
                <h3 className="text-xl font-medium leading-tight tracking-tight text-white md:text-2xl">
                  {b.title}
                </h3>
                <p className="text-sm leading-relaxed text-indigo-200/80">
                  {b.desc}
                </p>
              </div>

              {/* Bottom: learn-more pill */}
              <Link
                href={routes.partners}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-700/50 bg-indigo-950/60 px-4 py-2 text-xs font-medium text-indigo-200 transition-colors hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-300"
              >
                {learnMoreLabel}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
