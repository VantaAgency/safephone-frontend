"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/ui/icons";
import { PAYMENT_METHODS, DEVICE_BRANDS } from "@/lib/data";
import { usePlans, useCreateDevice, useCreateSubscription, useCreatePayment } from "@/lib/api/hooks";
import type { PaymentMethod } from "@/lib/api/types";
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
  const createDevice = useCreateDevice();
  const createSubscription = useCreateSubscription();
  const createPayment = useCreatePayment();

  const selectedPlan = plans?.find((p) => p.id === planId || p.slug === planId);
  const brandLabel = DEVICE_BRANDS.find((b) => b.id === brandSlug);

  const [method, setMethod] = useState("wave");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState("");
  const [imei, setImei] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const price = selectedPlan
    ? annual ? selectedPlan.price_annual : selectedPlan.price_monthly
    : 0;
  const planName = selectedPlan
    ? lang === "fr" ? selectedPlan.name_fr : selectedPlan.name_en
    : "";

  const paymentMethodMap: Record<string, PaymentMethod> = {
    wave: "wave",
    orange: "orange_money",
    free: "free_money",
    stripe: "card",
  };

  const handlePay = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError("");

    try {
      // 1. Create device
      const device = await createDevice.mutateAsync({
        brand: brandLabel ? (lang === "fr" ? brandLabel.labelFr : brandLabel.labelEn) : brandSlug,
        model: model || "Unknown",
        imei: imei || "000000000000000",
      });

      // 2. Create subscription
      const subscription = await createSubscription.mutateAsync({
        device_id: device.id,
        plan_id: selectedPlan.id,
        billing_cycle: annual ? "annual" : "monthly",
      });

      // 3. Create payment
      await createPayment.mutateAsync({
        subscription_id: subscription.id,
        payment_method: paymentMethodMap[method] || "wave",
        idempotency_key: crypto.randomUUID(),
      });

      setSuccess(true);
    } catch (err) {
      setError(
        lang === "fr"
          ? "Le paiement a échoué. Veuillez réessayer."
          : "Payment failed. Please try again."
      );
      console.error("Payment flow error:", err);
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
          <div className="space-y-4">
            <FormField label={lang === "fr" ? "Modèle" : "Model"}>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={lang === "fr" ? "Ex: Galaxy A54, iPhone 13..." : "E.g. Galaxy A54, iPhone 13..."}
              />
            </FormField>
            <FormField
              label="IMEI"
              hint={lang === "fr" ? "Composez *#06# pour le trouver" : "Dial *#06# to find it"}
            >
              <Input
                value={imei}
                onChange={(e) => setImei(e.target.value.replace(/\D/g, "").slice(0, 15))}
                placeholder="357841092648301"
                className="font-mono tracking-wider"
              />
            </FormField>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-indigo-950">{t.payment.method}</h3>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => {
              const label = m.id === "stripe"
                ? (lang === "fr" ? m.labelFr : m.labelEn) || m.label
                : m.label;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                    method === m.id
                      ? "border-indigo-950 bg-indigo-950/5 ring-1 ring-indigo-950/20"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg"
                  )}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${m.color}15` }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  </div>
                  <span className="text-sm font-medium text-indigo-950">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Form */}
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          {method !== "stripe" ? (
            <FormField
              label={t.payment.phone}
              hint={lang === "fr"
                ? `Vous recevrez une notification sur votre application ${method === "wave" ? "Wave" : method === "orange" ? "Orange Money" : "Free Money"}.`
                : `You'll receive a notification in your ${method === "wave" ? "Wave" : method === "orange" ? "Orange Money" : "Free Money"} app.`
              }
            >
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
              />
            </FormField>
          ) : (
            <div className="space-y-4">
              <FormField label={t.payment.card}>
                <Input
                  value={card}
                  onChange={(e) => setCard(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="4242 4242 4242 4242"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t.payment.expiry}>
                  <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                </FormField>
                <FormField label={t.payment.cvv}>
                  <Input value={cvv} onChange={(e) => setCvv(e.target.value.slice(0, 4))} placeholder="123" />
                </FormField>
              </div>
            </div>
          )}
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
