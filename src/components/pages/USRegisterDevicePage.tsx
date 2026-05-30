"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { useRegisterUSDevice } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/auth-provider";
import { DEVICE_BRANDS } from "@/lib/data";
import { routesFor } from "@/lib/markets/routes";
import { cn } from "@/lib/utils";

export default function USRegisterDevicePage() {
  const router = useRouter();
  const { isAuthenticated, isPending: authPending } = useAuth();
  const routes = routesFor("US");
  const registerDevice = useRegisterUSDevice();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [imei, setImei] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authPending) return;
    if (!isAuthenticated) {
      const redirect = encodeURIComponent("/us/register-device");
      router.replace(`${routes.login}?redirect=${redirect}`);
    }
  }, [authPending, isAuthenticated, router, routes.login]);

  const isImeiValid = imei === "" || /^\d{15}$/.test(imei);
  const canSubmit =
    !!brand.trim() && !!model.trim() && isImeiValid && !registerDevice.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    if (!canSubmit) return;
    const brandLabel =
      DEVICE_BRANDS.find((b) => b.id === brand)?.labelEn ?? brand;
    registerDevice.mutate(
      {
        brand: brandLabel,
        model: model.trim(),
        imei: imei.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.push(routes.dashboard);
        },
        onError: (err) => {
          // Surface the field-level "IMEI is not valid …" message when the
          // backend returns ValidationFailed with a fields map. Otherwise
          // fall through to err.message (e.g. "device with this IMEI
          // already exists") or a generic copy.
          const fieldErr =
            err instanceof ApiError ? err.fields?.imei : undefined;
          setErrorMessage(
            fieldErr ??
              (err instanceof ApiError
                ? err.message
                : "We couldn't save your phone. Please try again."),
          );
        },
      },
    );
  }

  if (authPending || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAF8] px-5">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden bg-[#FAFAF8] py-12 md:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-28 right-0 h-[420px] w-[420px] rounded-full bg-indigo-100/35 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-[320px] w-[320px] rounded-full bg-yellow-100/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-5 md:px-10">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            Final step
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl">
            Register your phone
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-500">
            Tell us which phone is covered by your SafePhone membership. You can
            update these details later from your dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-10"
        >
          <div className="mb-6">
            <label
              htmlFor="brand"
              className="mb-2 block text-sm font-medium text-indigo-950"
            >
              Brand
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {DEVICE_BRANDS.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBrand(b.id)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-medium transition cursor-pointer",
                    brand === b.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  {b.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="model"
              className="mb-2 block text-sm font-medium text-indigo-950"
            >
              Model
            </label>
            <input
              id="model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. iPhone 15 Pro"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="mb-2">
            <label
              htmlFor="imei"
              className="mb-2 block text-sm font-medium text-indigo-950"
            >
              IMEI{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="imei"
              type="text"
              inputMode="numeric"
              value={imei}
              onChange={(e) =>
                setImei(e.target.value.replace(/\D/g, "").slice(0, 15))
              }
              placeholder="15 digits"
              className={cn(
                "w-full rounded-xl border bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:ring-2 focus:ring-indigo-100",
                isImeiValid
                  ? "border-slate-200 focus:border-indigo-500"
                  : "border-red-300 focus:border-red-500",
              )}
            />
            <p className="mt-2 text-xs text-slate-400">
              Find it by dialing <span className="font-medium">*#06#</span> on
              your phone.
            </p>
            {!isImeiValid && (
              <p className="mt-1 text-xs text-red-600">
                IMEI must be exactly 15 digits.
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Link
              href={routes.dashboard}
              className="text-sm font-medium text-slate-500 transition hover:text-indigo-700"
            >
              Skip for now
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!canSubmit}
              className="rounded-xl"
            >
              {registerDevice.isPending ? "Saving…" : "Finish registration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
