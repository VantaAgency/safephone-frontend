"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routesFor } from "@/lib/markets/routes";

const STEPS = [
  {
    n: "01",
    title: "Pick a plan",
    body:
      "Choose the SafePhone plan that fits your phone and the way you use it. Monthly memberships, no long contracts, cancel anytime.",
  },
  {
    n: "02",
    title: "Register your phone",
    body:
      "Right after checkout, tell us your phone's brand and model — and optionally its IMEI. This is what we'll cover.",
  },
  {
    n: "03",
    title: "Pay securely",
    body:
      "Payments are processed by Stripe with industry-standard encryption. We never store your card details.",
  },
  {
    n: "04",
    title: "File a claim",
    body:
      "Something happened? Open a claim from your dashboard. We route you to an approved repair partner and you only pay the deductible.",
  },
];

const PRINCIPLES = [
  {
    title: "Phone repair protection — not insurance",
    body:
      "SafePhone is a membership program for accidental damage repairs. We're not an insurance company and we don't underwrite policies.",
  },
  {
    title: "Approved partner network",
    body:
      "Our nationwide network of independent repair shops uses quality parts and stands behind every repair.",
  },
  {
    title: "Clear costs upfront",
    body:
      "A flat monthly membership and a deductible per claim. No surprise fees, no inflated parts pricing at repair time.",
  },
  {
    title: "Cancel any time",
    body:
      "No 24-month contract, no early-termination fee. Stay as long as you find it useful.",
  },
];

export default function USHowItWorksPage() {
  const routes = routesFor("US");

  return (
    <div className="relative isolate overflow-hidden bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-28 right-0 h-[420px] w-[420px] rounded-full bg-indigo-100/35 blur-3xl" />
          <div className="absolute top-1/3 -left-24 h-[320px] w-[320px] rounded-full bg-yellow-100/35 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center md:px-10">
          <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            How it works
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl lg:text-5xl">
            Affordable phone repair protection,
            <br />
            without the confusion.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-500">
            Four straightforward steps from signing up to getting your phone
            fixed by an approved repair partner.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="relative pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:p-8"
              >
                <div className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
                  {step.n}
                </div>
                <h3 className="mb-3 text-lg font-medium tracking-tight text-indigo-950">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="relative bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <h2 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl">
              What SafePhone is — and isn&apos;t.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              The fine print, in plain English.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="rounded-[2rem] border border-slate-200/80 bg-[#FAFAF8] p-6 md:p-8"
              >
                <h3 className="mb-3 text-lg font-medium tracking-tight text-indigo-950">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-10">
          <h2 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl">
            Ready to protect your phone?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-500">
            Pick a plan in under a minute. Cancel any time.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 md:flex-row">
            <Link href={routes.plans} className="w-full md:w-auto">
              <Button variant="primary" size="lg" fullWidth className="rounded-xl">
                See plans
              </Button>
            </Link>
            <Link href={routes.contact} className="w-full md:w-auto">
              <Button variant="outline" size="lg" fullWidth className="rounded-xl">
                Talk to us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
