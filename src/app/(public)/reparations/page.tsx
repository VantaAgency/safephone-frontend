"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  WrenchIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  PhoneIcon,
  ScreenIcon,
  BatteryIcon,
  PlugIcon,
  CameraIcon,
  DropletIcon,
  SettingsIcon,
} from "@/components/ui/icons";
import {
  REPAIR_TYPES,
  REPAIR_LOCATIONS,
  DEVICE_BRANDS,
  DEVICE_MODEL_SUGGESTIONS,
} from "@/lib/data";
import {
  useCreateRepairRequest,
  useLookupRepairRequest,
} from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import {
  formatRepairDeviceLabel,
  formatRepairPreferredSlot,
  formatRepairScheduledSlot,
  getRepairBrandLabel,
  getRepairServiceLabel,
  getRepairStatusLabel,
  getRepairTypeLabel,
} from "@/lib/repairs";

const REPAIR_ICONS: Record<string, typeof ScreenIcon> = {
  screen: ScreenIcon,
  battery: BatteryIcon,
  charging: PlugIcon,
  camera: CameraIcon,
  water: DropletIcon,
  software: SettingsIcon,
};

const TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export default function ReparationsPage() {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [repairType, setRepairType] = useState("");
  const [serviceMode, setServiceMode] = useState<"center" | "home" | "">("");
  const [centerId, setCenterId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookedRef, setBookedRef] = useState<string | null>(null);
  const [lookupReference, setLookupReference] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");

  const createRepair = useCreateRepairRequest();
  const lookupRepair = useLookupRepairRequest();

  const modelSuggestions =
    DEVICE_MODEL_SUGGESTIONS[
      deviceBrand as keyof typeof DEVICE_MODEL_SUGGESTIONS
    ] ?? [];

  const selectedLocation = REPAIR_LOCATIONS.find((l) => l.id === centerId);
  const selectedDeviceLabel = getRepairBrandLabel(deviceBrand, lang);
  const selectedRepairLabel = getRepairTypeLabel(repairType, lang);

  const handleBook = async () => {
    try {
      const result = await createRepair.mutateAsync({
        device_brand: deviceBrand,
        device_model: deviceModel.trim(),
        repair_type: repairType,
        service_mode: serviceMode || "center",
        center_id: serviceMode === "center" ? centerId : undefined,
        preferred_date: date,
        preferred_time: time,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
      });
      setBookedRef(result.reference);
      setLookupReference(result.reference);
      setLookupPhone(phone.trim());
      lookupRepair.reset();
    } catch {
      // Error state is handled by the mutation flags below.
    }
  };

  const handleLookup = async () => {
    if (!lookupReference || !lookupPhone) return;
    try {
      await lookupRepair.mutateAsync({
        reference: lookupReference.trim(),
        customer_phone: lookupPhone.trim(),
      });
    } catch {
      // Error state is handled by the mutation flags below.
    }
  };

  const reset = () => {
    setBookedRef(null);
    setStep(1);
    setDeviceBrand("");
    setDeviceModel("");
    setRepairType("");
    setServiceMode("");
    setCenterId("");
    setDate("");
    setTime("");
    setName("");
    setPhone("");
    setLookupReference("");
    setLookupPhone("");
    createRepair.reset();
    lookupRepair.reset();
  };

  const stepLabels = [
    t.mobitech.stepDevice,
    t.mobitech.stepRepair,
    t.mobitech.stepLocation,
    t.mobitech.stepDateTime,
    t.mobitech.stepConfirm,
  ];

  const trackingSection = (
    <section className="mt-10 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          <ClockIcon size={12} className="text-indigo-600" />
          <span>{lang === "fr" ? "Suivi réparation" : "Repair tracking"}</span>
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
          {lang === "fr" ? "Suivre une demande MobiTech" : "Track a MobiTech request"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {lang === "fr"
            ? "Entrez votre référence et votre numéro de téléphone pour voir l'avancement de votre réparation."
            : "Enter your reference and phone number to see your repair progress."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <FormField label={t.mobitech.reference}>
          <Input
            value={lookupReference}
            onChange={(e) => setLookupReference(e.target.value.toUpperCase())}
            placeholder="MBT-ABC123"
          />
        </FormField>
        <FormField label={t.mobitech.phone}>
          <Input
            value={lookupPhone}
            onChange={(e) => setLookupPhone(e.target.value)}
            placeholder="+221 77 000 00 00"
          />
        </FormField>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleLookup}
          loading={lookupRepair.isPending}
          disabled={!lookupReference || !lookupPhone || lookupRepair.isPending}
        >
          {lang === "fr" ? "Voir le suivi" : "View progress"}
        </Button>
      </div>

      {lookupRepair.isError && (
        <div className="mt-5 rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {lang === "fr"
            ? "Aucune demande ne correspond à cette référence et ce numéro."
            : "No request matches that reference and phone number."}
        </div>
      )}

      {lookupRepair.data && (
        <div className="mt-6 rounded-[1.75rem] border border-slate-200/80 bg-slate-50/80 p-5 shadow-inner">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-lg font-medium text-indigo-950">
                {formatRepairDeviceLabel(lookupRepair.data, lang)}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {getRepairTypeLabel(lookupRepair.data.repair_type, lang)}
              </div>
              <div className="mt-1 text-xs font-mono text-slate-400">
                {lookupRepair.data.reference}
              </div>
            </div>
            <StatusBadge
              status={lookupRepair.data.status}
              label={getRepairStatusLabel(lookupRepair.data.status, lang)}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {lang === "fr" ? "Mode / centre" : "Mode / center"}
              </div>
              <div className="mt-1 text-sm font-medium text-indigo-950">
                {getRepairServiceLabel(lookupRepair.data, lang)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {lang === "fr" ? "Créneau demandé" : "Requested slot"}
              </div>
              <div className="mt-1 text-sm font-medium text-indigo-950">
                {formatRepairPreferredSlot(lookupRepair.data)}
              </div>
            </div>
            {formatRepairScheduledSlot(lookupRepair.data) && (
              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {lang === "fr" ? "Rendez-vous planifié" : "Scheduled appointment"}
                </div>
                <div className="mt-1 text-sm font-medium text-indigo-950">
                  {formatRepairScheduledSlot(lookupRepair.data)}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {lang === "fr" ? "Montant réparation" : "Repair amount"}
              </div>
              <div className="mt-1 text-sm font-medium text-indigo-950">
                {lookupRepair.data.repair_amount_xof
                  ? `${lookupRepair.data.repair_amount_xof.toLocaleString("fr-FR")} XOF`
                  : lang === "fr"
                    ? "En attente du devis admin"
                    : "Awaiting admin quote"}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );

  if (bookedRef) {
    return (
      <div className="bg-slate-50 px-5 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              {lang === "fr" ? "Réparation confirmée" : "Repair confirmed"}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircleIcon size={40} className="text-emerald-500" />
            </div>
            <div className="mb-2 flex items-center justify-center gap-2">
              <WrenchIcon size={20} className="text-indigo-600" />
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                MobiTech
              </span>
            </div>
            <h2 className="text-2xl font-medium tracking-tight text-indigo-950 md:text-3xl">
              {t.mobitech.booked}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              {lang === "fr"
                ? "Votre demande a bien été enregistrée. Gardez cette référence pour suivre son évolution."
                : "Your request has been recorded. Keep this reference to track its progress."}
            </p>

            <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-slate-50/80 p-5 text-left shadow-inner">
              {[
                [t.mobitech.reference, bookedRef],
                [
                  t.mobitech.stepDevice,
                  `${selectedDeviceLabel} ${deviceModel}`.trim(),
                ],
                [t.mobitech.stepRepair, selectedRepairLabel],
                [
                  t.mobitech.stepLocation,
                  selectedLocation?.name ||
                    (serviceMode === "home" ? t.mobitech.homeService : centerId),
                ],
                [t.mobitech.stepDateTime, `${date} — ${time}`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-slate-200/80 py-3 text-sm last:border-0"
                >
                  <span className="text-slate-500">{k}</span>
                  <span className="text-right font-medium text-indigo-950">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  onClick={() => router.push("/tableau-de-bord")}
                >
                  {lang === "fr" ? "Mon tableau de bord" : "My dashboard"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleLookup}
                  loading={lookupRepair.isPending}
                >
                  {lang === "fr" ? "Suivre ma demande" : "Track my request"}
                </Button>
              )}
              <Button variant="outline" onClick={reset}>
                {t.mobitech.newRepair}
              </Button>
            </div>
          </div>

          {trackingSection}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            <WrenchIcon size={14} className="text-indigo-600" />
            <span>{lang === "fr" ? "Réseau MobiTech" : "MobiTech network"}</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl lg:text-5xl">
            {t.mobitech.title}
          </h1>
          <p className="mt-4 text-lg text-slate-500">{t.mobitech.sub}</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-10 rounded-[2rem] border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-1 overflow-x-auto">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex min-w-0 flex-1 items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      step > i + 1
                        ? "bg-emerald-500 text-white"
                        : step === i + 1
                          ? "bg-indigo-950 text-white"
                          : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span
                    className={cn(
                      "hidden truncate text-xs font-medium sm:block",
                      step === i + 1 ? "text-indigo-950" : "text-slate-400",
                    )}
                  >
                    {label}
                  </span>
                  {i < 4 && (
                    <div
                      className={cn(
                        "h-px min-w-2 flex-1",
                        step > i + 1 ? "bg-emerald-500" : "bg-slate-200",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
                  {t.mobitech.selectDevice}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Choisissez la marque puis précisez le modèle de l'appareil à réparer."
                    : "Choose the brand, then specify the model of the device to repair."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {DEVICE_BRANDS.map((d) => {
                  const label = lang === "fr" ? d.labelFr : d.labelEn;
                  const selected = deviceBrand === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDeviceBrand(d.id)}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-3 rounded-[1.75rem] border p-6 transition-all",
                        selected
                          ? "border-indigo-950 bg-white shadow-lg"
                          : "border-slate-200/80 bg-slate-50/70 hover:-translate-y-0.5 hover:border-indigo-950 hover:bg-white hover:shadow-lg",
                      )}
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <PhoneIcon size={28} className="text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-indigo-950">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {deviceBrand && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <FormField
                    label={lang === "fr" ? "Modèle de l'appareil" : "Device model"}
                    hint={
                      lang === "fr"
                        ? "Choisissez un modèle suggéré ou saisissez-le manuellement."
                        : "Pick a suggested model or type it manually."
                    }
                  >
                    <Input
                      list="device-model-suggestions"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder={
                        lang === "fr" ? "Ex. Galaxy A35" : "e.g. Galaxy A35"
                      }
                    />
                  </FormField>
                  <datalist id="device-model-suggestions">
                    {modelSuggestions.map((model) => (
                      <option key={model} value={model} />
                    ))}
                  </datalist>

                  <div className="mt-5 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={() => setStep(2)}
                      disabled={!deviceModel.trim()}
                    >
                      {lang === "fr" ? "Continuer" : "Continue"}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
                    {t.mobitech.selectRepair}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedDeviceLabel} {deviceModel}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {REPAIR_TYPES.map((r) => {
                  const Icon = REPAIR_ICONS[r.id] || WrenchIcon;
                  const label = lang === "fr" ? r.labelFr : r.labelEn;
                  const price = lang === "fr" ? r.priceFr : r.priceEn;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRepairType(r.id);
                        setStep(3);
                      }}
                      className="flex w-full cursor-pointer items-center justify-between rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-950 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                          <Icon size={20} className="text-slate-500" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-indigo-950">
                            {label}
                          </div>
                          <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <ClockIcon size={12} /> {r.time}
                            </span>
                            <span>{price}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRightIcon size={18} className="text-slate-400" />
                    </button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => setStep(1)}
              >
                ← {lang === "fr" ? "Retour" : "Back"}
              </Button>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
                  {t.mobitech.selectLocation}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedRepairLabel}
                </p>
              </div>
              <div className="space-y-3">
                {REPAIR_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setServiceMode("center");
                      setCenterId(loc.id);
                      setStep(4);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-950 hover:bg-white hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                        <MapPinIcon size={20} className="text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-indigo-950">
                          {loc.name}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {loc.address}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                          <span>{loc.hours}</span>
                          <span>{loc.distance}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRightIcon size={18} className="text-slate-400" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setServiceMode("home");
                    setCenterId("");
                    setStep(4);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[1.75rem] border-2 border-dashed border-yellow-300/50 bg-yellow-50 p-4 transition-all hover:-translate-y-0.5 hover:border-yellow-400/60"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                      <WrenchIcon size={20} className="text-yellow-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-indigo-950">
                        {t.mobitech.homeService}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.mobitech.homeServiceSub}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-yellow-500">
                        +2 000 XOF
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon size={18} className="text-slate-400" />
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => setStep(2)}
              >
                ← {lang === "fr" ? "Retour" : "Back"}
              </Button>
            </section>
          )}

          {step === 4 && (
            <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
                  {t.mobitech.selectDateTime}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedLocation?.name ||
                    (serviceMode === "home" ? t.mobitech.homeService : centerId)}
                </p>
              </div>
              <div className="space-y-5">
                <FormField label={t.mobitech.date}>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </FormField>

                <FormField label={t.mobitech.time}>
                  <div className="grid grid-cols-5 gap-2">
                    {TIMES.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={cn(
                          "cursor-pointer rounded-full border px-2 py-2.5 text-sm font-medium transition-all",
                          time === slot
                            ? "border-indigo-950 bg-indigo-950 text-white"
                            : "border-slate-200/80 text-slate-500 hover:border-indigo-950",
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="border-t border-slate-100 pt-5">
                  <h3 className="mb-4 text-sm font-medium text-indigo-950">
                    {t.mobitech.yourInfo}
                  </h3>
                  <div className="space-y-4">
                    <FormField label={t.mobitech.name}>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aminata Diallo"
                      />
                    </FormField>
                    <FormField label={t.mobitech.phone}>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+221 77 000 00 00"
                      />
                    </FormField>
                  </div>
                </div>

                {createRepair.isError && (
                  <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {lang === "fr"
                      ? "Une erreur est survenue. Vérifiez les informations puis réessayez."
                      : "An error occurred. Please review the details and try again."}
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleBook}
                  loading={createRepair.isPending}
                  disabled={
                    !date ||
                    !time ||
                    !name.trim() ||
                    !phone.trim() ||
                    !deviceModel.trim() ||
                    createRepair.isPending
                  }
                >
                  {createRepair.isPending
                    ? t.mobitech.booking
                    : t.mobitech.book}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => setStep(3)}
              >
                ← {lang === "fr" ? "Retour" : "Back"}
              </Button>
            </section>
          )}

          {trackingSection}
        </div>
      </div>
    </div>
  );
}
