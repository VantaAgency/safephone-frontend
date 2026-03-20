"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, ClockIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { usePaymentCheckout } from "@/lib/api/hooks";

export default function PaiementSuccesPage() {
  return (
    <Suspense>
      <PaiementSuccesContent />
    </Suspense>
  );
}

function PaiementSuccesContent() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id") ?? "";

  const [pollingEnabled, setPollingEnabled] = useState(Boolean(paymentId));

  const paymentCheckout = usePaymentCheckout(paymentId, {
    enabled: !!paymentId,
    refetchInterval: pollingEnabled ? 2000 : false,
  });

  const status = paymentCheckout.data?.payment.status;
  const isCompleted = status === "completed" || status === "refunded";

  useEffect(() => {
    if (!paymentId || !pollingEnabled) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPollingEnabled(false);
    }, 15000);

    return () => window.clearTimeout(timeout);
  }, [paymentId, pollingEnabled]);
  if (!paymentId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <ClockIcon size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
            {lang === "fr"
              ? "Verification du paiement"
              : "Payment verification"}
          </h2>
          <p className="mt-3 text-slate-500">
            {lang === "fr"
              ? "Votre retour du checkout a bien ete recu. Retrouvez l'etat de votre paiement dans votre espace."
              : "Your return from checkout was received. Find the latest state of your payment in your account."}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-8"
            onClick={() => router.push("/tableau-de-bord?tab=payments")}
          >
            {lang === "fr" ? "Voir mes paiements" : "View my payments"}
          </Button>
        </div>
      </div>
    );
  }

  let icon = (
    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
      <ClockIcon size={40} className="text-emerald-500" />
    </div>
  );
  let title =
    lang === "fr"
      ? "Paiement en verification"
      : "Payment verification in progress";
  let description =
    lang === "fr"
      ? "Votre retour du checkout a bien ete recu, mais la protection n'est activee qu'apres confirmation backend du paiement."
      : "Your return from checkout was received, but protection is only activated after backend payment confirmation.";
  let helper =
    lang === "fr"
      ? "Si le paiement est encore en attente, vous pourrez le reprendre depuis votre tableau de bord."
      : "If the payment is still pending, you will be able to resume it from your dashboard.";
  let primaryAction = (
    <Button
      variant="primary"
      size="lg"
      className="mt-8"
      onClick={() => router.push("/tableau-de-bord?tab=payments")}
    >
      {lang === "fr" ? "Voir mes paiements" : "View my payments"}
    </Button>
  );
  let secondaryAction = null as ReactNode;

  if (paymentCheckout.isLoading) {
    helper =
      lang === "fr"
        ? "Nous recuperons l'etat le plus recent de votre paiement."
        : "We are retrieving the latest state of your payment.";
  } else if (paymentCheckout.isError || !paymentCheckout.data) {
    icon = (
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <ShieldCheckIcon size={40} className="text-red-500" />
      </div>
    );
    title =
      lang === "fr"
        ? "Paiement introuvable"
        : "Payment not found";
    description =
      lang === "fr"
        ? "Nous n'avons pas pu retrouver ce paiement. Consultez votre historique ou revenez au tableau de bord."
        : "We could not find this payment. Check your history or return to the dashboard.";
    helper = "";
    primaryAction = (
      <Button
        variant="primary"
        size="lg"
        className="mt-8"
        onClick={() => router.push("/tableau-de-bord?tab=payments")}
      >
        {lang === "fr" ? "Voir mes paiements" : "View my payments"}
      </Button>
    );
    secondaryAction = (
      <Button
        variant="outline"
        size="lg"
        className="mt-3"
        onClick={() => router.push("/tableau-de-bord")}
      >
        {lang === "fr" ? "Aller au tableau de bord" : "Go to dashboard"}
      </Button>
    );
  } else if (isCompleted) {
    icon = (
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircleIcon size={40} className="text-emerald-500" />
      </div>
    );
    title =
      lang === "fr" ? "Paiement confirme" : "Payment confirmed";
    description =
      lang === "fr"
        ? "Votre souscription SafePhone a bien ete finalisee. Retrouvez votre appareil et votre paiement dans votre espace."
        : "Your SafePhone subscription has been finalized. Find your device and payment in your account.";
    helper =
      lang === "fr"
        ? "Aucune action supplementaire ne sera rejouee si vous rafraichissez cette page."
        : "No additional activation will be replayed if you refresh this page.";
    primaryAction = (
      <Button
        variant="primary"
        size="lg"
        className="mt-8"
        onClick={() => router.push("/tableau-de-bord")}
      >
        {lang === "fr" ? "Aller au tableau de bord" : "Go to dashboard"}
      </Button>
    );
    secondaryAction = (
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
          {lang === "fr" ? "Voir mes paiements" : "View my payments"}
        </Button>
      </div>
    );
  } else if (
    status === "failed" ||
    status === "cancelled" ||
    status === "expired"
  ) {
    icon = (
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <ShieldCheckIcon size={40} className="text-red-500" />
      </div>
    );
    title =
      lang === "fr"
        ? "Paiement non finalise"
        : "Payment not completed";
    description =
      lang === "fr"
        ? "Ce checkout n'a pas abouti. Vous pouvez reprendre ce paiement proprement depuis la page de paiement suivie."
        : "This checkout did not complete. You can safely resume it from the tracked payment page.";
    helper = "";
    primaryAction = (
      <Button
        variant="primary"
        size="lg"
        className="mt-8"
        onClick={() => router.push(`/paiement?payment_id=${paymentId}`)}
      >
        {lang === "fr" ? "Revenir au paiement" : "Return to payment"}
      </Button>
    );
    secondaryAction = (
      <Button
        variant="outline"
        size="lg"
        className="mt-3"
        onClick={() => router.push("/tableau-de-bord?tab=payments")}
      >
        {lang === "fr" ? "Voir mes paiements" : "View my payments"}
      </Button>
    );
  } else if (!pollingEnabled) {
    helper =
      lang === "fr"
        ? "La confirmation peut prendre quelques instants. Retrouvez ce paiement dans votre espace si le statut n'a pas encore change."
        : "Confirmation can take a few moments. Check this payment from your account if the status has not changed yet.";
    secondaryAction = (
      <Button
        variant="outline"
        size="lg"
        className="mt-3"
        onClick={() => router.push(`/paiement?payment_id=${paymentId}`)}
      >
        {lang === "fr" ? "Voir l'etat du paiement" : "View payment state"}
      </Button>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-md text-center">
        {icon}
        <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
          {title}
        </h2>
        <p className="mt-3 text-slate-500">{description}</p>
        {helper && <p className="mt-2 text-xs text-slate-400">{helper}</p>}
        {primaryAction}
        {secondaryAction}
      </div>
    </div>
  );
}
