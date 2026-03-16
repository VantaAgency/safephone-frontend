"use client";

import { useLanguage } from "@/lib/language-context";

export function PaymentMethods() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-y border-slate-200/60 bg-white py-12">
      {/* Subtle center gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <div className="h-full w-full max-w-3xl bg-linear-to-r from-transparent via-slate-100 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
          {t.home.paymentBanner}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 lg:gap-20">
          {/* Wave */}
          <div className="flex cursor-pointer items-center gap-2 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-wave" aria-hidden="true">
              <path d="M2 6c.6 0 1.2-.2 1.6-.6C4 5 4.6 4.8 5.2 4.8c.6 0 1.2.2 1.6.6.4.4 1 .6 1.6.6.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6.6 0 1.2-.2 1.6-.6.4-.4 1 .6 1.6.6" />
              <path d="M2 12c.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6.6 0 1.2.2 1.6.6.4-.4 1-.6 1.6-.6.6 0 1.2.2 1.6.6.4-.4 1-.6 1.6-.6.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6.6 0 1.2-.2 1.6.6.4-.4 1 .6 1.6.6" />
              <path d="M2 18c.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6.6 0 1.2.2 1.6.6.4-.4 1-.6 1.6-.6.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6.6 0 1.2-.2 1.6.6.4-.4 1 .6 1.6.6" />
            </svg>
            <span className="text-2xl font-semibold tracking-tighter text-wave">wave</span>
          </div>

          {/* Orange Money */}
          <div className="flex cursor-pointer items-center gap-2.5 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
            <div className="h-6 w-6 rounded bg-orange-money shadow-sm" />
            <span className="text-2xl font-medium tracking-tight text-slate-900">
              orange<span className="font-semibold text-orange-money">money</span>
            </span>
          </div>

          {/* Free Money */}
          <div className="flex cursor-pointer items-center gap-1.5 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
            <span className="text-2xl font-bold italic tracking-tighter text-free-money">Free</span>
            <span className="text-xl font-medium tracking-tight text-slate-800">money</span>
          </div>

          {/* Cards */}
          <div className="flex cursor-pointer items-center gap-2 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
            <span className="text-lg font-bold tracking-tight text-slate-400">{t.home.cardAccepted}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
