"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  TabletIcon,
  TvIcon,
  LaptopIcon,
  PlugIcon,
} from "@/components/ui/icons";
import {
  DEVICE_BRANDS,
  DEVICE_BRAND_PREVIEW,
  DEVICE_MODEL_SUGGESTIONS,
} from "@/lib/data";
import {
  COMPUTER_CATEGORY_OPTIONS,
  DEVICE_TYPE_OPTIONS,
  deviceRequiresImei,
  formatDeviceDisplayName,
  getDeviceMetadataSummary,
  getDeviceTypeLabel,
} from "@/lib/devices";
import {
  usePlans,
  useCreatePayment,
  usePartnerReferral,
  usePaymentCheckout,
  useResumePayment,
} from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { isTotalPlan } from "@/lib/plans";
import {
  appendPartnerReferralParams,
  normalizePartnerReferralSourceMedium,
  readPartnerReferralCookies,
} from "@/lib/partner-referrals";
import type {
  CheckoutResult,
  DeviceMetadata,
  DeviceType,
  PaymentStatus,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

const CREATE_FLOW_STORAGE_KEY = "safephone:payment:create-flow";

type StoredCreateFlow = {
  queryKey: string;
  idempotencyKey: string;
};

function readStoredCreateFlow(): StoredCreateFlow | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(CREATE_FLOW_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredCreateFlow>;
    if (
      typeof parsed.queryKey !== "string" ||
      typeof parsed.idempotencyKey !== "string"
    ) {
      return null;
    }

    return {
      queryKey: parsed.queryKey,
      idempotencyKey: parsed.idempotencyKey,
    };
  } catch {
    return null;
  }
}

function writeStoredCreateFlow(flow: StoredCreateFlow) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CREATE_FLOW_STORAGE_KEY, JSON.stringify(flow));
}

function clearStoredCreateFlow() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CREATE_FLOW_STORAGE_KEY);
}

function isCompletedPaymentStatus(status?: PaymentStatus) {
  return status === "completed" || status === "refunded";
}

function formatTrackedDeviceName(
  checkout: CheckoutResult | undefined,
  fallback: string,
  lang: "fr" | "en",
) {
  if (!checkout?.device) {
    return fallback;
  }
  return formatDeviceDisplayName(checkout.device, lang);
}

function trackedStatusCopy(
  status: PaymentStatus | undefined,
  lang: "fr" | "en",
) {
  switch (status) {
    case "completed":
    case "refunded":
      return {
        title:
          lang === "fr"
            ? "Paiement deja effectue"
            : "Payment already completed",
        subtitle:
          lang === "fr"
            ? "Cette souscription a deja ete finalisee. Retrouvez votre appareil et votre paiement dans votre espace."
            : "This subscription has already been finalized. Find your device and payment in your account.",
      };
    case "failed":
    case "cancelled":
    case "expired":
      return {
        title: lang === "fr" ? "Paiement a relancer" : "Restart your payment",
        subtitle:
          lang === "fr"
            ? "Ce checkout n'est plus payable en l'etat. Relancez un paiement proprement sans recreer votre appareil."
            : "This checkout is no longer payable as-is. Restart payment cleanly without recreating your device.",
      };
    default:
      return {
        title: lang === "fr" ? "Suivi de votre paiement" : "Track your payment",
        subtitle:
          lang === "fr"
            ? "Votre checkout SafePhone est deja en cours. Reprenez-le sans recreer votre souscription."
            : "Your SafePhone checkout is already in progress. Resume it without recreating your subscription.",
      };
  }
}

export default function PaiementPage() {
  return (
    <Suspense>
      <PaiementContent />
    </Suspense>
  );
}

function PaiementContent() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan") ?? "";
  const brandSlug = searchParams.get("brand") ?? "";
  const deviceTypeFromQuery =
    (searchParams.get("device_type") as DeviceType | null) ?? "";
  const annual = searchParams.get("annual") === "true";
  const paymentId = searchParams.get("payment_id") ?? "";
  const shouldRedirectToCheckout = searchParams.get("redirect") === "checkout";
  const isTrackedMode = paymentId !== "";
  const storedReferral = readPartnerReferralCookies();
  const partnerCode =
    searchParams.get("partner")?.trim() || storedReferral.code || "";
  const partnerSourceMedium = normalizePartnerReferralSourceMedium(
    searchParams.get("src") || storedReferral.sourceMedium,
  );

  const { data: plans } = usePlans();
  const { data: partnerReferral } = usePartnerReferral(partnerCode, {
    enabled: !!partnerCode,
  });
  const createPayment = useCreatePayment();
  const resumePayment = useResumePayment();
  const paymentCheckout = usePaymentCheckout(paymentId, {
    enabled: isTrackedMode,
  });

  const selectedPlan = plans?.find((p) => p.id === planId || p.slug === planId);
  const totalPlanSelected = isTotalPlan(selectedPlan);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType>(
    deviceTypeFromQuery || "smartphone",
  );
  const [selectedBrandSlug, setSelectedBrandSlug] = useState(brandSlug);
  const [brandInput, setBrandInput] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [screenSize, setScreenSize] = useState("");
  const [computerCategory, setComputerCategory] = useState("");
  const [productSubtype, setProductSubtype] = useState("");
  const [error, setError] = useState("");

  const autoRedirectedRef = useRef(false);

  const currentCreateQueryKey = useMemo(
    () =>
      JSON.stringify({
        planId,
        annual,
        deviceType: selectedDeviceType,
        brandSlug: selectedBrandSlug,
        brandInput: brandInput.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        screenSize: screenSize.trim(),
        computerCategory: computerCategory.trim(),
        productSubtype: productSubtype.trim(),
      }),
    [
      annual,
      brandInput,
      computerCategory,
      model,
      planId,
      productSubtype,
      screenSize,
      selectedBrandSlug,
      selectedDeviceType,
      serialNumber,
    ],
  );

  useEffect(() => {
    if (isTrackedMode) {
      clearStoredCreateFlow();
    }
  }, [currentCreateQueryKey, isTrackedMode]);

  const brandLabel = DEVICE_BRANDS.find((b) => b.id === selectedBrandSlug);
  const previewBrandLabel = selectedBrandSlug
    ? lang === "fr"
      ? DEVICE_BRAND_PREVIEW[
          selectedBrandSlug as keyof typeof DEVICE_BRAND_PREVIEW
        ]?.labelFr
      : DEVICE_BRAND_PREVIEW[
          selectedBrandSlug as keyof typeof DEVICE_BRAND_PREVIEW
        ]?.labelEn
    : "";
  const trimmedBrandInput = brandInput.trim();
  const trimmedModel = model.trim();
  const trimmedSerialNumber = serialNumber.trim();
  const trimmedScreenSize = screenSize.trim();
  const trimmedComputerCategory = computerCategory.trim();
  const trimmedProductSubtype = productSubtype.trim();
  const effectiveDeviceType = totalPlanSelected
    ? selectedDeviceType
    : "smartphone";
  const effectiveBrand =
    effectiveDeviceType === "smartphone"
      ? brandLabel
        ? lang === "fr"
          ? brandLabel.labelFr
          : brandLabel.labelEn
        : selectedBrandSlug.trim()
      : trimmedBrandInput;
  const deviceMetadata: DeviceMetadata = useMemo(
    () => ({
      ...(trimmedSerialNumber ? { serial_number: trimmedSerialNumber } : {}),
      ...(trimmedScreenSize ? { screen_size: trimmedScreenSize } : {}),
      ...(trimmedComputerCategory
        ? { computer_category: trimmedComputerCategory }
        : {}),
      ...(trimmedProductSubtype
        ? { product_subtype: trimmedProductSubtype }
        : {}),
    }),
    [
      trimmedComputerCategory,
      trimmedProductSubtype,
      trimmedScreenSize,
      trimmedSerialNumber,
    ],
  );

  const modelSuggestions = useMemo(() => {
    if (effectiveDeviceType !== "smartphone" || !selectedBrandSlug) return [];
    const suggestions =
      DEVICE_MODEL_SUGGESTIONS[
        selectedBrandSlug as keyof typeof DEVICE_MODEL_SUGGESTIONS
      ] ?? [];
    if (!trimmedModel) {
      return suggestions.slice(0, 6);
    }

    const query = trimmedModel.toLowerCase();
    return suggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(query))
      .slice(0, 6);
  }, [effectiveDeviceType, selectedBrandSlug, trimmedModel]);

  const fullDeviceName = useMemo(() => {
    if (!effectiveBrand && !trimmedModel && !trimmedProductSubtype) {
      return lang === "fr"
        ? "Votre appareil sera confirme ici"
        : "Your device will be confirmed here";
    }

    if (!trimmedModel && effectiveDeviceType !== "home_electronics") {
      const previewBrand =
        effectiveDeviceType === "smartphone"
          ? previewBrandLabel
          : effectiveBrand;
      return previewBrand
        ? `${previewBrand} ${lang === "fr" ? "— modele a confirmer" : "— model to confirm"}`
        : lang === "fr"
          ? "Modele a confirmer"
          : "Model to confirm";
    }

    return formatDeviceDisplayName(
      {
        device_type: effectiveDeviceType,
        brand: effectiveBrand,
        model: trimmedModel,
        metadata: deviceMetadata,
      },
      lang,
    );
  }, [
    deviceMetadata,
    effectiveBrand,
    effectiveDeviceType,
    lang,
    previewBrandLabel,
    trimmedModel,
    trimmedProductSubtype,
  ]);

  const modelGuidance =
    effectiveDeviceType === "smartphone"
      ? trimmedModel && trimmedModel.length <= 2
        ? lang === "fr"
          ? "Ajoutez idealement le nom complet du modele pour eviter toute ambiguite."
          : "Ideally add the full model name to avoid ambiguity."
        : lang === "fr"
          ? "Commencez a taper et choisissez une suggestion si elle correspond a votre telephone."
          : "Start typing and pick a suggestion if it matches your phone."
      : lang === "fr"
        ? "Renseignez le modele commercial exact de l'appareil."
        : "Enter the exact commercial model of the device.";

  const createPrice = selectedPlan
    ? annual
      ? selectedPlan.price_annual
      : selectedPlan.price_monthly
    : 0;
  const createPlanName = selectedPlan
    ? lang === "fr"
      ? selectedPlan.name_fr
      : selectedPlan.name_en
    : "";

  const trackedPlan = plans?.find(
    (plan) => plan.id === paymentCheckout.data?.payment.plan_id,
  );
  const trackedBillingCycle =
    paymentCheckout.data?.subscription?.billing_cycle ?? "monthly";
  const trackedPrice = trackedPlan
    ? trackedBillingCycle === "annual"
      ? trackedPlan.price_annual
      : trackedPlan.price_monthly
    : (paymentCheckout.data?.payment.amount_xof ?? 0);
  const trackedPlanName = trackedPlan
    ? lang === "fr"
      ? trackedPlan.name_fr
      : trackedPlan.name_en
    : "";
  const trackedDeviceName = formatTrackedDeviceName(
    paymentCheckout.data,
    fullDeviceName,
    lang,
  );
  const trackedDeviceTypeLabel = getDeviceTypeLabel(
    paymentCheckout.data?.device?.device_type,
    lang,
  );
  const trackedDeviceMeta = paymentCheckout.data?.device
    ? getDeviceMetadataSummary(
        paymentCheckout.data.device.metadata,
        paymentCheckout.data.device.device_type,
        lang,
      )
    : "";
  const trackedStatus = paymentCheckout.data?.payment.status;
  const trackedCopy = trackedStatusCopy(trackedStatus, lang);

  const createDeviceTypeLabel = getDeviceTypeLabel(effectiveDeviceType, lang);
  const createDeviceMeta = getDeviceMetadataSummary(
    deviceMetadata,
    effectiveDeviceType,
    lang,
  );

  useEffect(() => {
    if (!isTrackedMode || !paymentId) return;

    const canonicalParams = new URLSearchParams({ payment_id: paymentId });
    appendPartnerReferralParams(
      canonicalParams,
      partnerCode,
      partnerSourceMedium,
    );
    const canonicalPath = `/paiement?${canonicalParams.toString()}`;

    if (
      searchParams.get("redirect") &&
      (isCompletedPaymentStatus(trackedStatus) ||
        trackedStatus === "failed" ||
        trackedStatus === "cancelled" ||
        trackedStatus === "expired" ||
        !paymentCheckout.data?.payment_url)
    ) {
      window.history.replaceState(window.history.state, "", canonicalPath);
    }

    if (
      !shouldRedirectToCheckout ||
      autoRedirectedRef.current ||
      !paymentCheckout.data?.payment_url ||
      trackedStatus !== "pending"
    ) {
      return;
    }

    autoRedirectedRef.current = true;
    window.history.replaceState(window.history.state, "", canonicalPath);
    window.location.assign(paymentCheckout.data.payment_url);
  }, [
    isTrackedMode,
    paymentCheckout.data,
    partnerCode,
    partnerSourceMedium,
    paymentId,
    searchParams,
    shouldRedirectToCheckout,
    trackedStatus,
  ]);

  const handlePay = async () => {
    if (!selectedPlan) return;
    setError("");

    try {
      const stored = readStoredCreateFlow();
      const idempotencyKey =
        stored && stored.queryKey === currentCreateQueryKey
          ? stored.idempotencyKey
          : crypto.randomUUID();

      if (!stored || stored.queryKey !== currentCreateQueryKey) {
        writeStoredCreateFlow({
          queryKey: currentCreateQueryKey,
          idempotencyKey,
        });
      }

      const result = await createPayment.mutateAsync({
        device_type: effectiveDeviceType,
        brand: effectiveBrand,
        model: trimmedModel,
        metadata: deviceMetadata,
        imei: "",
        plan_id: selectedPlan.id,
        billing_cycle: annual ? "annual" : "monthly",
        idempotency_key: idempotencyKey,
      });

      clearStoredCreateFlow();
      if (result.payment?.id) {
        const params = new URLSearchParams({
          payment_id: result.payment.id,
          redirect: "checkout",
        });
        appendPartnerReferralParams(params, partnerCode, partnerSourceMedium);
        router.replace(`/paiement?${params.toString()}`);
      }
    } catch (err) {
      console.error("Payment flow error:", err);
      if (err instanceof ApiError) {
        setError(`[${err.code}] ${err.message}`);
      } else {
        setError(
          lang === "fr"
            ? "Le paiement a echoue. Veuillez reessayer."
            : "Payment failed. Please try again.",
        );
      }
    }
  };

  const handleRestartPayment = async () => {
    if (!paymentId) return;
    setError("");

    try {
      const result = await resumePayment.mutateAsync(paymentId);
      if (result.payment?.id) {
        const params = new URLSearchParams({
          payment_id: result.payment.id,
          redirect: "checkout",
        });
        appendPartnerReferralParams(params, partnerCode, partnerSourceMedium);
        router.replace(`/paiement?${params.toString()}`);
      }
    } catch (err) {
      console.error("Payment resume error:", err);
      if (err instanceof ApiError) {
        setError(`[${err.code}] ${err.message}`);
      } else {
        setError(
          lang === "fr"
            ? "Impossible de relancer ce paiement pour le moment."
            : "Could not restart this payment right now.",
        );
      }
    }
  };

  const renderTrackedState = () => {
    if (paymentCheckout.isLoading) {
      return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ClockIcon size={20} className="mt-0.5 text-indigo-500" />
            <div>
              <h3 className="text-lg font-medium text-indigo-950">
                {lang === "fr"
                  ? "Verification du paiement"
                  : "Checking payment state"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {lang === "fr"
                  ? "Nous recuperons l'etat le plus recent de votre checkout SafePhone."
                  : "We are retrieving the latest state of your SafePhone checkout."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (paymentCheckout.isError || !paymentCheckout.data) {
      return (
        <div className="rounded-[2rem] border border-red-200/80 bg-red-50 p-6 shadow-sm">
          <h3 className="text-lg font-medium text-red-700">
            {lang === "fr"
              ? "Impossible de retrouver ce paiement"
              : "We could not find this payment"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-red-600">
            {lang === "fr"
              ? "Ce lien de paiement n'est plus utilisable. Retrouvez vos paiements depuis votre espace."
              : "This payment link is no longer usable. Find your payments from your account."}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/tableau-de-bord?tab=payments")}
            >
              {lang === "fr" ? "Voir mes paiements" : "View my payments"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/forfaits")}
            >
              {lang === "fr" ? "Voir les forfaits" : "View plans"}
            </Button>
          </div>
        </div>
      );
    }

    if (isCompletedPaymentStatus(trackedStatus)) {
      return (
        <div className="rounded-[2rem] border border-emerald-200/70 bg-emerald-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircleIcon size={22} className="mt-0.5 text-emerald-500" />
            <div>
              <h3 className="text-lg font-medium text-indigo-950">
                {trackedCopy.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {trackedCopy.subtitle}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/tableau-de-bord")}
            >
              {lang === "fr" ? "Aller au tableau de bord" : "Go to dashboard"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/tableau-de-bord?tab=devices")}
            >
              {lang === "fr" ? "Voir mes appareils" : "View my devices"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/tableau-de-bord?tab=payments")}
            >
              {lang === "fr" ? "Voir mes paiements" : "View payment history"}
            </Button>
          </div>
        </div>
      );
    }

    if (trackedStatus === "pending") {
      return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ClockIcon size={20} className="mt-0.5 text-indigo-500" />
            <div>
              <h3 className="text-lg font-medium text-indigo-950">
                {trackedCopy.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {lang === "fr"
                  ? "Ce paiement existe deja. Reprenez exactement le meme checkout sans recreer l'appareil ni la souscription."
                  : "This payment already exists. Resume the exact same checkout without recreating the device or subscription."}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (paymentCheckout.data?.payment_url) {
                  window.location.assign(paymentCheckout.data.payment_url);
                }
              }}
              disabled={!paymentCheckout.data?.payment_url}
            >
              {lang === "fr" ? "Continuer le paiement" : "Continue payment"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/tableau-de-bord?tab=payments")}
            >
              {lang === "fr" ? "Voir mes paiements" : "View my payments"}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon size={20} className="mt-0.5 text-amber-500" />
          <div>
            <h3 className="text-lg font-medium text-indigo-950">
              {trackedCopy.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {trackedCopy.subtitle}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            onClick={handleRestartPayment}
            loading={resumePayment.isPending}
          >
            {lang === "fr" ? "Relancer le paiement" : "Restart payment"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/tableau-de-bord?tab=payments")}
          >
            {lang === "fr" ? "Voir mes paiements" : "View my payments"}
          </Button>
        </div>
      </div>
    );
  };

  const headerTitle = isTrackedMode ? trackedCopy.title : t.payment.title;
  const headerSubtitle = isTrackedMode ? trackedCopy.subtitle : t.payment.sub;
  const summaryDeviceName = isTrackedMode ? trackedDeviceName : fullDeviceName;
  const summaryDeviceType = isTrackedMode
    ? trackedDeviceTypeLabel
    : createDeviceTypeLabel;
  const summaryDeviceMeta = isTrackedMode
    ? trackedDeviceMeta
    : createDeviceMeta;
  const summaryPlanName = isTrackedMode ? trackedPlanName : createPlanName;
  const summaryPrice = isTrackedMode ? trackedPrice : createPrice;
  const canSubmitPayment =
    !!selectedPlan &&
    (effectiveDeviceType === "smartphone"
      ? !!selectedBrandSlug && !!trimmedModel
      : effectiveDeviceType === "computer"
        ? !!trimmedBrandInput && !!trimmedModel && !!trimmedComputerCategory
        : effectiveDeviceType === "home_electronics"
          ? !!trimmedBrandInput && !!trimmedModel && !!trimmedProductSubtype
          : !!trimmedBrandInput && !!trimmedModel);

  return (
    <div className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-xl px-5 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950">
            {headerTitle}
          </h1>
          <p className="mt-2 text-slate-500">{headerSubtitle}</p>
        </div>

        {partnerReferral && (
          <div className="mb-6 rounded-[1.75rem] border border-emerald-200/80 bg-emerald-50 px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">
              {lang === "fr"
                ? `Souscription suivie par ${partnerReferral.partner_store_name}`
                : `Subscription tracked for ${partnerReferral.partner_store_name}`}
            </p>
            <p className="mt-1 text-sm text-emerald-900/80">
              {lang === "fr"
                ? "Votre attribution partenaire reste associée pendant le paiement et l’activation."
                : "Your partner attribution stays attached through payment and activation."}
            </p>
          </div>
        )}

        <div className="mb-6 rounded-[2rem] border border-yellow-300/40 bg-yellow-50 p-5">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-yellow-600">
            {t.payment.summary}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{lang === "fr" ? "Type d'appareil" : "Device type"}</span>
              <span className="max-w-[65%] text-right font-medium text-indigo-950">
                {summaryDeviceType}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{lang === "fr" ? "Appareil" : "Device"}</span>
              <span className="max-w-[65%] text-right font-medium text-indigo-950">
                {summaryDeviceName}
              </span>
            </div>
            {summaryDeviceMeta && (
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{lang === "fr" ? "Détail" : "Detail"}</span>
                <span className="max-w-[65%] text-right font-medium text-indigo-950">
                  {summaryDeviceMeta}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{lang === "fr" ? "Forfait" : "Plan"}</span>
              <span>
                {summaryPlanName ? `SafePhone ${summaryPlanName}` : "SafePhone"}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-yellow-300/30 pt-3">
            <span className="font-medium text-indigo-950">
              {t.payment.total}
            </span>
            <span className="text-2xl font-medium text-indigo-950">
              {summaryPrice.toLocaleString("fr-FR")} XOF
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {isTrackedMode ? (
          renderTrackedState()
        ) : (
          <>
            <div className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-medium text-indigo-950">
                {lang === "fr" ? "Details de l'appareil" : "Device details"}
              </h3>
              {totalPlanSelected && (
                <div className="mb-5">
                  <FormField
                    label={
                      lang === "fr" ? "Categorie d'appareil" : "Device category"
                    }
                    hint={
                      lang === "fr"
                        ? "La Formule Totale couvre votre smartphone principal et les autres appareils declares."
                        : "The Total plan covers your main smartphone and other declared devices."
                    }
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
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
                              "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                              selectedDeviceType === option.id
                                ? "border-indigo-950 bg-indigo-950 text-white"
                                : "border-slate-200 bg-white text-indigo-950 hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            <Icon
                              size={18}
                              className={
                                selectedDeviceType === option.id
                                  ? "text-white"
                                  : "text-slate-400"
                              }
                            />
                            <div>
                              <div className="text-sm font-medium">
                                {lang === "fr"
                                  ? option.labelFr
                                  : option.labelEn}
                              </div>
                              <div
                                className={cn(
                                  "mt-1 text-xs",
                                  selectedDeviceType === option.id
                                    ? "text-white/80"
                                    : "text-slate-500",
                                )}
                              >
                                {lang === "fr"
                                  ? option.descriptionFr
                                  : option.descriptionEn}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </FormField>
                </div>
              )}

              {effectiveDeviceType === "smartphone" ? (
                <>
                  <div className="mb-5">
                    <FormField
                      label={lang === "fr" ? "Marque" : "Brand"}
                      hint={
                        lang === "fr"
                          ? "Selectionnez la famille du telephone pour afficher un nom complet plus clair."
                          : "Select the phone family so we can show a clearer full device name."
                      }
                    >
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {DEVICE_BRANDS.map((brand) => (
                          <button
                            key={brand.id}
                            type="button"
                            onClick={() => setSelectedBrandSlug(brand.id)}
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
                              selectedBrandSlug === brand.id
                                ? "border-indigo-950 bg-indigo-950 text-white"
                                : "border-slate-200 bg-white text-indigo-950 hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            {lang === "fr" ? brand.labelFr : brand.labelEn}
                          </button>
                        ))}
                      </div>
                    </FormField>
                  </div>

                  <div className="mb-5 rounded-[1.5rem] border border-indigo-100 bg-indigo-50/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                      {lang === "fr"
                        ? "Apercu du telephone enregistre"
                        : "Registered device preview"}
                    </p>
                    <p className="mt-2 text-lg font-medium text-indigo-950">
                      {fullDeviceName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lang === "fr"
                        ? "C'est le nom qui sera associe a votre souscription avant ajout de l'IMEI."
                        : "This is the device name that will be attached to your subscription before the IMEI is added."}
                    </p>
                  </div>

                  <FormField
                    label={lang === "fr" ? "Modele" : "Model"}
                    hint={modelGuidance}
                  >
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={
                        lang === "fr"
                          ? "Ex: Galaxy A54, iPhone 13..."
                          : "E.g. Galaxy A54, iPhone 13..."
                      }
                    />
                  </FormField>
                  {selectedBrandSlug && modelSuggestions.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        {lang === "fr" ? "Suggestions" : "Suggestions"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {modelSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setModel(suggestion)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                              trimmedModel === suggestion
                                ? "border-indigo-950 bg-indigo-950 text-white"
                                : "border-slate-200 bg-white text-indigo-950 hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-400">
                    {lang === "fr"
                      ? "L'IMEI sera demande depuis votre tableau de bord apres souscription."
                      : "The IMEI will be requested from your dashboard after subscription."}
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-5 rounded-[1.5rem] border border-indigo-100 bg-indigo-50/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                      {lang === "fr"
                        ? "Apercu de l'appareil declare"
                        : "Registered device preview"}
                    </p>
                    <p className="mt-2 text-lg font-medium text-indigo-950">
                      {fullDeviceName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lang === "fr"
                        ? "La Formule Totale enregistre cet appareil avec sa categorie et ses details utiles."
                        : "The Total plan records this device with its category and useful details."}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label={lang === "fr" ? "Marque" : "Brand"}
                      hint={
                        lang === "fr"
                          ? "Ex: Samsung, LG, Dell, Apple..."
                          : "E.g. Samsung, LG, Dell, Apple..."
                      }
                    >
                      <Input
                        value={brandInput}
                        onChange={(e) => setBrandInput(e.target.value)}
                        placeholder={
                          lang === "fr"
                            ? "Marque de l'appareil"
                            : "Device brand"
                        }
                      />
                    </FormField>

                    <FormField
                      label={lang === "fr" ? "Modele" : "Model"}
                      hint={modelGuidance}
                    >
                      <Input
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder={
                          effectiveDeviceType === "tv"
                            ? lang === "fr"
                              ? "Ex: OLED C3"
                              : "E.g. OLED C3"
                            : lang === "fr"
                              ? "Modele commercial"
                              : "Commercial model"
                        }
                      />
                    </FormField>
                  </div>

                  {effectiveDeviceType === "tablet" && (
                    <div className="mt-4">
                      <FormField
                        label={
                          lang === "fr"
                            ? "Numero de serie (optionnel)"
                            : "Serial number (optional)"
                        }
                        hint={
                          lang === "fr"
                            ? "Ajoutez-le maintenant si vous l'avez deja sous la main."
                            : "Add it now if you already have it available."
                        }
                      >
                        <Input
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          placeholder={
                            lang === "fr"
                              ? "Serie ou identifiant"
                              : "Serial or identifier"
                          }
                        />
                      </FormField>
                    </div>
                  )}

                  {effectiveDeviceType === "tv" && (
                    <div className="mt-4">
                      <FormField
                        label={
                          lang === "fr"
                            ? "Taille d'ecran (optionnel)"
                            : "Screen size (optional)"
                        }
                        hint={lang === "fr" ? 'Ex: 55", 65"' : 'E.g. 55", 65"'}
                      >
                        <Input
                          value={screenSize}
                          onChange={(e) => setScreenSize(e.target.value)}
                          placeholder={lang === "fr" ? 'Ex: 55"' : 'E.g. 55"'}
                        />
                      </FormField>
                    </div>
                  )}

                  {effectiveDeviceType === "computer" && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <FormField
                        label={lang === "fr" ? "Categorie" : "Category"}
                        hint={
                          lang === "fr"
                            ? "Indiquez s'il s'agit d'un portable ou d'un poste fixe."
                            : "Specify whether this is a laptop or desktop."
                        }
                      >
                        <Select
                          value={computerCategory}
                          onChange={(e) =>
                            setComputerCategory(
                              (e.target as HTMLSelectElement).value,
                            )
                          }
                        >
                          <option value="">
                            {lang === "fr"
                              ? "Choisir une categorie"
                              : "Choose a category"}
                          </option>
                          {COMPUTER_CATEGORY_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>
                              {lang === "fr" ? option.labelFr : option.labelEn}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField
                        label={
                          lang === "fr"
                            ? "Numero de serie (optionnel)"
                            : "Serial number (optional)"
                        }
                      >
                        <Input
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          placeholder={lang === "fr" ? "Serie" : "Serial"}
                        />
                      </FormField>
                    </div>
                  )}

                  {effectiveDeviceType === "home_electronics" && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <FormField
                        label={
                          lang === "fr" ? "Type de produit" : "Product type"
                        }
                        hint={
                          lang === "fr"
                            ? "Ex: climatiseur, home cinema, refrigerateur..."
                            : "E.g. air conditioner, home theater, refrigerator..."
                        }
                      >
                        <Input
                          value={productSubtype}
                          onChange={(e) => setProductSubtype(e.target.value)}
                          placeholder={
                            lang === "fr"
                              ? "Type d'electronique domestique"
                              : "Home electronics type"
                          }
                        />
                      </FormField>
                      <FormField
                        label={
                          lang === "fr"
                            ? "Numero de serie (optionnel)"
                            : "Serial number (optional)"
                        }
                      >
                        <Input
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          placeholder={lang === "fr" ? "Serie" : "Serial"}
                        />
                      </FormField>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-slate-400">
                    {deviceRequiresImei(effectiveDeviceType)
                      ? lang === "fr"
                        ? "L'IMEI sera demande depuis votre tableau de bord apres souscription."
                        : "The IMEI will be requested from your dashboard after subscription."
                      : lang === "fr"
                        ? "Aucun IMEI n'est requis pour cette categorie d'appareil."
                        : "No IMEI is required for this device category."}
                  </p>
                </>
              )}
            </div>

            <div className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                {lang === "fr"
                  ? "Vous serez redirige vers notre partenaire de paiement securise pour finaliser votre souscription. Les methodes de paiement disponibles incluent Wave, Orange Money et Free Money."
                  : "You will be redirected to our secure payment partner to finalize your subscription. Available payment methods include Wave, Orange Money, and Free Money."}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <ShieldCheckIcon size={16} className="text-emerald-500" />
              <span>{t.payment.secure}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-6"
              onClick={handlePay}
              loading={createPayment.isPending}
              disabled={!canSubmitPayment}
            >
              {createPayment.isPending
                ? t.payment.processing
                : `${t.payment.pay} — ${createPrice.toLocaleString("fr-FR")} XOF`}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
