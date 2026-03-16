"use client";

import Link from "next/link";

import { useLanguage } from "@/lib/language-context";

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden border-t border-slate-100 bg-white py-24 sm:py-32"
      style={{
        backgroundSize: "32px 32px",
        backgroundImage:
          "linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)",
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-1/2 left-0 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-100/40 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 right-0 h-150 w-150 translate-x-1/4 -translate-y-1/3 rounded-full bg-lime-100/30 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-medium tracking-tight text-indigo-950 md:text-5xl">
          {t.home.ctaTitle}
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-500">
          {t.home.ctaSub}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/forfaits"
            className="inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-8 py-3.5 text-sm font-medium text-indigo-950 shadow-sm transition-colors hover:bg-yellow-500 sm:w-auto"
          >
            {t.home.ctaButton}
          </Link>
          <a
            href="https://wa.me/221770000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-medium text-indigo-950 shadow-card transition-colors hover:bg-slate-50 sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-900/70" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              <path d="M14.05 2a9 9 0 0 1 8 7.94" />
              <path d="M14.05 6A5 5 0 0 1 18 10" />
            </svg>
            {t.home.ctaWhatsapp}
          </a>
        </div>
      </div>
    </section>
  );
}
