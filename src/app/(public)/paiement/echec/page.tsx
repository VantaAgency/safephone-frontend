"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <ShieldCheckIcon size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
          {lang === "fr" ? "Paiement non finalisé" : "Payment not completed"}
        </h2>
        <p className="mt-3 text-slate-500">
          {lang === "fr"
            ? "Aucune protection n'a été activée. Si le checkout est encore valide, vous pourrez reprendre ce paiement depuis votre tableau de bord."
            : "No protection has been activated. If the checkout is still valid, you can resume it later from your dashboard."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/tableau-de-bord")}
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
    </div>
  );
}
