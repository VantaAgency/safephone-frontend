"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routesFor } from "@/lib/markets/routes";

export default function USCheckoutSuccessPage() {
  const routes = routesFor("US");

  return (
    <div className="relative isolate overflow-hidden bg-[#FAFAF8] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-28 right-0 h-[420px] w-[420px] rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-[320px] w-[320px] rounded-full bg-indigo-100/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-5 md:px-10">
        <div className="rounded-[2.2rem] border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-600"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            Membership active
          </div>

          <h1 className="mb-4 text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl">
            You&apos;re protected.
          </h1>
          <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-slate-500">
            Thanks for joining SafePhone. Next, tell us which phone is covered so
            you can file a claim the moment something happens.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
            <Link href="/us/register-device" className="w-full md:w-auto">
              <Button variant="primary" size="lg" fullWidth className="rounded-xl">
                Register your phone
              </Button>
            </Link>
            <Link href={routes.dashboard} className="w-full md:w-auto">
              <Button variant="outline" size="lg" fullWidth className="rounded-xl">
                Go to dashboard
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            A receipt is on its way to your inbox.
          </p>
        </div>
      </div>
    </div>
  );
}
