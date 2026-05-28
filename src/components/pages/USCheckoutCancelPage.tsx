"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routesFor } from "@/lib/markets/routes";

export default function USCheckoutCancelPage() {
  const routes = routesFor("US");

  return (
    <div className="relative isolate overflow-hidden bg-[#FAFAF8] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-28 right-0 h-[420px] w-[420px] rounded-full bg-indigo-100/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-5 md:px-10">
        <div className="rounded-[2.2rem] border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            Checkout cancelled
          </div>

          <h1 className="mb-4 text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl">
            No worries — nothing was charged.
          </h1>
          <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-slate-500">
            You can pick a plan and try again whenever you&apos;re ready.
            Questions? We&apos;re a message away.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
            <Link href={routes.plans} className="w-full md:w-auto">
              <Button variant="primary" size="lg" fullWidth className="rounded-xl">
                Back to plans
              </Button>
            </Link>
            <Link href={routes.contact} className="w-full md:w-auto">
              <Button variant="outline" size="lg" fullWidth className="rounded-xl">
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
