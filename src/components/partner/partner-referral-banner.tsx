"use client";

import { useSearchParams } from "next/navigation";
import { usePartnerReferral } from "@/lib/api/hooks";
import { readPartnerReferralCookies } from "@/lib/partner-referrals";
import { useLanguage } from "@/lib/language-context";

/**
 * Reassures a visitor who arrived via a partner link/QR that their purchase is
 * attributed to that partner — the US-flow equivalent of the banner the SN
 * InscriptionPage shows. Renders nothing when there's no partner referral.
 */
export function PartnerReferralBanner({ className }: { className?: string }) {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();

  const stored = readPartnerReferralCookies();
  const partnerCode = searchParams.get("partner")?.trim() || stored.code || "";
  const { data: referral } = usePartnerReferral(partnerCode, {
    enabled: !!partnerCode,
  });

  if (!partnerCode || !referral?.partner_store_name) return null;

  return (
    <div
      className={`rounded-[1.75rem] border border-emerald-200/80 bg-emerald-50 px-5 py-4 text-left shadow-sm ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            {lang === "fr"
              ? `Vous êtes accompagné par ${referral.partner_store_name}`
              : `You are signing up with ${referral.partner_store_name}`}
          </p>
          <p className="mt-1 text-sm text-emerald-900/80">
            {lang === "fr"
              ? "Votre attribution partenaire est enregistrée automatiquement."
              : "Your partner attribution is recorded automatically."}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
          {lang === "fr" ? "Attribution active" : "Attribution active"}
        </span>
      </div>
    </div>
  );
}
