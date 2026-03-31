"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/language-context";

export const CLAIM_DASHBOARD_HREF = "/tableau-de-bord?tab=claims&view=new";

export function ClaimAccessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!open) return null;

  const openAuthFlow = (view: "sign-in" | "sign-up") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("auth", view);
    params.set("redirect", CLAIM_DASHBOARD_HREF);
    onClose();
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t.common.close}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)] md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
          aria-label={t.common.close}
        >
          <XIcon size={16} />
        </button>

        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
            SafePhone
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-indigo-950">
            {t.hero.claimGateTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">
            {t.hero.claimGateDesc}
          </p>

          <div className="mt-6 space-y-3">
            {[t.hero.claimGateNeed1, t.hero.claimGateNeed2].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <p className="text-sm font-medium text-indigo-950">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="sm:flex-1"
              onClick={() => openAuthFlow("sign-in")}
            >
              {t.hero.claimGateSignin}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="sm:flex-1"
              onClick={() => openAuthFlow("sign-up")}
            >
              {t.hero.claimGateSignup}
            </Button>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="justify-start px-0 text-sm font-medium text-indigo-700 hover:bg-transparent hover:text-indigo-900 sm:px-3"
              onClick={() => {
                onClose();
                router.push("/forfaits");
              }}
            >
              {t.hero.claimGatePlans}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="justify-start px-0 text-sm text-slate-500 hover:bg-transparent hover:text-slate-700 sm:px-3"
              onClick={onClose}
            >
              {t.hero.claimGateLater}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
