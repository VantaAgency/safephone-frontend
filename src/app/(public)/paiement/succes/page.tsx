"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@/components/ui/icons";

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

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircleIcon size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
          {lang === "fr" ? "Paiement en vérification" : "Payment verification in progress"}
        </h2>
        <p className="mt-3 text-slate-500">
          {lang === "fr"
            ? "Votre retour du checkout a bien été reçu, mais la protection n'est activée qu'après confirmation backend du paiement."
            : "Your return from checkout was received, but protection is only activated after backend payment confirmation."}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {lang === "fr"
            ? "Si le paiement est encore en attente, vous pourrez le reprendre depuis votre tableau de bord."
            : "If the payment is still pending, you will be able to resume it from your dashboard."}
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
