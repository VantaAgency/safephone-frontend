"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, CheckIcon, PhoneIcon } from "@/components/ui/icons";
import { DEVICE_BRANDS, PAYMENT_METHODS } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { usePlans, useUpdatePartnerClientStatus } from "@/lib/api/hooks";
import { PlanCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/api/types";

export default function InscriptionPage() {
  return (
    <Suspense>
      <InscriptionContent />
    </Suspense>
  );
}

function InscriptionContent() {
  const { lang, t } = useLanguage();
  const updateClientStatus = useUpdatePartnerClientStatus();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: plans, isLoading: plansLoading } = usePlans();

  const partnerCode = searchParams.get("partner");
  const clientId = searchParams.get("client");

  const preselectedPlan = searchParams.get("plan") ?? "";

  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState(preselectedPlan);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [annual, setAnnual] = useState(false);

  const stepLabels = [
    t.register.stepPlan,
    lang === "fr" ? "Marque" : "Brand",
    lang === "fr" ? "Confirmation" : "Confirm",
  ];

  const selectedPlanObj = plans?.find((p) => p.id === selectedPlanId || p.slug === selectedPlanId);

  // Auto-select first plan if preselected doesn't match and plans are loaded
  if (plans && plans.length > 0 && !selectedPlanObj && !selectedPlanId) {
    const popular = plans.find((p) => p.is_popular);
    if (popular) setSelectedPlanId(popular.id);
  }

  const getPlanName = (plan: Plan) =>
    lang === "fr" ? plan.name_fr : plan.name_en;

  const handleContinueToPay = () => {
    if (clientId) {
      // Best-effort: update client status in partner pipeline (don't block navigation on failure)
      updateClientStatus.mutate({
        clientId,
        data: { status: "plan_purchased", plan_id: selectedPlanId || undefined },
      });
    }
    router.push(`/paiement?plan=${selectedPlanId}&brand=${selectedBrand}&annual=${annual}`);
  };

  const getBrandLabel = (brand: (typeof DEVICE_BRANDS)[number]) =>
    lang === "fr" ? brand.labelFr : brand.labelEn;

  return (
    <div className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-xl px-5 md:px-8">

        {/* Partner referral banner */}
        {partnerCode && (
          <div className="mb-6 rounded-[2rem] border border-indigo-200/60 bg-indigo-50 px-5 py-3">
            <p className="text-sm text-indigo-700">
              <span className="font-semibold">
                {lang === "fr" ? "Invitation partenaire" : "Partner invitation"}
              </span>
              {" — "}
              {lang === "fr"
                ? "Vous avez été invité par Boutique Diallo Mobile."
                : "You were invited by Boutique Diallo Mobile."}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950">
            {t.register.title}
          </h1>
          <p className="mt-2 text-slate-500">
            {lang === "fr"
              ? "Choisissez votre formule, sélectionnez votre marque. Simple et rapide."
              : "Choose your plan, select your brand. Simple and quick."}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10 flex items-center gap-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step > i + 1
                    ? "bg-emerald-500 text-white"
                    : step === i + 1
                      ? "bg-indigo-950 text-white"
                      : "bg-slate-100 text-slate-400"
                )}
              >
                {step > i + 1 ? <CheckIcon size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  step === i + 1 ? "text-indigo-950" : "text-slate-400"
                )}
              >
                {label}
              </span>
              {i < 2 && (
                <div className={cn("h-px flex-1", step > i + 1 ? "bg-emerald-500" : "bg-slate-200")} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Plan Selection */}
        {step === 1 && (
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
            {/* Billing toggle */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium text-indigo-950">{t.register.plan}</h2>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium", !annual ? "text-indigo-950" : "text-slate-400")}>
                  {t.plans.monthly}
                </span>
                <button
                  type="button"
                  onClick={() => setAnnual(!annual)}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors cursor-pointer",
                    annual ? "bg-indigo-950" : "bg-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                      annual ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
                <span className={cn("text-xs font-medium", annual ? "text-indigo-950" : "text-slate-400")}>
                  {t.plans.annual}
                  <span className="ml-1 text-yellow-500">{t.plans.save}</span>
                </span>
              </div>
            </div>

            {plansLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PlanCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {plans?.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition-all",
                      selectedPlanId === p.id
                        ? "border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400/30"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-indigo-950">
                          SafePhone {getPlanName(p)}
                        </span>
                        {p.is_popular && (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-600">
                            {t.plans.popular}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-medium text-indigo-950">
                        {(annual ? p.price_annual : p.price_monthly).toLocaleString("fr-FR")}
                      </div>
                      <div className="text-xs text-slate-400">
                        XOF{annual ? t.plans.perYear : t.plans.perMonth}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="mt-6"
              onClick={() => setStep(2)}
              disabled={!selectedPlanId}
            >
              {lang === "fr" ? "Continuer →" : "Continue →"}
            </Button>
          </div>
        )}

        {/* Step 2: Brand Selection */}
        {step === 2 && (
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-2 text-lg font-medium text-indigo-950">
              {lang === "fr" ? "Quel est votre téléphone ?" : "What's your phone?"}
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              {lang === "fr"
                ? "Sélectionnez votre marque. Le modèle et l'IMEI seront demandés après souscription."
                : "Select your brand. Model and IMEI will be requested after subscription."}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DEVICE_BRANDS.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setSelectedBrand(brand.id)}
                  data-brand-slug={brand.id}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all",
                    selectedBrand === brand.id
                      ? "border-indigo-950 bg-indigo-950/5 ring-1 ring-indigo-950/20"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg"
                  )}
                >
                  <div
                    className={cn(
                      "mb-2 flex h-10 w-10 items-center justify-center rounded-xl",
                      selectedBrand === brand.id ? "bg-indigo-950/10" : "bg-slate-50"
                    )}
                  >
                    <PhoneIcon
                      size={20}
                      className={selectedBrand === brand.id ? "text-indigo-950" : "text-slate-400"}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      selectedBrand === brand.id ? "text-indigo-950" : "text-indigo-950"
                    )}
                  >
                    {getBrandLabel(brand)}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(1)}>
                {t.common.back}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-2"
                onClick={() => setStep(3)}
                disabled={!selectedBrand}
              >
                {lang === "fr" ? "Continuer →" : "Continue →"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedPlanObj && (
          <div>
            {/* Summary card */}
            <div className="rounded-[2rem] border border-yellow-300/40 bg-yellow-50 p-6">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-600">
                <CheckCircleIcon size={14} />
                {lang === "fr" ? "Récapitulatif" : "Summary"}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {lang === "fr" ? "Formule" : "Plan"}
                  </span>
                  <span className="font-medium text-indigo-950">
                    SafePhone {getPlanName(selectedPlanObj)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {lang === "fr" ? "Marque" : "Brand"}
                  </span>
                  <span className="font-medium text-indigo-950">
                    {getBrandLabel(
                      DEVICE_BRANDS.find((b) => b.id === selectedBrand) ?? DEVICE_BRANDS[0]
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-yellow-300/30 pt-3">
                  <span className="text-sm font-medium text-slate-500">{t.payment.total}</span>
                  <span className="text-xl font-medium text-indigo-950">
                    {(annual ? selectedPlanObj.price_annual : selectedPlanObj.price_monthly).toLocaleString("fr-FR")} XOF
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      {annual ? t.plans.perYear : t.plans.perMonth}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment methods hint */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {PAYMENT_METHODS.map((m) => (
                <span
                  key={m.id}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {"label" in m
                    ? m.label
                    : lang === "fr"
                      ? (m as { id: string; labelFr: string; labelEn: string; color: string }).labelFr
                      : (m as { id: string; labelFr: string; labelEn: string; color: string }).labelEn}
                </span>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(2)}>
                {t.common.back}
              </Button>
              <Button variant="secondary" size="lg" className="flex-2" onClick={handleContinueToPay}>
                {t.register.next}
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              {lang === "fr"
                ? "Sans engagement · Résiliable à tout moment"
                : "No commitment · Cancel anytime"}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
