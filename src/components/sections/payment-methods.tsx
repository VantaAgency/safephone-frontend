"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { useLanguage } from "@/lib/language-context";
import { useMarket } from "@/lib/markets/context";

/**
 * Inline brand marks rendered for US market. Sized to roughly match the
 * h-16 box used by the SN PNG logos so the section reads as identical
 * "row of payment methods" on both markets.
 */
function BrandSVG({ brand }: { brand: string }): ReactNode {
  switch (brand) {
    case "visa":
      return (
        <svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg" className="h-16 w-auto">
          <text
            x="80"
            y="44"
            textAnchor="middle"
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontWeight="800"
            fontSize="36"
            fontStyle="italic"
            fill="#1A1F71"
          >
            VISA
          </text>
        </svg>
      );
    case "mastercard":
      return (
        <svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg" className="h-16 w-auto">
          <circle cx="68" cy="32" r="20" fill="#EB001B" />
          <circle cx="92" cy="32" r="20" fill="#F79E1B" />
          <path d="M80 16a20 20 0 0 1 0 32 20 20 0 0 1 0-32z" fill="#FF5F00" />
        </svg>
      );
    case "amex":
      return (
        <svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg" className="h-16 w-auto">
          <rect x="20" y="14" width="120" height="36" rx="4" fill="#2E77BB" />
          <text
            x="80"
            y="38"
            textAnchor="middle"
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontWeight="700"
            fontSize="12"
            letterSpacing="1.5"
            fill="#ffffff"
          >
            AMERICAN EXPRESS
          </text>
        </svg>
      );
    case "applepay":
      return (
        <svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg" className="h-16 w-auto">
          <g fill="#000000">
            <path d="M44 28c1-1.3 1.8-3.1 1.6-4.9-1.5.1-3.4 1-4.5 2.3-1 1.1-1.8 2.9-1.6 4.6 1.7.2 3.4-.8 4.5-2zm1.5 2.4c-2.4-.2-4.5 1.4-5.7 1.4s-3-1.3-5-1.3c-2.6 0-4.9 1.5-6.3 3.8-2.7 4.7-.7 11.6 1.9 15.4 1.3 1.9 2.8 3.9 4.8 3.9 1.9 0 2.6-1.2 5-1.2 2.3 0 2.9 1.2 5 1.2 2 0 3.4-1.9 4.6-3.8 1.5-2.2 2.1-4.2 2.1-4.3-.1 0-4-1.6-4-6.1 0-3.8 3.1-5.6 3.3-5.7-1.8-2.5-4.6-2.8-5.6-3.1z" />
            <text
              x="58"
              y="44"
              fontFamily="'Helvetica Neue', Arial, sans-serif"
              fontWeight="600"
              fontSize="24"
              fill="#000000"
            >
              Pay
            </text>
          </g>
        </svg>
      );
    case "googlepay":
      return (
        <svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg" className="h-16 w-auto">
          <text
            x="80"
            y="42"
            textAnchor="middle"
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontWeight="500"
            fontSize="22"
          >
            <tspan fill="#4285F4">G</tspan>
            <tspan fill="#EA4335">o</tspan>
            <tspan fill="#FBBC04">o</tspan>
            <tspan fill="#4285F4">g</tspan>
            <tspan fill="#34A853">l</tspan>
            <tspan fill="#EA4335">e</tspan>
            <tspan fill="#5F6368" dx="6">Pay</tspan>
          </text>
        </svg>
      );
    default:
      return null;
  }
}

export function PaymentMethods() {
  const { t } = useLanguage();
  const { market } = useMarket();

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
          {market.payment.methodLogos.map((method) => (
            <div
              key={method.key}
              className="cursor-pointer opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              aria-label={method.alt}
            >
              {method.kind === "image" && method.src ? (
                <Image
                  src={method.src}
                  alt={method.alt}
                  width={160}
                  height={64}
                  className="h-16 w-auto object-contain"
                />
              ) : method.kind === "svgBrand" && method.svgBrand ? (
                <BrandSVG brand={method.svgBrand} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
