"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/ui/icons";
import { DEVICE_BRANDS } from "@/lib/data";
import { usePlans, useCreatePayment } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";

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
  const brandLabel = DEVICE_BRANDS.find((b) => b.id === brandSlug);

  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const price = selectedPlan
    ? annual ? selectedPlan.price_annual : selectedPlan.price_monthly
    : 0;
  const planName = selectedPlan
    ? lang === "fr" ? selectedPlan.name_fr : selectedPlan.name_en
    : "";

  const handlePay = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError("");

    try {
      const result = await createPayment.mutateAsync({
        brand: brandLabel ? (lang === "fr" ? brandLabel.labelFr : brandLabel.labelEn) : brandSlug,
        model: model || "Unknown",
        imei: "",
        plan_id: selectedPlan.id,
        billing_cycle: annual ? "annual" : "monthly",
        payment_method: "wave",
        idempotency_key: crypto.randomUUID(),
      });

      if (result.payment_url) {
        // Production: redirect to DEXPAY hosted payment page
        window.location.href = result.payment_url;
      } else {
        // Dev mode: payment auto-completed
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
            : "Payment failed. Please try again."
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
          <h2 className="text-2xl font-medium tracking-tight text-indigo-950">{t.payment.success}</h2>
          <p className="mt-3 text-slate-500">
            {lang === "fr"
              ? "Votre protection SafePhone est maintenant active. Vous recevrez une confirmation par SMS."
              : "Your SafePhone protection is now active. You will receive an SMS confirmation."}
          </p>
          <Button variant="primary" size="lg" className="mt-8" onClick={() => router.push("/tableau-de-bord")}>
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
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950">{t.payment.title}</h1>
          <p className="mt-2 text-slate-500">{t.payment.sub}</p>
        </div>

        {/* Summary Card */}
        <div className="mb-6 rounded-[2rem] border border-yellow-300/40 bg-yellow-50 p-5">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-yellow-600">{t.payment.summary}</div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{brandLabel ? (lang === "fr" ? brandLabel.labelFr : brandLabel.labelEn) : brandSlug}</span>
            <span>SafePhone {planName}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-yellow-300/30 pt-3">
            <span className="font-medium text-indigo-950">{t.payment.total}</span>
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
          <FormField label={lang === "fr" ? "Modèle" : "Model"}>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={lang === "fr" ? "Ex: Galaxy A54, iPhone 13..." : "E.g. Galaxy A54, iPhone 13..."}
            />
          </FormField>
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
          disabled={!selectedPlan}
        >
          {loading
            ? t.payment.processing
            : `${t.payment.pay} — ${price.toLocaleString("fr-FR")} XOF`}
        </Button>
      </div>
    </div>
  );
}
