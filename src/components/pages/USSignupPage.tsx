"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { ApiError } from "@/lib/api/client";
import { useStripeCheckout } from "@/lib/api/hooks";
import { usePartnerReferralClaim } from "@/lib/hooks/use-partner-referral-claim";
import { routesFor } from "@/lib/markets/routes";

export default function USSignupPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <USSignupContent />
    </Suspense>
  );
}

function USSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isPending: authPending } = useAuth();
  // Attribute the signup to a partner if the visitor arrived via /p/<code>
  // (the US flow has no inline claim step like the SN InscriptionPage).
  usePartnerReferralClaim();
  const checkout = useStripeCheckout();
  const planSlug = (searchParams.get("plan") ?? "").trim();
  const billingCycle =
    searchParams.get("billing") === "annual" ? "annual" : "monthly";
  const triggeredRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const routes = routesFor("US");

  // Imperative flow — mutateAsync + await + window.location.assign.
  // Earlier callback/effect-watching approaches got skipped by React's
  // StrictMode double-mount in dev. Awaiting inline keeps the response in
  // closure scope so the redirect always fires when the request succeeds.
  useEffect(() => {
    if (!planSlug) {
      router.replace(routes.plans);
      return;
    }
    if (authPending) return;
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(
        `/us/signup?plan=${planSlug}&billing=${billingCycle}`,
      );
      router.replace(`${routes.login}?redirect=${redirect}`);
      return;
    }
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    void (async () => {
      try {
        const { checkout_url } = await checkout.mutateAsync({
          planSlug,
          billingCycle,
        });
        if (typeof window !== "undefined" && checkout_url) {
          window.location.assign(checkout_url);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "We couldn't start your checkout. Please try again.",
        );
        triggeredRef.current = false;
      }
    })();
    // checkout from React Query is stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planSlug, isAuthenticated, authPending, router]);

  if (errorMessage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAF8] px-5">
        <div className="mx-auto max-w-md rounded-[2rem] border border-red-200/80 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-xl font-medium tracking-tight text-indigo-950">
            Checkout couldn&apos;t start
          </h1>
          <p className="mb-6 text-sm text-slate-500">{errorMessage}</p>
          <Link
            href={routes.plans}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-indigo-950 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to pricing
          </Link>
        </div>
      </div>
    );
  }

  return <LoadingState />;
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAF8] px-5">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-5 h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <h1 className="mb-2 text-xl font-medium tracking-tight text-indigo-950">
          Preparing your secure checkout
        </h1>
        <p className="text-sm text-slate-500">
          You&apos;ll be redirected to Stripe in a moment.
        </p>
      </div>
    </div>
  );
}
