"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon } from "@/components/ui/icons";

export default function PaiementEchecPage() {
  return (
    <Suspense>
      <PaiementEchecContent />
    </Suspense>
  );
}

function PaiementEchecContent() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const _subId = searchParams.get("sub_id");

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <ShieldCheckIcon size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
          {lang === "fr" ? "Paiement échoué" : "Payment failed"}
        </h2>
        <p className="mt-3 text-slate-500">
          {lang === "fr"
            ? "Le paiement n'a pas pu être complété. Veuillez réessayer ou choisir un autre moyen de paiement."
            : "The payment could not be completed. Please try again or choose a different payment method."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.back()}
          >
            {lang === "fr" ? "Réessayer" : "Try again"}
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
    </div>
  );
}
