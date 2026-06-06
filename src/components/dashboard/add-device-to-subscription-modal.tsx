"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/form-field";
import { ModelCombobox } from "@/components/forms/model-combobox";
import { VerificationMediaUpload } from "@/components/forms/verification-media-upload";
import {
  coveredDeviceTypes,
  DEVICE_SUGGESTIONS,
  deviceVerificationSpec,
  getDeviceTypeLabel,
} from "@/lib/devices";
import {
  useSubscriptionDevices,
  useAddDeviceToSubscription,
} from "@/lib/api/hooks";
import type { DeviceType, Plan } from "@/lib/api/types";
import { useLanguage } from "@/lib/language-context";

function maxForType(plan: Plan, t: DeviceType): number {
  switch (t) {
    case "smartphone":
      return plan.max_smartphones;
    case "tablet":
      return plan.max_tablets;
    case "computer":
      return plan.max_computers;
    case "game_console":
      return plan.max_game_consoles;
    case "tv":
      return plan.max_tvs;
    default:
      return 0;
  }
}

/**
 * Adds a device to an existing subscription, free, within the plan's per-type
 * caps. Only device types with a remaining slot are offered; the backend
 * re-checks coverage + caps on submit.
 */
export function AddDeviceToSubscriptionModal({
  subscriptionId,
  plan,
  onClose,
}: {
  subscriptionId: string;
  plan: Plan;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const { data: attached } = useSubscriptionDevices(subscriptionId);
  const addDevice = useAddDeviceToSubscription();

  const usedByType = useMemo(() => {
    const m: Partial<Record<DeviceType, number>> = {};
    (attached ?? []).forEach((d) => {
      m[d.device_type] = (m[d.device_type] ?? 0) + 1;
    });
    return m;
  }, [attached]);

  const availableTypes = useMemo(
    () =>
      coveredDeviceTypes(plan).filter(
        (t) => (usedByType[t] ?? 0) < maxForType(plan, t),
      ),
    [plan, usedByType],
  );

  const [deviceType, setDeviceType] = useState<DeviceType>("smartphone");
  const activeType: DeviceType = availableTypes.includes(deviceType)
    ? deviceType
    : (availableTypes[0] ?? "smartphone");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>(["", ""]);
  const [videoUrl, setVideoUrl] = useState("");

  const isPhone = activeType === "smartphone";
  const verifSpec = deviceVerificationSpec(activeType);
  const requiredPhotos = verifSpec.photos.length;
  const filledPhotos = photoUrls
    .slice(0, requiredPhotos)
    .filter((u) => u.trim() !== "");
  const photosReady = filledPhotos.length === requiredPhotos;
  const modelReady = model.trim() !== "" && (!isPhone || brand.trim() !== "");
  const canSubmit =
    availableTypes.length > 0 &&
    modelReady &&
    photosReady &&
    videoUrl.trim() !== "" &&
    !addDevice.isPending;

  const submit = () => {
    addDevice.mutate(
      {
        id: subscriptionId,
        data: {
          device_type: activeType,
          brand: isPhone ? brand.trim() : "",
          model: model.trim(),
          verification_photos: filledPhotos,
          verification_video: videoUrl.trim(),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-[2rem] bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-indigo-950">
            {lang === "fr" ? "Ajouter un appareil" : "Add a device"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 text-slate-400 hover:text-indigo-950"
          >
            ✕
          </button>
        </div>

        {availableTypes.length === 0 ? (
          <p className="text-sm text-slate-500">
            {lang === "fr"
              ? "Cette formule a déjà atteint son nombre maximal d'appareils."
              : "This plan has already reached its device limit."}
          </p>
        ) : (
          <div className="space-y-5">
            <FormField label={lang === "fr" ? "Type d'appareil" : "Device type"}>
              <div className="grid grid-cols-2 gap-2">
                {availableTypes.map((t) => {
                  const remaining = maxForType(plan, t) - (usedByType[t] ?? 0);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDeviceType(t)}
                      className={
                        "rounded-xl border px-3 py-2 text-left text-sm transition-all " +
                        (activeType === t
                          ? "border-indigo-950 bg-indigo-950/5"
                          : "border-slate-200 hover:border-slate-300")
                      }
                    >
                      <div className="font-medium text-indigo-950">
                        {getDeviceTypeLabel(t, lang)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {remaining} {lang === "fr" ? "restant(s)" : "left"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </FormField>

            {isPhone && (
              <FormField label={lang === "fr" ? "Marque" : "Brand"}>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder={lang === "fr" ? "Ex : Apple, Samsung" : "E.g. Apple, Samsung"}
                />
              </FormField>
            )}

            <FormField
              label={
                isPhone
                  ? lang === "fr"
                    ? "Modèle"
                    : "Model"
                  : lang === "fr"
                    ? "Appareil (marque et modèle)"
                    : "Device (brand and model)"
              }
            >
              <ModelCombobox
                value={model}
                onChange={setModel}
                brandLabel={isPhone ? brand : ""}
                brandReady={isPhone ? brand.trim() !== "" : true}
                staticSuggestions={
                  isPhone ? undefined : (DEVICE_SUGGESTIONS[activeType] ?? [])
                }
                placeholder={
                  isPhone
                    ? lang === "fr"
                      ? "Ex : iPhone 15"
                      : "E.g. iPhone 15"
                    : lang === "fr"
                      ? "Ex : PlayStation 5, MacBook Pro..."
                      : "E.g. PlayStation 5, MacBook Pro..."
                }
              />
            </FormField>

            <div>
              <div className="text-sm font-semibold text-indigo-950">
                {lang === "fr"
                  ? `Photo${requiredPhotos > 1 ? "s" : ""} (${requiredPhotos})`
                  : `Photo${requiredPhotos > 1 ? "s" : ""} (${requiredPhotos})`}
              </div>
              <p className="mb-2 mt-0.5 text-xs text-slate-500">
                {lang === "fr" ? verifSpec.photoHintFr : verifSpec.photoHintEn}
              </p>
              <div className="space-y-2">
                {verifSpec.photos.map((slot, idx) => (
                  <VerificationMediaUpload
                    key={idx}
                    kind="photo"
                    index={idx + 1}
                    label={lang === "fr" ? slot.labelFr : slot.labelEn}
                    value={photoUrls[idx] ?? ""}
                    onChange={(next) => {
                      const arr = [...photoUrls];
                      arr[idx] = next;
                      setPhotoUrls(arr);
                    }}
                  />
                ))}
              </div>

              <div className="mt-3 text-sm font-semibold text-indigo-950">
                {lang === "fr" ? "Vidéo" : "Video"}
              </div>
              <p className="mb-2 mt-0.5 text-xs text-slate-500">
                {lang === "fr" ? verifSpec.videoHintFr : verifSpec.videoHintEn}
              </p>
              <VerificationMediaUpload
                kind="video"
                value={videoUrl}
                onChange={setVideoUrl}
              />
            </div>

            {addDevice.isError && (
              <p className="text-sm text-red-600">
                {(addDevice.error as Error)?.message ??
                  (lang === "fr" ? "Échec de l'ajout." : "Failed to add device.")}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                {lang === "fr" ? "Annuler" : "Cancel"}
              </Button>
              <Button variant="primary" onClick={submit} disabled={!canSubmit}>
                {addDevice.isPending
                  ? lang === "fr"
                    ? "Ajout…"
                    : "Adding…"
                  : lang === "fr"
                    ? "Ajouter l'appareil"
                    : "Add device"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
