"use client";

import Link from "next/link";

import { useLanguage } from "@/lib/language-context";

export function PartnerSection() {
  const { t } = useLanguage();

  const benefits = [
    {
      title: t.home.partnerBenefit1Title,
      desc: t.home.partnerBenefit1Desc,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 8H5a2 2 0 0 1-2-2V5" />
          <path d="M22 12h-4v4h4v-4Z" />
        </svg>
      ),
    },
    {
      title: t.home.partnerBenefit2Title,
      desc: t.home.partnerBenefit2Desc,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      title: t.home.partnerBenefit3Title,
      desc: t.home.partnerBenefit3Desc,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-indigo-950 pb-20 pt-20 md:py-24">
      {/* Background decor */}
      <div className="pointer-events-none absolute top-0 right-0 h-200 w-200 translate-x-1/3 -translate-y-1/3 rounded-full bg-indigo-900 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-150 w-150 -translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-900/40 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-12 md:flex-row lg:gap-16">
          {/* Left content */}
          <div className="w-full max-w-xl md:w-1/2">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-800 bg-indigo-900/50 px-3 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400" aria-hidden="true">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h2V14h8v8h2a2 2 0 0 0 2-2v-8" />
                <path d="M2 7h20v3.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 10.5Z" />
              </svg>
              {t.home.partnerBadge}
            </div>

            <h2 className="mb-6 text-3xl font-normal leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              {t.home.partnerTitle}
            </h2>
            <p className="mb-10 text-base leading-relaxed text-indigo-200/90">
              {t.home.partnerSub}
            </p>

            <div className="mb-10 space-y-6">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-yellow-400 shadow-inner">
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="mb-1 text-base font-medium text-white">{b.title}</h4>
                    <p className="text-sm leading-relaxed text-indigo-300">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/partenaires"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-8 py-4 text-sm font-medium text-indigo-950 shadow-lg shadow-yellow-400/20 transition-colors hover:bg-yellow-500"
            >
              {t.home.partnerCta}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Right: partner dashboard mockup */}
          <div className="group relative mx-auto w-full max-w-md md:w-1/2 lg:max-w-lg">
            <div className="absolute -inset-1 rounded-[2.5rem] bg-linear-to-r from-indigo-500/20 to-yellow-400/20 opacity-50 blur-xl transition duration-500 group-hover:opacity-70" />
            <div className="relative overflow-hidden rounded-[2rem] border border-indigo-700/50 bg-indigo-900/40 p-6 shadow-2xl backdrop-blur-xl">
              {/* Top bar */}
              <div className="mb-6 flex items-center justify-between border-b border-indigo-800/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-700 bg-indigo-800 text-sm font-medium text-indigo-200 shadow-sm">TM</div>
                  <div>
                    <h4 className="text-sm font-medium tracking-tight text-white">Touba Mobile</h4>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-300/80">ID: #SP-8492</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1.5 text-[10px] font-medium text-green-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                  </span>
                  Connecté
                </div>
              </div>

              {/* Main metric */}
              <div className="relative mb-4 overflow-hidden rounded-2xl border border-indigo-800/40 bg-indigo-950/60 p-5 shadow-inner transition-colors duration-300 group-hover:border-indigo-700/50">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400" aria-hidden="true">
                        <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
                      </svg>
                      Commissions d&apos;acquisition
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-normal tracking-tighter text-white">145 000</span>
                      <span className="text-sm font-medium text-indigo-400">FCFA total</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-green-400/10 bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                    +12%
                  </div>
                </div>
                {/* Bar chart */}
                <div className="mt-2 flex h-14 items-end justify-between gap-1.5 px-1">
                  {([30, 45, 25, 60, 50, 80, 100] as const).map((h, idx) => (
                    <div
                      key={h}
                      className={`w-full rounded-t-md transition-colors ${idx === 6 ? "bg-yellow-400/90 shadow-[0_0_12px_rgba(250,204,21,0.4)]" : "bg-indigo-800/30 hover:bg-indigo-500/50"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary metrics */}
              <div className="mb-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-indigo-800/30 bg-indigo-950/40 p-3.5">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-indigo-300">Clients inscrits</p>
                  <p className="text-xl font-medium tracking-tight text-white">42</p>
                </div>
                <div className="rounded-xl border border-indigo-800/30 bg-indigo-950/40 p-3.5">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-indigo-300">Commission attribuée</p>
                  <p className="text-xl font-medium tracking-tight text-white">12%</p>
                </div>
              </div>

              {/* Recent activity */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-indigo-200">Dernières commissions uniques</p>
                  <span className="text-[10px] font-medium text-indigo-400">Tout voir</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { phone: "77 *** ** 45", plan: "Forfait Écran+", time: "14:30", amount: "+2 000 F" },
                    { phone: "76 *** ** 12", plan: "Forfait Essentiel", time: "Hier", amount: "+1 500 F" },
                  ].map((tx) => (
                    <div key={tx.phone} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/3 p-3 transition-colors hover:bg-white/6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/20 text-indigo-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                            <path d="M12 18h.01" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium tracking-tight text-white">Client: {tx.phone}</p>
                          <p className="mt-0.5 text-[10px] text-indigo-300">1er paiement • {tx.plan} • {tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-400">{tx.amount}</p>
                        <p className="mt-0.5 text-[10px] text-indigo-300">Validé</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
