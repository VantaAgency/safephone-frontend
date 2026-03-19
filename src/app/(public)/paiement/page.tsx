"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/ui/icons";
import {
  DEVICE_BRANDS,
  DEVICE_BRAND_PREVIEW,
  DEVICE_MODEL_SUGGESTIONS,
} from "@/lib/data";
import { usePlans, useCreatePayment } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

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
  const annual = searchParams.get("annual") === "true";

  const { data: plans } = usePlans();
  const createPayment = useCreatePayment();

  const selectedPlan = plans?.find((p) => p.id === planId || p.slug === planId);
  const [selectedBrandSlug, setSelectedBrandSlug] = useState(brandSlug);
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

  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const trimmedModel = model.trim();

  const modelSuggestions = useMemo(() => {
    if (!selectedBrandSlug) return [];
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
  }, [selectedBrandSlug, trimmedModel]);

  const fullDeviceName = useMemo(() => {
    if (!selectedBrandSlug && !trimmedModel) {
      return lang === "fr"
        ? "Votre téléphone sera confirmé ici"
        : "Your phone will be confirmed here";
    }

    if (!trimmedModel) {
      return previewBrandLabel
        ? `${previewBrandLabel} ${lang === "fr" ? "— modèle à confirmer" : "— model to confirm"}`
        : lang === "fr"
          ? "Modèle à confirmer"
          : "Model to confirm";
    }

    return previewBrandLabel
      ? `${previewBrandLabel} ${trimmedModel}`
      : trimmedModel;
  }, [lang, previewBrandLabel, selectedBrandSlug, trimmedModel]);

  const modelGuidance =
    trimmedModel && trimmedModel.length <= 2
      ? lang === "fr"
        ? "Ajoutez idéalement le nom complet du modèle pour éviter toute ambiguïté."
        : "Ideally add the full model name to avoid ambiguity."
      : lang === "fr"
        ? "Commencez à taper et choisissez une suggestion si elle correspond à votre téléphone."
        : "Start typing and pick a suggestion if it matches your phone.";

  const price = selectedPlan
    ? annual
      ? selectedPlan.price_annual
      : selectedPlan.price_monthly
    : 0;
  const planName = selectedPlan
    ? lang === "fr"
      ? selectedPlan.name_fr
      : selectedPlan.name_en
    : "";

  const handlePay = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError("");

    try {
      const result = await createPayment.mutateAsync({
        brand: brandLabel
          ? lang === "fr"
            ? brandLabel.labelFr
            : brandLabel.labelEn
          : selectedBrandSlug,
        model: model || "Unknown",
        imei: "",
        plan_id: selectedPlan.id,
        billing_cycle: annual ? "annual" : "monthly",
        idempotency_key: crypto.randomUUID(),
      });

      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Payment flow error:", err);
      if (err instanceof ApiError) {
        setError(`[${err.code}] ${err.message}`);
      } else {
        setError(
          lang === "fr"
            ? "Le paiement a échoué. Veuillez réessayer."
            : "Payment failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircleIcon size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
            {t.payment.success}
          </h2>
          <p className="mt-3 text-slate-500">
            {lang === "fr"
              ? "Votre protection SafePhone est maintenant active. Vous recevrez une confirmation par SMS."
              : "Your SafePhone protection is now active. You will receive an SMS confirmation."}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-8"
            onClick={() => router.push("/tableau-de-bord")}
          >
            {lang === "fr" ? "Voir mon espace" : "View my account"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-xl px-5 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950">
            {t.payment.title}
          </h1>
          <p className="mt-2 text-slate-500">{t.payment.sub}</p>
        </div>

        {/* Summary Card */}
        <div className="mb-6 rounded-[2rem] border border-yellow-300/40 bg-yellow-50 p-5">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-yellow-600">
            {t.payment.summary}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{lang === "fr" ? "Appareil" : "Device"}</span>
              <span className="max-w-[65%] text-right font-medium text-indigo-950">
                {fullDeviceName}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{lang === "fr" ? "Forfait" : "Plan"}</span>
              <span>SafePhone {planName}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-yellow-300/30 pt-3">
            <span className="font-medium text-indigo-950">
              {t.payment.total}
            </span>
            <span className="text-2xl font-medium text-indigo-950">
              {price.toLocaleString("fr-FR")} XOF
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Device Details */}
        <div className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-indigo-950">
            {lang === "fr" ? "Détails de l'appareil" : "Device details"}
          </h3>
          <div className="mb-5">
            <FormField
              label={lang === "fr" ? "Marque" : "Brand"}
              hint={
                lang === "fr"
                  ? "Sélectionnez la famille du téléphone pour afficher un nom complet plus clair."
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
                ? "Aperçu du téléphone enregistré"
                : "Registered device preview"}
            </p>
            <p className="mt-2 text-lg font-medium text-indigo-950">
              {fullDeviceName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {lang === "fr"
                ? "C’est le nom qui sera associé à votre souscription avant ajout de l’IMEI."
                : "This is the device name that will be attached to your subscription before the IMEI is added."}
            </p>
          </div>

          <FormField
            label={lang === "fr" ? "Modèle" : "Model"}
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
              ? "L'IMEI sera demandé depuis votre tableau de bord après souscription."
              : "The IMEI will be requested from your dashboard after subscription."}
          </p>
        </div>

        {/* Payment Info */}
        <div className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            {lang === "fr"
              ? "Vous serez redirigé vers notre partenaire de paiement sécurisé pour finaliser votre souscription. Les méthodes de paiement disponibles incluent Wave, Orange Money et Free Money."
              : "You will be redirected to our secure payment partner to finalize your subscription. Available payment methods include Wave, Orange Money, and Free Money."}
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheckIcon size={16} className="text-emerald-500" />
          <span>{t.payment.secure}</span>
        </div>

        {/* Pay Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={handlePay}
          loading={loading}
          disabled={!selectedPlan || !selectedBrandSlug || !trimmedModel}
        >
          {loading
            ? t.payment.processing
            : `${t.payment.pay} — ${price.toLocaleString("fr-FR")} XOF`}
        </Button>
      </div>
    </div>
  );
}
