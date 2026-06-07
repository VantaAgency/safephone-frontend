"use client";

import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { AuthedImage, AuthedVideo } from "@/components/admin/authed-media";
import {
  useModerationDevices,
  useSuspendDevice,
  useReactivateDevice,
} from "@/lib/api/hooks";
import { useLanguage } from "@/lib/language-context";

// Moderation surface for admins + employees. Devices added within a plan's
// caps activate immediately (auto-approved), so this is where a reviewer
// catches a fraudulent one and suspends it (reversibly).
export function DeviceModerationTab() {
  const { lang } = useLanguage();
  const { data, isLoading, error } = useModerationDevices();
  const suspend = useSuspendDevice();
  const reactivate = useReactivateDevice();
  const busy = suspend.isPending || reactivate.isPending;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {lang === "fr"
          ? "Impossible de charger les appareils."
          : "Could not load devices."}
      </div>
    );
  }

  const devices = data ?? [];
  if (devices.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-400">
        {lang === "fr"
          ? "Aucun appareil couvert à modérer."
          : "No covered devices to moderate."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {devices.map((d) => {
        const suspended = d.status === "suspended";
        return (
          <div
            key={d.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-base font-medium text-indigo-950">
                  {[d.brand, d.model].filter(Boolean).join(" ")}
                </div>
                <div className="mt-0.5 text-sm text-slate-500">
                  {d.device_type} ·{" "}
                  <span className="font-mono text-xs">
                    {d.imei || d.metadata?.serial_number || "—"}
                  </span>
                </div>
              </div>
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium " +
                  (suspended
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700")
                }
              >
                {suspended
                  ? lang === "fr"
                    ? "Suspendu"
                    : "Suspended"
                  : lang === "fr"
                    ? "Couvert"
                    : "Covered"}
              </span>
            </div>

            {/* Photos */}
            {d.verification_photos && d.verification_photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                {d.verification_photos.map((url, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <AuthedImage
                      url={url}
                      alt={`Verification ${idx + 1}`}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Video */}
            {d.verification_video && (
              <div className="mt-3">
                <AuthedVideo
                  url={d.verification_video}
                  label={(lang === "fr" ? "Voir la vidéo" : "Open video") + " →"}
                  className="cursor-pointer text-sm font-medium text-indigo-600 hover:underline disabled:opacity-60"
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              {suspended ? (
                <Button
                  variant="primary"
                  size="sm"
                  loading={reactivate.isPending}
                  disabled={busy}
                  onClick={() => reactivate.mutate(d.id)}
                >
                  {lang === "fr" ? "Réactiver" : "Reactivate"}
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  loading={suspend.isPending}
                  disabled={busy}
                  onClick={() => suspend.mutate(d.id)}
                >
                  {lang === "fr" ? "Suspendre (fraude)" : "Suspend (fraud)"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
