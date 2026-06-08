"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { useClaimPartnerReferral, usePartnerReferral } from "@/lib/api/hooks";
import {
  normalizePartnerReferralSourceMedium,
  readPartnerReferralCookies,
} from "@/lib/partner-referrals";

/**
 * Attributes the visitor to a partner once they're authenticated, reading the
 * referral code from the `?partner=` query or the cookie set by /p/[code].
 *
 * The SN flow claims inline in InscriptionPage; the US signup/checkout flow has
 * no such step, so mount this hook on the US entry pages. Fires once per
 * (code, user); the backend is idempotent on repeat claims.
 */
export function usePartnerReferralClaim() {
  const { user, isPending: authPending } = useAuth();
  const searchParams = useSearchParams();

  const stored = readPartnerReferralCookies();
  const partnerCode = searchParams.get("partner")?.trim() || stored.code || "";
  const sourceMedium = normalizePartnerReferralSourceMedium(
    searchParams.get("src") || stored.sourceMedium,
  );

  const { data: referral } = usePartnerReferral(partnerCode, {
    enabled: !!partnerCode,
  });
  const claim = useClaimPartnerReferral();
  const attemptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!partnerCode || !user?.id || !referral || authPending) return;
    const key = `${partnerCode}:${user.id}`;
    if (attemptedRef.current === key) return;
    attemptedRef.current = key;
    claim.mutate({ code: partnerCode, data: { source_medium: sourceMedium } });
  }, [partnerCode, user?.id, referral, authPending, sourceMedium, claim]);
}
