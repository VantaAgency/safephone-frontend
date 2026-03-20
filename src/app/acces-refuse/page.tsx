"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/language-context";

export default function UnauthorizedPage() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const required = searchParams.get("required");

  const areaLabel =
    required === "admin"
      ? lang === "fr"
        ? "à l'administration"
        : "to the admin area"
      : required === "partner"
        ? lang === "fr"
          ? "à l'espace partenaire"
          : "to the partner dashboard"
        : lang === "fr"
          ? "à cette page"
          : "to this page";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-14">
      <div className="w-full rounded-[2rem] border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <ShieldCheckIcon size={28} className="text-slate-500" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-indigo-950">
          {lang === "fr" ? "Accès refusé" : "Access denied"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          {lang === "fr"
            ? `Votre session ne donne pas accès ${areaLabel}.`
            : `Your session does not grant access ${areaLabel}.`}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/tableau-de-bord">
            <Button variant="primary">
              {lang === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              {lang === "fr" ? "Revenir à l'accueil" : "Return home"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
