"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { WrenchIcon, MapPinIcon, ClockIcon, CheckCircleIcon, ChevronRightIcon, PhoneIcon, ScreenIcon, BatteryIcon, PlugIcon, CameraIcon, DropletIcon, SettingsIcon } from "@/components/ui/icons";
import { REPAIR_TYPES, REPAIR_LOCATIONS, DEVICE_BRANDS } from "@/lib/data";
import { useCreateRepairBooking } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";

const REPAIR_ICONS: Record<string, typeof ScreenIcon> = {
  screen: ScreenIcon,
  battery: BatteryIcon,
  charging: PlugIcon,
  camera: CameraIcon,
  water: DropletIcon,
  software: SettingsIcon,
};

const TIMES = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function ReparationsPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [deviceType, setDeviceType] = useState("");
  const [repairType, setRepairType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookedRef, setBookedRef] = useState<string | null>(null);
  const createBooking = useCreateRepairBooking();

  const handleBook = async () => {
    try {
      const result = await createBooking.mutateAsync({
        device_type: deviceType,
        repair_type: repairType,
        location_id: location,
        booking_date: date,
        booking_time: time,
        customer_name: name,
        customer_phone: phone,
      });
      setBookedRef(result.reference);
    } catch {
      // Error shown via createBooking.isError
    }
  };

  const reset = () => {
    setBookedRef(null); setStep(1); setDeviceType(""); setRepairType("");
    setLocation(""); setDate(""); setTime(""); setName(""); setPhone("");
    createBooking.reset();
  };

  const stepLabels = [t.mobitech.stepDevice, t.mobitech.stepRepair, t.mobitech.stepLocation, t.mobitech.stepDateTime, t.mobitech.stepConfirm];

  // Booking confirmed state
  if (bookedRef) {
    const loc = REPAIR_LOCATIONS.find(l => l.id === location);
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircleIcon size={40} className="text-emerald-500" />
          </div>
          <div className="mb-2 flex items-center justify-center gap-1">
            <span className="text-xl font-medium text-indigo-950">Mobi</span>
            <span className="text-xl font-medium text-indigo-600">Tech</span>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-indigo-950">{t.mobitech.booked}</h2>
          <p className="mt-2 text-slate-500">{t.mobitech.bookedSub}</p>

          <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white p-5 text-left shadow-sm">
            {[
              [t.mobitech.reference, bookedRef],
              [t.mobitech.stepDevice, DEVICE_BRANDS.find(d => d.id === deviceType)?.[lang === "fr" ? "labelFr" : "labelEn"] || deviceType],
              [t.mobitech.stepRepair, REPAIR_TYPES.find(r => r.id === repairType)?.[lang === "fr" ? "labelFr" : "labelEn"] || repairType],
              [t.mobitech.stepLocation, loc?.name || location],
              [t.mobitech.stepDateTime, `${date} — ${time}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 py-2.5 last:border-0 text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="font-medium text-indigo-950">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="primary" onClick={() => router.push("/tableau-de-bord")}>
              {lang === "fr" ? "Mon tableau de bord" : "My dashboard"}
            </Button>
            <Button variant="outline" onClick={reset}>
              {t.mobitech.newRepair}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-100 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 text-center md:px-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <WrenchIcon size={24} className="text-indigo-600" />
            <span className="text-xl font-medium text-indigo-950">Mobi</span>
            <span className="text-xl font-medium text-indigo-600">Tech</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl">{t.mobitech.title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-500">{t.mobitech.sub}</p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-5 py-16 md:px-8 md:py-20">
        {/* Step Indicator */}
        <div className="mb-10 flex items-center gap-1 overflow-x-auto">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex flex-1 items-center gap-1.5 min-w-0">
              <div className={cn(
                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                step > i + 1 ? "bg-emerald-500 text-white"
                  : step === i + 1 ? "bg-indigo-950 text-white"
                    : "bg-slate-100 text-slate-400"
              )}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={cn(
                "hidden text-xs font-medium truncate sm:block",
                step === i + 1 ? "text-indigo-950" : "text-slate-400"
              )}>
                {label}
              </span>
              {i < 4 && <div className={cn("h-px flex-1 min-w-2", step > i + 1 ? "bg-emerald-500" : "bg-slate-200")} />}
            </div>
          ))}
        </div>

        {/* Step 1: Device Type */}
        {step === 1 && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-indigo-950">{t.mobitech.selectDevice}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DEVICE_BRANDS.map((d) => {
                const label = lang === "fr" ? d.labelFr : d.labelEn;
                return (
                  <button
                    key={d.id}
                    onClick={() => { setDeviceType(d.id); setStep(2); }}
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-indigo-950 hover:shadow-lg"
                  >
                    <PhoneIcon size={28} className="text-slate-500" />
                    <span className="text-sm font-medium text-indigo-950">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Repair Type */}
        {step === 2 && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-indigo-950">{t.mobitech.selectRepair}</h2>
            <div className="space-y-3">
              {REPAIR_TYPES.map((r) => {
                const Icon = REPAIR_ICONS[r.id] || WrenchIcon;
                const label = lang === "fr" ? r.labelFr : r.labelEn;
                const price = lang === "fr" ? r.priceFr : r.priceEn;
                return (
                  <button
                    key={r.id}
                    onClick={() => { setRepairType(r.id); setStep(3); }}
                    className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-indigo-950 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                        <Icon size={20} className="text-slate-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-indigo-950">{label}</div>
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
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep(1)}>
              ← {lang === "fr" ? "Retour" : "Back"}
            </Button>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-indigo-950">{t.mobitech.selectLocation}</h2>
            <div className="space-y-3">
              {REPAIR_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => { setLocation(loc.id); setStep(4); }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-indigo-950 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                      <MapPinIcon size={20} className="text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-indigo-950">{loc.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{loc.address}</div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                        <span>{loc.hours}</span>
                        <span>{loc.distance}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon size={18} className="text-slate-400" />
                </button>
              ))}
              {/* Home Service */}
              <button
                onClick={() => { setLocation("home"); setStep(4); }}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-yellow-300/50 bg-yellow-50 p-4 transition-all hover:border-yellow-400/60"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                    <WrenchIcon size={20} className="text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-indigo-950">{t.mobitech.homeService}</div>
                    <div className="text-xs text-slate-500">{t.mobitech.homeServiceSub}</div>
                    <div className="mt-0.5 text-xs font-semibold text-yellow-500">+2 000 XOF</div>
                  </div>
                </div>
                <ChevronRightIcon size={18} className="text-slate-400" />
              </button>
            </div>
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep(2)}>
              ← {lang === "fr" ? "Retour" : "Back"}
            </Button>
          </div>
        )}

        {/* Step 4: Date & Time + Contact */}
        {step === 4 && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-indigo-950">{t.mobitech.selectDateTime}</h2>
            <div className="space-y-5 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <FormField label={t.mobitech.date}>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </FormField>

              <FormField label={t.mobitech.time}>
                <div className="grid grid-cols-5 gap-2">
                  {TIMES.map((t_slot) => (
                    <button
                      key={t_slot}
                      onClick={() => setTime(t_slot)}
                      className={cn(
                        "cursor-pointer rounded-full border px-2 py-2.5 text-sm font-medium transition-all",
                        time === t_slot
                          ? "border-indigo-950 bg-indigo-950 text-white"
                          : "border-slate-200/80 hover:border-indigo-950 text-slate-500"
                      )}
                    >
                      {t_slot}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-4 text-sm font-medium text-indigo-950">{t.mobitech.yourInfo}</h3>
                <div className="space-y-4">
                  <FormField label={t.mobitech.name}>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aminata Diallo" />
                  </FormField>
                  <FormField label={t.mobitech.phone}>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 000 00 00" />
                  </FormField>
                </div>
              </div>

              {createBooking.isError && (
                <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {lang === "fr" ? "Une erreur est survenue. Réessayez." : "An error occurred. Please try again."}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleBook}
                loading={createBooking.isPending}
                disabled={!date || !time || !name || !phone || createBooking.isPending}
              >
                {createBooking.isPending ? t.mobitech.booking : t.mobitech.book}
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep(3)}>
              ← {lang === "fr" ? "Retour" : "Back"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
