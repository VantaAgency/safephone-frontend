"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const _subId = searchParams.get("sub_id");

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircleIcon size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
          {lang === "fr" ? "Paiement réussi !" : "Payment successful!"}
        </h2>
        <p className="mt-3 text-slate-500">
          {lang === "fr"
            ? "Votre protection SafePhone est en cours d'activation. Vous recevrez une confirmation très bientôt."
            : "Your SafePhone protection is being activated. You will receive a confirmation shortly."}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {lang === "fr"
            ? "L'activation peut prendre quelques instants."
            : "Activation may take a few moments."}
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
