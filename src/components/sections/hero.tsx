"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-slate-50 pt-16 pb-20 md:pt-24 md:pb-32">
      {/* Background decorative blurs */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute top-48 -left-24 h-72 w-72 rounded-full bg-yellow-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 md:flex-row lg:gap-24">
          {/* Content */}
          <div className="flex w-full flex-col items-start text-left md:w-1/2">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              {t.hero.badge}
            </div>

            <h1 className="mb-6 text-4xl font-medium tracking-tighter leading-tight text-indigo-950 md:text-5xl lg:text-6xl">
              {t.hero.title}
            </h1>

            <p className="mb-8 max-w-lg text-base leading-relaxed text-slate-500 md:text-lg">
              {t.hero.subtitle}
            </p>

            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/forfaits"
                className="inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-medium text-indigo-950 shadow-sm transition-colors hover:bg-yellow-500 sm:w-auto"
              >
                {t.hero.cta}
              </Link>
              <Link
                href="#comment-ca-marche"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-indigo-950 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
              >
                {t.hero.secondaryCta}
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-xs font-medium text-slate-400">
              <div className="flex -space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-indigo-100 text-[10px] font-medium text-indigo-600">AD</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-yellow-100 text-[10px] font-medium text-yellow-600">MF</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-green-100 text-[10px] font-medium text-green-600">OS</div>
              </div>
              <p>{t.hero.socialProof}</p>
            </div>
          </div>

          {/* Visual */}
          <div className="relative flex min-h-[480px] w-full items-center justify-center md:w-1/2">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="absolute top-1/4 right-0 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />
              <div className="absolute bottom-10 left-0 h-64 w-64 rounded-full bg-yellow-200/50 blur-3xl" />
            </div>

            {/* Central Card */}
            <div className="relative z-10 mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 shadow-sm">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium tracking-tight text-indigo-950">iPhone 15 Pro</h3>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                      </span>
                      <span className="text-xs font-medium text-green-600">{t.hero.activeSubscription}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 py-6">
                {[
                  { color: "text-indigo-600", title: t.hero.value1Title, desc: t.hero.value1Desc, icon: "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z", hasLine: true },
                  { color: "text-yellow-500", title: t.hero.value2Title, desc: t.hero.value2Desc, icon: "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", hasLine: true },
                  { color: "text-indigo-600", title: t.hero.value3Title, desc: t.hero.value3Desc, icon: "M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z", hasLine: false },
                ].map((item, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    {item.hasLine && <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-slate-100" />}
                    <div className={`z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 shadow-sm ${item.color}`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-indigo-950">{item.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating: Claim */}
            <div className="absolute top-0 -right-2 z-20 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl shadow-slate-200/60 animate-[bounce_4s_infinite] sm:flex md:-right-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                </svg>
              </div>
              <div className="pr-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{t.hero.floatingClaimLabel}</p>
                <p className="text-sm font-medium tracking-tight text-indigo-950">{t.hero.floatingClaimValue}</p>
              </div>
            </div>

            {/* Floating: MobiTech */}
            <div className="absolute bottom-4 -left-2 z-20 hidden items-center gap-3 rounded-2xl border border-indigo-800 bg-indigo-950 p-3 shadow-xl shadow-indigo-900/30 animate-[bounce_4s_infinite_150ms] sm:flex md:-left-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-indigo-950 shadow-inner">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.82-5.82m0 0l-1.6 1.6m1.6-1.6l1.6 1.6m-1.6-1.6L3 12m8.42 3.17l5.82-5.82m0 0l1.6 1.6m-1.6-1.6l-1.6 1.6m1.6-1.6L21 12" />
                </svg>
              </div>
              <div className="pr-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-300">{t.hero.floatingNetworkLabel}</p>
                <p className="text-sm font-medium tracking-tight text-white">{t.hero.floatingNetworkValue}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
