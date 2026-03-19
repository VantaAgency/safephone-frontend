"use client";

import Link from "next/link";

import { useLanguage } from "@/lib/language-context";

export function WhySafephoneSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header — left-aligned */}
        <div className="mb-16 max-w-3xl md:mb-20">
          <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.home.whyBadge}
            </span>
          </div>
          <h2 className="text-4xl font-medium tracking-tight text-indigo-950 md:text-5xl leading-tight">
            {t.home.whyTitle}
          </h2>
        </div>

        {/* Asymmetrical Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left column — 8 cols */}
          <div className="flex flex-col gap-6 lg:col-span-8 lg:gap-8">
            {/* Top row: 2 cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              {/* Card 1 */}
              <div className="flex flex-col rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md md:p-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100/50 bg-indigo-50 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-medium tracking-tight text-indigo-950">
                  {t.home.whyFeature1Title}
                </h3>
                <p className="text-base leading-relaxed text-slate-500">
                  {t.home.whyFeature1Desc}
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md md:p-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-100/50 bg-yellow-50 text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                    <path d="m12 14 4-4" />
                    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-medium tracking-tight text-indigo-950">
                  {t.home.whyFeature2Title}
                </h3>
                <p className="text-base leading-relaxed text-slate-500">
                  {t.home.whyFeature2Desc}
                </p>
              </div>
            </div>

            {/* Bottom: wide card */}
            <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md md:p-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-100/50 bg-green-50 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-medium tracking-tight text-indigo-950">
                {t.home.whyFeature3Title}
              </h3>
              <p className="max-w-3xl text-base leading-relaxed text-slate-500">
                {t.home.whyFeature3Desc}
              </p>
            </div>
          </div>

          {/* Right column — 4 cols */}
          <div className="mt-6 lg:col-span-4 lg:mt-0">
            <div className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-indigo-950 p-8 shadow-xl shadow-indigo-900/20 md:p-10">
              {/* Glow */}
              <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-indigo-500/20 blur-3xl transition-transform duration-700 group-hover:translate-x-1/4" />

              <div className="relative z-10 grow">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white backdrop-blur-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.89 0 4.87 1 6.82 2.12A1 1 0 0 1 20 6z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="mb-6 text-2xl font-medium tracking-tight text-white">
                  {t.home.whyHighlightTitle}
                </h3>
                <p className="mb-6 text-base leading-relaxed text-indigo-200">
                  {t.home.whyHighlightP1}
                </p>
                <p className="text-base leading-relaxed text-indigo-200">
                  {t.home.whyHighlightP2}
                </p>
              </div>

              <div className="relative z-10 mt-10 border-t border-indigo-800/50 pt-4">
                <Link
                  href="/forfaits"
                  className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-4 text-base font-medium text-indigo-950 shadow-sm transition-all hover:bg-yellow-500"
                >
                  {t.home.whyHighlightCta}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-1" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
