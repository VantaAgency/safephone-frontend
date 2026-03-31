"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  CheckIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TabletIcon,
  TvIcon,
  LaptopIcon,
  PlugIcon,
} from "@/components/ui/icons";
import { DEVICE_BRANDS, PAYMENT_METHODS } from "@/lib/data";
import { DEVICE_TYPE_OPTIONS, getDeviceTypeLabel } from "@/lib/devices";
import { useLanguage } from "@/lib/language-context";
import {
  useClaimPartnerReferral,
  useClaimPartnerInvitation,
  usePartnerReferral,
  usePartnerInvitation,
  usePlans,
  useTrackPartnerReferralVisit,
} from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiError } from "@/lib/api/client";
import { PlanCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { isTotalPlan } from "@/lib/plans";
import {
  appendPartnerReferralParams,
  clearPartnerReferralCookies,
  normalizePartnerReferralSourceMedium,
  readPartnerReferralCookies,
  writePartnerReferralCookies,
} from "@/lib/partner-referrals";
import type {
  DeviceType,
  PartnerInvitation,
  PartnerReferralDetails,
  Plan,
} from "@/lib/api/types";

export default function InscriptionPage() {
  return (
    <Suspense>
      <InscriptionContent />
    </Suspense>
  );
}

function InscriptionContent() {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated, isPending: authPending } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: plans, isLoading: plansLoading } = usePlans();

  const inviteToken = searchParams.get("invite")?.trim() || "";
  const partnerCodeFromQuery = searchParams.get("partner")?.trim() || "";
  const storedReferral = readPartnerReferralCookies();
  const partnerCode = inviteToken
    ? ""
    : partnerCodeFromQuery || storedReferral.code;
  const partnerSourceMedium = normalizePartnerReferralSourceMedium(
    searchParams.get("src") || storedReferral.sourceMedium,
  );
  const planFromQuery = searchParams.get("plan") ?? "";
  const brandFromQuery = searchParams.get("brand") ?? "";
  const deviceTypeFromQuery = (searchParams.get("device_type") ??
    "") as DeviceType;
  const annualFromQuery = searchParams.get("annual") === "true";
  const shouldResumeToPayment = searchParams.get("resume") === "payment";

  const {
    data: invitation,
    isLoading: invitationLoading,
    error: invitationError,
  } = usePartnerInvitation(inviteToken, {
    enabled: !!inviteToken,
  });
  const claimInvitation = useClaimPartnerInvitation();
  const {
    data: partnerReferral,
    isLoading: partnerReferralLoading,
    error: partnerReferralError,
  } = usePartnerReferral(partnerCode, {
    enabled: !!partnerCode && !inviteToken,
  });
  const trackPartnerReferralVisit = useTrackPartnerReferralVisit();
  const claimPartnerReferral = useClaimPartnerReferral();

  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState(planFromQuery);
  const [selectedBrand, setSelectedBrand] = useState(brandFromQuery);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType>(
    deviceTypeFromQuery || "smartphone",
  );
  const [annual, setAnnual] = useState(annualFromQuery);

  const attemptedClaimRef = useRef<string | null>(null);
  const attemptedPartnerClaimRef = useRef<string | null>(null);
  const attemptedPartnerVisitRef = useRef<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (!inviteToken && partnerCode) {
      appendPartnerReferralParams(params, partnerCode, partnerSourceMedium);
    }

    return params.toString();
  }, [inviteToken, partnerCode, partnerSourceMedium, searchParams]);
  const currentPath = useMemo(
    () => (queryString ? `/inscription?${queryString}` : "/inscription"),
    [queryString],
  );
  const authRedirectPath = useMemo(() => {
    if (!inviteToken) {
      return currentPath;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (invitation?.plan_id) {
      params.set("resume", "payment");
    }

    const nextQuery = params.toString();
    return nextQuery ? `/inscription?${nextQuery}` : "/inscription";
  }, [currentPath, inviteToken, invitation?.plan_id, searchParams]);

  const invitationPlanId = invitation?.plan_id ?? "";
  const preferredPlanId = invitationPlanId || planFromQuery;
  const invitationCompleted = invitation?.status === "active";
  const invitationExpired = invitation?.status === "expired";

  const recommendedPlan = useMemo(() => {
    if (!plans || plans.length === 0) return undefined;
    return (
      plans.find(
        (plan) => plan.id === preferredPlanId || plan.slug === preferredPlanId,
      ) ??
      plans.find((plan) => plan.is_popular) ??
      plans[0]
    );
  }, [plans, preferredPlanId]);
  const resolvedSelectedPlanId = selectedPlanId || recommendedPlan?.id || "";
  const selectedPlanObj = plans?.find(
    (plan) =>
      plan.id === resolvedSelectedPlanId ||
      plan.slug === resolvedSelectedPlanId,
  );
  const selectedPlanKey = selectedPlanObj?.id || resolvedSelectedPlanId;
  const claimError =
    claimInvitation.error instanceof ApiError
      ? claimInvitation.error.message
      : claimInvitation.error
        ? lang === "fr"
          ? "Impossible de rattacher cette invitation à votre compte."
          : "We could not attach this invitation to your account."
        : "";
  const claimConflict =
    claimInvitation.error instanceof ApiError &&
    claimInvitation.error.code === "CONFLICT";
  const invitationClaimedForCurrentAccount =
    !!claimInvitation.data || claimInvitation.isSuccess;
  const partnerClaimConflict =
    claimPartnerReferral.error instanceof ApiError &&
    claimPartnerReferral.error.code === "CONFLICT";
  const partnerClaimError =
    claimPartnerReferral.error instanceof ApiError
      ? getPartnerReferralClaimErrorMessage(
          claimPartnerReferral.error,
          lang,
          partnerReferral,
        )
      : claimPartnerReferral.error
        ? lang === "fr"
          ? "Impossible de rattacher ce lien partenaire à votre compte."
          : "We could not attach this partner referral to your account."
        : "";
  const partnerClaimedForCurrentAccount =
    !!claimPartnerReferral.data || claimPartnerReferral.isSuccess;

  useEffect(() => {
    if (!inviteToken || !user?.id || !invitation || authPending) return;
    if (invitationExpired || invitationCompleted) {
      return;
    }

    const claimKey = `${inviteToken}:${user.id}`;
    if (attemptedClaimRef.current === claimKey) return;

    attemptedClaimRef.current = claimKey;
    claimInvitation.mutate(inviteToken);
  }, [
    authPending,
    claimInvitation,
    invitation,
    invitationCompleted,
    invitationExpired,
    inviteToken,
    user?.id,
  ]);

  useEffect(() => {
    if (!partnerCode || inviteToken || storedReferral.visitorToken) return;

    const visitKey = `${partnerCode}:${partnerSourceMedium}`;
    if (attemptedPartnerVisitRef.current === visitKey) return;

    attemptedPartnerVisitRef.current = visitKey;
    trackPartnerReferralVisit.mutate(
      {
        code: partnerCode,
        data: {
          visitor_token: storedReferral.visitorToken || undefined,
          source_medium: partnerSourceMedium,
        },
      },
      {
        onSuccess: (result) => {
          writePartnerReferralCookies({
            code: result.referral?.referral_code ?? partnerCode,
            visitorToken: result.visitor_token,
            sourceMedium: result.source_medium,
          });
        },
      },
    );
  }, [
    inviteToken,
    partnerCode,
    partnerSourceMedium,
    storedReferral.visitorToken,
    trackPartnerReferralVisit,
  ]);

  useEffect(() => {
    if (!partnerCode || !user?.id || !partnerReferral || authPending || inviteToken) {
      return;
    }

    const claimKey = `${partnerCode}:${user.id}`;
    if (attemptedPartnerClaimRef.current === claimKey) return;

    attemptedPartnerClaimRef.current = claimKey;
    claimPartnerReferral.mutate({
      code: partnerCode,
      data: { source_medium: partnerSourceMedium },
    });
  }, [
    authPending,
    claimPartnerReferral,
    inviteToken,
    partnerCode,
    partnerReferral,
    partnerSourceMedium,
    user?.id,
  ]);

  useEffect(() => {
    if (partnerClaimedForCurrentAccount) {
      clearPartnerReferralCookies();
      return;
    }

    if (
      partnerClaimConflict ||
      (partnerReferralError instanceof ApiError &&
        partnerReferralError.code === "NOT_FOUND")
    ) {
      clearPartnerReferralCookies();
    }
  }, [
    partnerClaimConflict,
    partnerClaimedForCurrentAccount,
    partnerReferralError,
  ]);

  useEffect(() => {
    if (
      !inviteToken ||
      !shouldResumeToPayment ||
      !isAuthenticated ||
      !invitationClaimedForCurrentAccount ||
      !invitation?.plan_id
    ) {
      return;
    }

    const params = new URLSearchParams({
      plan: invitation.plan_id,
      annual: annualFromQuery ? "true" : "false",
      invite: inviteToken,
    });
    if (brandFromQuery) {
      params.set("brand", brandFromQuery);
    }

    router.replace(`/paiement?${params.toString()}`);
  }, [
    annualFromQuery,
    brandFromQuery,
    invitation?.plan_id,
    invitationClaimedForCurrentAccount,
    inviteToken,
    isAuthenticated,
    router,
    shouldResumeToPayment,
  ]);

  const shouldShowInvitationGate = !!inviteToken;
  const shouldShowPartnerGate = !inviteToken && !!partnerCode;
  const canProceedToSetup =
    (!shouldShowInvitationGate && !shouldShowPartnerGate) ||
    (shouldShowInvitationGate &&
      !authPending &&
      isAuthenticated &&
      !invitationExpired &&
      !invitationCompleted &&
      !claimConflict &&
      !claimError &&
      invitationClaimedForCurrentAccount) ||
    (shouldShowPartnerGate &&
      !authPending &&
      isAuthenticated &&
      !partnerClaimConflict &&
      !partnerClaimError &&
      partnerClaimedForCurrentAccount);

  const totalPlanSelected = isTotalPlan(selectedPlanObj);
  const stepLabels = [
    t.register.stepPlan,
    totalPlanSelected
      ? lang === "fr"
        ? "Appareil"
        : "Device"
      : lang === "fr"
        ? "Marque"
        : "Brand",
    lang === "fr" ? "Confirmation" : "Confirm",
  ];

  const getPlanName = (plan: Plan) =>
    lang === "fr" ? plan.name_fr : plan.name_en;

  const getBrandLabel = (brand: (typeof DEVICE_BRANDS)[number]) =>
    lang === "fr" ? brand.labelFr : brand.labelEn;

  const handleContinueToPay = () => {
    if (!resolvedSelectedPlanId) return;
    if (!totalPlanSelected && !selectedBrand) return;

    const params = new URLSearchParams({
      plan: resolvedSelectedPlanId,
      annual: annual ? "true" : "false",
      device_type: totalPlanSelected ? selectedDeviceType : "smartphone",
    });
    if (!totalPlanSelected && selectedBrand) {
      params.set("brand", selectedBrand);
    }
    if (inviteToken) {
      params.set("invite", inviteToken);
    }
    if (!inviteToken && partnerCode) {
      appendPartnerReferralParams(params, partnerCode, partnerSourceMedium);
    }

    router.push(`/paiement?${params.toString()}`);
  };

  return (
    <div className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {inviteToken
              ? lang === "fr"
                ? "Invitation partenaire"
                : "Partner invitation"
              : shouldShowPartnerGate
                ? lang === "fr"
                  ? "Lien partenaire"
                  : "Partner referral"
              : t.register.title}
          </div>
          <h1 className="mt-5 text-3xl font-medium tracking-tight text-indigo-950 md:text-5xl">
            {inviteToken
              ? lang === "fr"
                ? "Finalisez votre inscription SafePhone"
                : "Complete your SafePhone onboarding"
              : shouldShowPartnerGate
                ? lang === "fr"
                  ? "Inscrivez-vous avec votre partenaire SafePhone"
                  : "Sign up with your SafePhone partner"
              : t.register.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 md:text-lg">
            {inviteToken
              ? lang === "fr"
                ? "Votre partenaire a déjà préparé votre invitation. Connectez-vous ou créez votre compte, puis poursuivez directement vers votre formule et votre paiement."
                : "Your partner has already prepared your invitation. Sign in or create your account, then continue straight to your plan and payment."
              : shouldShowPartnerGate
                ? lang === "fr"
                  ? "Votre partenaire vous a envoyé son lien SafePhone. L’attribution est conservée automatiquement pendant toute l’inscription et la souscription."
                  : "Your partner shared their SafePhone link with you. Attribution stays attached automatically throughout signup and subscription."
              : lang === "fr"
                ? "Choisissez votre formule, sélectionnez votre marque et poursuivez votre souscription en quelques étapes."
                : "Choose your plan, select your brand, and continue your subscription in just a few steps."}
          </p>
        </div>

        {shouldShowInvitationGate && (
          <InvitationIntro
            lang={lang}
            invitation={invitation}
            invitationLoading={invitationLoading}
            invitationError={
              invitationError instanceof ApiError ? invitationError : null
            }
            authPending={authPending}
            isAuthenticated={isAuthenticated}
            authRedirectPath={authRedirectPath}
            userName={user?.name}
            invitationCompleted={invitationCompleted}
            invitationExpired={invitationExpired}
            claimConflict={claimConflict}
            invitationClaimedForCurrentAccount={
              invitationClaimedForCurrentAccount
            }
            claimPending={claimInvitation.isPending}
            claimError={claimError}
            onGoToDashboard={() => router.push("/tableau-de-bord")}
          />
        )}

        {shouldShowPartnerGate && (
          <PartnerReferralIntro
            lang={lang}
            referral={partnerReferral}
            referralLoading={partnerReferralLoading}
            referralError={
              partnerReferralError instanceof ApiError ? partnerReferralError : null
            }
            authPending={authPending}
            isAuthenticated={isAuthenticated}
            authRedirectPath={authRedirectPath}
            userName={user?.name}
            claimConflict={partnerClaimConflict}
            referralClaimedForCurrentAccount={partnerClaimedForCurrentAccount}
            claimPending={claimPartnerReferral.isPending}
            claimError={partnerClaimError}
          />
        )}

        {canProceedToSetup && (
          <>
            {!inviteToken && partnerReferral && partnerClaimedForCurrentAccount && (
              <div className="mb-6 rounded-[1.75rem] border border-emerald-200/80 bg-emerald-50 px-5 py-4 text-left shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      {lang === "fr"
                        ? `Vous êtes accompagné par ${partnerReferral.partner_store_name}`
                        : `You are signing up with ${partnerReferral.partner_store_name}`}
                    </p>
                    <p className="mt-1 text-sm text-emerald-900/80">
                      {lang === "fr"
                        ? "Votre attribution partenaire est maintenant enregistrée en arrière-plan."
                        : "Your partner attribution is now preserved in the background."}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                    {lang === "fr" ? "Attribution active" : "Attribution active"}
                  </span>
                </div>
              </div>
            )}

            <div className="mb-10 mt-10 flex items-center gap-2">
              {stepLabels.map((label, index) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      step > index + 1
                        ? "bg-emerald-500 text-white"
                        : step === index + 1
                          ? "bg-indigo-950 text-white"
                          : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {step > index + 1 ? <CheckIcon size={14} /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      "hidden text-xs font-medium sm:block",
                      step === index + 1 ? "text-indigo-950" : "text-slate-400",
                    )}
                  >
                    {label}
                  </span>
                  {index < stepLabels.length - 1 && (
                    <div
                      className={cn(
                        "h-px flex-1",
                        step > index + 1 ? "bg-emerald-500" : "bg-slate-200",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-indigo-950">
                      {t.register.plan}
                    </h2>
                    {invitation?.partner_store_name && (
                      <p className="mt-1 text-sm text-slate-500">
                        {lang === "fr"
                          ? `Recommandé par ${invitation.partner_store_name}`
                          : `Recommended by ${invitation.partner_store_name}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        !annual ? "text-indigo-950" : "text-slate-400",
                      )}
                    >
                      {t.plans.monthly}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAnnual(!annual)}
                      className={cn(
                        "relative h-5 w-9 cursor-pointer rounded-full transition-colors",
                        annual ? "bg-indigo-950" : "bg-slate-200",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                          annual ? "translate-x-4" : "translate-x-0.5",
                        )}
                      />
                    </button>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        annual ? "text-indigo-950" : "text-slate-400",
                      )}
                    >
                      {t.plans.annual}
                      <span className="ml-1 text-yellow-500">
                        {t.plans.save}
                      </span>
                    </span>
                  </div>
                </div>

                {plansLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <PlanCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans?.map((plan) => {
                      const isRecommended = invitationPlanId === plan.id;
                      const isSelected = selectedPlanKey === plan.id;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition-all",
                            isSelected
                              ? "border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400/30"
                              : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg",
                          )}
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-indigo-950">
                                SafePhone {getPlanName(plan)}
                              </span>
                              {plan.is_popular && (
                                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-600">
                                  {t.plans.popular}
                                </span>
                              )}
                              {isRecommended && (
                                <span className="rounded-full bg-indigo-950/5 px-2 py-0.5 text-[10px] font-semibold text-indigo-950">
                                  {lang === "fr"
                                    ? "Conseillé pour vous"
                                    : "Recommended for you"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-lg font-medium text-indigo-950">
                              {(annual
                                ? plan.price_annual
                                : plan.price_monthly
                              ).toLocaleString("fr-FR")}
                            </div>
                            <div className="text-xs text-slate-400">
                              XOF{annual ? t.plans.perYear : t.plans.perMonth}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="mt-6"
                  onClick={() => setStep(2)}
                  disabled={!resolvedSelectedPlanId}
                >
                  {lang === "fr" ? "Continuer →" : "Continue →"}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-2 text-lg font-medium text-indigo-950">
                  {totalPlanSelected
                    ? lang === "fr"
                      ? "Quel appareil voulez-vous declarer ?"
                      : "Which device do you want to declare?"
                    : lang === "fr"
                      ? "Quel est votre téléphone ?"
                      : "What's your phone?"}
                </h2>
                <p className="mb-6 text-sm text-slate-500">
                  {totalPlanSelected
                    ? lang === "fr"
                      ? "La Formule Totale accepte smartphone, tablette, TV, ordinateur et electronique domestique declaree. Les details adaptes seront demandes a l'etape suivante."
                      : "The Total plan accepts smartphones, tablets, TVs, computers, and declared home electronics. The adapted details will be requested on the next step."
                    : lang === "fr"
                      ? "Sélectionnez votre marque. Le modèle et l'IMEI seront demandés après souscription."
                      : "Select your brand. Model and IMEI will be requested after subscription."}
                </p>

                {totalPlanSelected ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {DEVICE_TYPE_OPTIONS.map((option) => {
                      const Icon =
                        option.id === "smartphone"
                          ? PhoneIcon
                          : option.id === "tablet"
                            ? TabletIcon
                            : option.id === "tv"
                              ? TvIcon
                              : option.id === "computer"
                                ? LaptopIcon
                                : PlugIcon;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedDeviceType(option.id)}
                          className={cn(
                            "flex items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                            selectedDeviceType === option.id
                              ? "border-indigo-950 bg-indigo-950/5 ring-1 ring-indigo-950/20"
                              : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                              selectedDeviceType === option.id
                                ? "bg-indigo-950/10 text-indigo-950"
                                : "bg-slate-50 text-slate-400",
                            )}
                          >
                            <Icon size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-indigo-950">
                              {lang === "fr" ? option.labelFr : option.labelEn}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              {lang === "fr"
                                ? option.descriptionFr
                                : option.descriptionEn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {DEVICE_BRANDS.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => setSelectedBrand(brand.id)}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all",
                          selectedBrand === brand.id
                            ? "border-indigo-950 bg-indigo-950/5 ring-1 ring-indigo-950/20"
                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg",
                        )}
                      >
                        <div
                          className={cn(
                            "mb-2 flex h-10 w-10 items-center justify-center rounded-xl",
                            selectedBrand === brand.id
                              ? "bg-indigo-950/10"
                              : "bg-slate-50",
                          )}
                        >
                          <PhoneIcon
                            size={20}
                            className={
                              selectedBrand === brand.id
                                ? "text-indigo-950"
                                : "text-slate-400"
                            }
                          />
                        </div>
                        <span className="text-sm font-medium text-indigo-950">
                          {getBrandLabel(brand)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    {t.common.back}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep(3)}
                    disabled={
                      totalPlanSelected ? !selectedDeviceType : !selectedBrand
                    }
                  >
                    {lang === "fr" ? "Continuer →" : "Continue →"}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && selectedPlanObj && (
              <div>
                <div className="rounded-[2rem] border border-yellow-300/40 bg-yellow-50 p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-600">
                    <CheckCircleIcon size={14} />
                    {lang === "fr" ? "Récapitulatif" : "Summary"}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        {lang === "fr" ? "Formule" : "Plan"}
                      </span>
                      <span className="text-right font-medium text-indigo-950">
                        SafePhone {getPlanName(selectedPlanObj)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        {lang === "fr" ? "Type d'appareil" : "Device type"}
                      </span>
                      <span className="text-right font-medium text-indigo-950">
                        {getDeviceTypeLabel(
                          totalPlanSelected ? selectedDeviceType : "smartphone",
                          lang,
                        )}
                      </span>
                    </div>
                    {!totalPlanSelected && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          {lang === "fr" ? "Marque" : "Brand"}
                        </span>
                        <span className="text-right font-medium text-indigo-950">
                          {getBrandLabel(
                            DEVICE_BRANDS.find(
                              (brand) => brand.id === selectedBrand,
                            ) ?? DEVICE_BRANDS[0],
                          )}
                        </span>
                      </div>
                    )}
                    {invitation?.partner_store_name && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          {lang === "fr" ? "Partenaire" : "Partner"}
                        </span>
                        <span className="text-right font-medium text-indigo-950">
                          {invitation.partner_store_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-yellow-300/30 pt-3">
                      <span className="text-sm font-medium text-slate-500">
                        {t.payment.total}
                      </span>
                      <span className="text-xl font-medium text-indigo-950">
                        {(annual
                          ? selectedPlanObj.price_annual
                          : selectedPlanObj.price_monthly
                        ).toLocaleString("fr-FR")}{" "}
                        XOF
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          {annual ? t.plans.perYear : t.plans.perMonth}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <span
                      key={method.id}
                      className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: method.color }}
                    >
                      {"label" in method
                        ? method.label
                        : lang === "fr"
                          ? (method as { labelFr: string }).labelFr
                          : (method as { labelEn: string }).labelEn}
                    </span>
                  ))}
                </div>

                <div className="mt-6 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon
                      size={18}
                      className="mt-0.5 text-emerald-500"
                    />
                    <div>
                      <p className="font-medium text-indigo-950">
                        {lang === "fr"
                          ? "Votre invitation reste bien liée à votre partenaire"
                          : "Your invitation remains linked to your partner"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {lang === "fr"
                          ? "En poursuivant, vous serez redirigé vers le paiement sécurisé, puis votre activation continuera depuis le backend après confirmation."
                          : "When you continue, you will be redirected to secure checkout and activation will continue from the backend after confirmation."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    {t.common.back}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={handleContinueToPay}
                    disabled={
                      !resolvedSelectedPlanId ||
                      (!totalPlanSelected && !selectedBrand)
                    }
                  >
                    {lang === "fr"
                      ? "Continuer vers le paiement"
                      : "Continue to payment"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PartnerReferralIntro({
  lang,
  referral,
  referralLoading,
  referralError,
  authPending,
  isAuthenticated,
  authRedirectPath,
  userName,
  claimConflict,
  referralClaimedForCurrentAccount,
  claimPending,
  claimError,
}: {
  lang: "fr" | "en";
  referral?: PartnerReferralDetails;
  referralLoading: boolean;
  referralError: ApiError | null;
  authPending: boolean;
  isAuthenticated: boolean;
  authRedirectPath: string;
  userName?: string;
  claimConflict: boolean;
  referralClaimedForCurrentAccount: boolean;
  claimPending: boolean;
  claimError: string;
}) {
  if (referralLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (referralError || !referral) {
    return (
      <StateCard
        title={lang === "fr" ? "Lien partenaire introuvable" : "Partner link not found"}
        description={
          lang === "fr"
            ? "Ce lien partenaire n'est plus valide. Demandez un nouveau lien ou un nouveau QR code à votre point de vente."
            : "This partner link is no longer valid. Ask the store for a new link or QR code."
        }
        actionLabel={lang === "fr" ? "Retour à l’accueil" : "Back to home"}
        onAction={() => (window.location.href = "/")}
        tone="warning"
      />
    );
  }

  if (claimConflict) {
    return (
      <StateCard
        title={
          lang === "fr"
            ? "Attribution partenaire déjà verrouillée"
            : "Partner attribution already locked"
        }
        description={
          lang === "fr"
            ? "Ce compte est déjà rattaché à un autre partenaire ou la première souscription a déjà été validée."
            : "This account is already attached to another partner or the first subscription has already been confirmed."
        }
        meta={`${referral.partner_store_name} · ${referral.referral_code}`}
        tone="warning"
      />
    );
  }

  if (!authPending && !isAuthenticated) {
    return (
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Votre partenaire" : "Your partner"}
            </p>
            <h2 className="mt-3 text-2xl font-medium text-indigo-950">
              {lang === "fr"
                ? `${referral.partner_store_name} vous accompagne jusqu’à l’activation`
                : `${referral.partner_store_name} is guiding you through activation`}
            </h2>
            <p className="mt-3 text-slate-500">
              {lang === "fr"
                ? "Connectez-vous ou créez votre compte pour conserver automatiquement ce rattachement partenaire, puis poursuivez normalement votre souscription."
                : "Sign in or create your account to preserve this partner attribution automatically, then continue your subscription normally."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() =>
                  (window.location.href = `/connexion?redirect=${encodeURIComponent(authRedirectPath)}`)
                }
              >
                {lang === "fr" ? "Se connecter" : "Sign in"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() =>
                  (window.location.href = `/inscription-compte?redirect=${encodeURIComponent(authRedirectPath)}`)
                }
              >
                {lang === "fr" ? "Créer mon compte" : "Create my account"}
              </Button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Contexte partenaire" : "Partner context"}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">
                  {lang === "fr" ? "Boutique" : "Store"}
                </dt>
                <dd className="text-right font-medium text-indigo-950">
                  {referral.partner_store_name}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">
                  {lang === "fr" ? "Ville" : "City"}
                </dt>
                <dd className="text-right font-medium text-indigo-950">
                  {referral.partner_city}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">
                  {lang === "fr" ? "Code partenaire" : "Partner code"}
                </dt>
                <dd className="text-right font-medium text-indigo-950">
                  {referral.referral_code}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  if (claimPending) {
    return (
      <StateCard
        title={
          lang === "fr"
            ? "Rattachement du partenaire en cours..."
            : "Linking your partner attribution..."
        }
        description={
          lang === "fr"
            ? "Nous attachons votre compte à ce partenaire afin que l’inscription, le paiement et le suivi restent correctement attribués."
            : "We are attaching your account to this partner so signup, payment, and tracking stay correctly attributed."
        }
        meta={
          userName
            ? `${userName} · ${referral.partner_store_name}`
            : referral.partner_store_name
        }
        tone="neutral"
      />
    );
  }

  if (claimError) {
    return (
      <StateCard
        title={
          lang === "fr"
            ? "Lien partenaire en attente de correction"
            : "Partner link needs attention"
        }
        description={claimError}
        meta={`${referral.partner_store_name} · ${referral.referral_code}`}
        tone="warning"
      />
    );
  }

  if (referralClaimedForCurrentAccount) {
    return (
      <div className="rounded-[2rem] border border-emerald-200/70 bg-emerald-50 p-5 text-left shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              {lang === "fr"
                ? "Lien partenaire bien relié à votre compte"
                : "Partner link successfully connected to your account"}
            </p>
            <p className="mt-1 text-sm text-emerald-900/80">
              {lang === "fr"
                ? `Vous pouvez maintenant choisir votre formule et poursuivre le paiement avec ${referral.partner_store_name}.`
                : `You can now choose your plan and continue payment with ${referral.partner_store_name}.`}
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
            {lang === "fr" ? "Compte prêt" : "Account ready"}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

function InvitationIntro({
  lang,
  invitation,
  invitationLoading,
  invitationError,
  authPending,
  isAuthenticated,
  authRedirectPath,
  userName,
  invitationCompleted,
  invitationExpired,
  claimConflict,
  invitationClaimedForCurrentAccount,
  claimPending,
  claimError,
  onGoToDashboard,
}: {
  lang: "fr" | "en";
  invitation?: PartnerInvitation;
  invitationLoading: boolean;
  invitationError: ApiError | null;
  authPending: boolean;
  isAuthenticated: boolean;
  authRedirectPath: string;
  userName?: string;
  invitationCompleted: boolean;
  invitationExpired: boolean;
  claimConflict: boolean;
  invitationClaimedForCurrentAccount: boolean;
  claimPending: boolean;
  claimError: string;
  onGoToDashboard: () => void;
}) {
  if (invitationLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <StateCard
        title={
          lang === "fr" ? "Invitation introuvable" : "Invitation not found"
        }
        description={
          lang === "fr"
            ? "Ce lien n’est plus valide. Demandez à votre partenaire de vous renvoyer une nouvelle invitation."
            : "This link is no longer valid. Ask your partner to send you a new invitation."
        }
        actionLabel={lang === "fr" ? "Retour à l’accueil" : "Back to home"}
        onAction={() => (window.location.href = "/")}
        tone="warning"
      />
    );
  }

  if (invitationCompleted) {
    return (
      <StateCard
        title={
          lang === "fr"
            ? "Invitation déjà finalisée"
            : "Invitation already completed"
        }
        description={
          lang === "fr"
            ? "Cette invitation a déjà abouti à une activation SafePhone. Vous pouvez retrouver la suite depuis votre espace."
            : "This invitation already led to an active SafePhone account. You can continue from your dashboard."
        }
        meta={`${invitation.partner_store_name} · ${invitation.client_name}`}
        actionLabel={lang === "fr" ? "Ouvrir mon espace" : "Open my dashboard"}
        onAction={onGoToDashboard}
        tone="success"
      />
    );
  }

  if (invitationExpired) {
    return (
      <StateCard
        title={lang === "fr" ? "Invitation expirée" : "Invitation expired"}
        description={
          lang === "fr"
            ? "Ce lien d’invitation a expiré. Votre partenaire peut le renouveler depuis son tableau de bord."
            : "This invitation link has expired. Your partner can renew it from their dashboard."
        }
        meta={`${invitation.partner_store_name} · ${invitation.client_name}`}
        tone="warning"
      />
    );
  }

  if (claimConflict) {
    return (
      <StateCard
        title={
          lang === "fr"
            ? "Invitation déjà rattachée"
            : "Invitation already linked"
        }
        description={
          lang === "fr"
            ? "Cette invitation est déjà associée à un autre compte. Utilisez le bon compte ou demandez un nouveau lien."
            : "This invitation is already connected to another account. Use the correct account or request a new link."
        }
        meta={`${invitation.partner_store_name} · ${invitation.client_name}`}
        tone="warning"
      />
    );
  }

  if (!authPending && !isAuthenticated) {
    return (
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Votre invitation" : "Your invitation"}
            </p>
            <h2 className="mt-3 text-2xl font-medium text-indigo-950">
              {lang === "fr"
                ? `${invitation.partner_store_name} vous accompagne jusqu’au paiement`
                : `${invitation.partner_store_name} is guiding you through checkout`}
            </h2>
            <p className="mt-3 text-slate-500">
              {lang === "fr"
                ? "Connectez-vous ou créez votre compte pour conserver automatiquement le lien avec votre partenaire, puis poursuivez directement votre souscription."
                : "Sign in or create your account to preserve the partner connection automatically, then continue straight to your subscription."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() =>
                  (window.location.href = `/connexion?redirect=${encodeURIComponent(authRedirectPath)}`)
                }
              >
                {lang === "fr" ? "Se connecter" : "Sign in"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() =>
                  (window.location.href = `/inscription-compte?redirect=${encodeURIComponent(authRedirectPath)}`)
                }
              >
                {lang === "fr" ? "Créer mon compte" : "Create my account"}
              </Button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Pré-rempli" : "Pre-filled"}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">
                  {lang === "fr" ? "Client" : "Client"}
                </dt>
                <dd className="text-right font-medium text-indigo-950">
                  {invitation.client_name}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">
                  {lang === "fr" ? "Partenaire" : "Partner"}
                </dt>
                <dd className="text-right font-medium text-indigo-950">
                  {invitation.partner_store_name}
                </dd>
              </div>
              {invitation.plan_name_fr && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">
                    {lang === "fr" ? "Formule conseillée" : "Recommended plan"}
                  </dt>
                  <dd className="text-right font-medium text-indigo-950">
                    SafePhone{" "}
                    {lang === "fr"
                      ? invitation.plan_name_fr
                      : invitation.plan_name_en}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    );
  }

  if (claimPending) {
    return (
      <StateCard
        title={
          lang === "fr"
            ? "Connexion de l’invitation..."
            : "Connecting your invitation..."
        }
        description={
          lang === "fr"
            ? "Nous rattachons votre compte à cette invitation pour que vous puissiez continuer directement vers le paiement."
            : "We are linking your account to this invitation so you can continue directly to payment."
        }
        meta={
          userName
            ? `${userName} · ${invitation.partner_store_name}`
            : invitation.partner_store_name
        }
        tone="neutral"
      />
    );
  }

  if (claimError) {
    return (
      <StateCard
        title={
          lang === "fr"
            ? "Invitation en attente de correction"
            : "Invitation needs attention"
        }
        description={claimError}
        meta={`${invitation.partner_store_name} · ${invitation.client_name}`}
        tone="warning"
      />
    );
  }

  if (invitationClaimedForCurrentAccount) {
    return (
      <div className="rounded-[2rem] border border-emerald-200/70 bg-emerald-50 p-5 text-left shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              {lang === "fr"
                ? "Invitation bien reliée à votre compte"
                : "Invitation successfully linked to your account"}
            </p>
            <p className="mt-1 text-sm text-emerald-900/80">
              {lang === "fr"
                ? `Vous pouvez maintenant choisir votre formule et poursuivre le paiement avec ${invitation.partner_store_name}.`
                : `You can now choose your plan and continue payment with ${invitation.partner_store_name}.`}
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
            {lang === "fr" ? "Compte prêt" : "Account ready"}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

function getPartnerReferralClaimErrorMessage(
  error: ApiError,
  lang: "fr" | "en",
  referral?: PartnerReferralDetails,
) {
  if (error.code === "CONFLICT") {
    return lang === "fr"
      ? "Ce compte ne peut plus être rattaché à ce partenaire. Vérifiez que vous utilisez le bon compte et que le premier paiement n’a pas déjà été validé."
      : "This account can no longer be attached to this partner. Make sure you are using the correct account and that the first payment has not already been completed.";
  }

  if (error.code === "NOT_FOUND") {
    return lang === "fr"
      ? "Ce lien partenaire n’est plus actif."
      : "This partner link is no longer active.";
  }

  return referral
    ? lang === "fr"
      ? `Impossible de rattacher votre compte à ${referral.partner_store_name} pour le moment.`
      : `We could not attach your account to ${referral.partner_store_name} right now.`
    : error.message;
}

function StateCard({
  title,
  description,
  meta,
  actionLabel,
  onAction,
  tone,
}: {
  title: string;
  description: string;
  meta?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone: "success" | "warning" | "neutral";
}) {
  const toneStyles = {
    success: "border-emerald-200/70 bg-emerald-50 text-emerald-950",
    warning: "border-yellow-200/80 bg-yellow-50 text-indigo-950",
    neutral: "border-slate-200/80 bg-white text-indigo-950",
  } as const;

  return (
    <div
      className={cn(
        "rounded-[2rem] border p-6 shadow-sm md:p-8",
        toneStyles[tone],
      )}
    >
      <h2 className="text-2xl font-medium">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm text-slate-500 md:text-base">
        {description}
      </p>
      {meta && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {meta}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="lg"
          className="mt-6"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
