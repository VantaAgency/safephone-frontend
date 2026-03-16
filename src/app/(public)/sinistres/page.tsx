"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Textarea, Select } from "@/components/ui/form-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldCheckIcon, CheckCircleIcon, ScreenIcon, DropletIcon, PhoneIcon } from "@/components/ui/icons";
import { useClaims, useCreateClaim, useDevices, useSubscriptions } from "@/lib/api/hooks";
import { CardSkeleton } from "@/components/ui/skeleton";
import { formatXOF } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { ClaimType } from "@/lib/api/types";

const CLAIM_TYPE_ICONS: Record<string, typeof ScreenIcon> = {
  screen: ScreenIcon,
  water: DropletIcon,
  theft: ShieldCheckIcon,
  breakdown: PhoneIcon,
};

export default function SinistresPage() {
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<"history" | "new">("history");
  const [claimType, setClaimType] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const { data: claims, isLoading: claimsLoading } = useClaims();
  const { data: devices } = useDevices();
  const { data: subscriptions } = useSubscriptions();
  const createClaim = useCreateClaim();

  const activeDevices = devices?.filter((d) => d.status === "active") ?? [];

  const statusLabels: Record<string, string> = {
    pending: t.claims.pending,
    review: t.claims.review,
    approved: t.claims.approved,
    settled: t.claims.settled,
  };

  const handleSubmit = async () => {
    if (!claimType || !desc || !selectedDeviceId) return;

    // Find subscription for this device
    const sub = subscriptions?.find((s) => s.device_id === selectedDeviceId && s.status === "active");
    if (!sub) return;

    try {
      await createClaim.mutateAsync({
        device_id: selectedDeviceId,
        subscription_id: sub.id,
        claim_type: claimType as ClaimType,
        description: desc,
      });
      setClaimType("");
      setDesc("");
      setSelectedDeviceId("");
      setTab("history");
    } catch (err) {
      console.error("Failed to create claim:", err);
    }
  };

  return (
    <div className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-indigo-950">{t.claims.title}</h1>
            <p className="mt-1 text-slate-500">{t.claims.sub}</p>
          </div>
          <Button
            variant={tab === "new" ? "outline" : "primary"}
            size="sm"
            onClick={() => setTab(tab === "new" ? "history" : "new")}
          >
            {tab === "new" ? t.claims.history : t.claims.new}
          </Button>
        </div>

        {/* Success State */}
        {createClaim.isSuccess && (
          <div className="mb-6 rounded-[2rem] border border-emerald-200/60 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircleIcon size={24} className="text-emerald-500" />
              <div>
                <div className="font-medium text-indigo-950">
                  {lang === "fr" ? "Sinistre déclaré avec succès" : "Claim submitted successfully"}
                </div>
                <div className="text-sm text-slate-500">
                  {lang === "fr" ? "Nous traitons votre dossier sous 48h." : "We'll process your case within 48h."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {createClaim.isError && (
          <div className="mb-6 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {lang === "fr" ? "Impossible de soumettre le sinistre." : "Could not submit the claim."}
          </div>
        )}

        {/* New Claim Form */}
        {tab === "new" && (
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-lg font-medium text-indigo-950">{t.claims.new}</h2>
            <div className="space-y-5">
              <FormField label={t.claims.device}>
                <Select value={selectedDeviceId} onChange={(e) => setSelectedDeviceId((e.target as HTMLSelectElement).value)}>
                  <option value="">{lang === "fr" ? "Sélectionnez un appareil" : "Select a device"}</option>
                  {activeDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.brand} {d.model} — IMEI: {d.imei}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={t.claims.type}>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(t.claims.types) as [string, string][]).map(([key, label]) => {
                    const Icon = CLAIM_TYPE_ICONS[key] || PhoneIcon;
                    return (
                      <button
                        key={key}
                        onClick={() => setClaimType(key)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                          claimType === key
                            ? "border-indigo-950 bg-indigo-950/5 ring-1 ring-indigo-950/20"
                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg"
                        )}
                      >
                        <Icon size={18} className="text-slate-500" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <FormField label={t.claims.desc}>
                <Textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={lang === "fr" ? "Décrivez les circonstances de l'incident..." : "Describe the circumstances of the incident..."}
                />
              </FormField>

              <FormField label={t.claims.upload}>
                <div className="flex h-24 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                  {lang === "fr" ? "Glissez vos photos ici ou cliquez pour parcourir" : "Drag your photos here or click to browse"}
                </div>
              </FormField>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSubmit}
                loading={createClaim.isPending}
                disabled={!claimType || !desc || !selectedDeviceId}
              >
                {t.claims.submit}
              </Button>
            </div>
          </div>
        )}

        {/* Claims History */}
        {tab === "history" && (
          <div>
            {claimsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : !claims || claims.length === 0 ? (
              <EmptyState
                icon={<ShieldCheckIcon size={28} />}
                title={t.claims.empty}
                description={t.claims.emptyDesc}
                action={{ label: t.claims.new, onClick: () => setTab("new") }}
              />
            ) : (
              <div className="space-y-3">
                {claims.map((claim) => {
                  const Icon = CLAIM_TYPE_ICONS[claim.claim_type] || PhoneIcon;
                  return (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                          <Icon size={20} className="text-slate-500" />
                        </div>
                        <div>
                          <div className="font-medium text-indigo-950">
                            {t.claims.types[claim.claim_type as keyof typeof t.claims.types]}
                          </div>
                          <div className="mt-0.5 text-sm text-slate-500">
                            {new Date(claim.filed_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400 font-mono">{claim.id.slice(0, 8)}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={claim.status} label={statusLabels[claim.status] || claim.status} />
                        {claim.amount_xof && (
                          <span className="text-sm font-medium text-emerald-500">{formatXOF(claim.amount_xof)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
