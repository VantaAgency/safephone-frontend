"use client";

import Image from "next/image";

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
          <div className="cursor-pointer opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
            <Image src="/wave.png" alt="Wave" width={160} height={64} className="h-16 w-auto object-contain" />
          </div>

          {/* Orange Money */}
          <div className="cursor-pointer opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
            <Image src="/orangeMoneyLogo.png" alt="Orange Money" width={160} height={64} className="h-16 w-auto object-contain" />
          </div>

          {/* Free Money */}
          <div className="cursor-pointer opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
            <Image src="/freemoney.svg" alt="Free Money" width={160} height={64} className="h-16 w-auto object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}
