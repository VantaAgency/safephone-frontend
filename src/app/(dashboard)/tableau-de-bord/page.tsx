"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField, Input, Select, Textarea } from "@/components/ui/form-field";
import {
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  DropletIcon,
  PhoneIcon,
  ScreenIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/cards/stat-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  useDevices,
  useClaims,
  usePayments,
  useSubscriptions,
  useCreateClaim,
  useUpdateDevice,
} from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/auth-provider";
import { formatXOF } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type { ClaimType } from "@/lib/api/types";

const DASHBOARD_TABS = ["overview", "claims", "devices", "payments"] as const;
type DashboardTab = (typeof DASHBOARD_TABS)[number];

const CLAIM_TYPE_ICONS: Record<string, typeof ScreenIcon> = {
  screen: ScreenIcon,
  water: DropletIcon,
  theft: ShieldCheckIcon,
  breakdown: PhoneIcon,
};

export default function DashboardPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [tab, setTab] = useState<DashboardTab>("overview");

  const { data: devices, isLoading: devicesLoading } = useDevices();
  const { data: claims, isLoading: claimsLoading } = useClaims();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: subscriptions } = useSubscriptions();

  const createClaim = useCreateClaim();
  const updateDevice = useUpdateDevice();

  // Claims form state
  const [claimView, setClaimView] = useState<"history" | "new">("history");
  const [claimType, setClaimType] = useState("");
  const [claimDesc, setClaimDesc] = useState("");
  const [claimDeviceId, setClaimDeviceId] = useState("");

  // IMEI form state
  const [imeiFormDevice, setImeiFormDevice] = useState<string | null>(null);
  const [imeiValue, setImeiValue] = useState("");

  const tabLabels: Record<DashboardTab, string> = {
    overview: t.dashboard.tabOverview,
    claims: t.dashboard.tabClaims,
    devices: t.dashboard.tabDevices,
    payments: t.dashboard.tabPayments,
  };

  const statusLabels: Record<string, string> = {
    pending: t.claims.pending,
    review: t.claims.review,
    approved: t.claims.approved,
    settled: t.claims.settled,
    completed: lang === "fr" ? "Payé" : "Paid",
    active: t.dashboard.covered,
  };

  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    wave: "Wave",
    orange_money: "Orange Money",
    free_money: "Free Money",
    card: lang === "fr" ? "Carte bancaire" : "Bank card",
  };

  const handleClaimSubmit = async () => {
    if (!claimType || !claimDesc || !claimDeviceId) return;
    const sub = subscriptions?.find(
      (s) => s.device_id === claimDeviceId && s.status === "active"
    );
    if (!sub) return;

    try {
      await createClaim.mutateAsync({
        device_id: claimDeviceId,
        subscription_id: sub.id,
        claim_type: claimType as ClaimType,
        description: claimDesc,
      });
      setClaimType("");
      setClaimDesc("");
      setClaimDeviceId("");
      setClaimView("history");
    } catch (err) {
      console.error("Failed to create claim:", err);
    }
  };

  const handleImeiSubmit = async (deviceId: string) => {
    if (imeiValue.length < 10) return;
    const device = devices?.find((d) => d.id === deviceId);
    if (!device) return;

    try {
      await updateDevice.mutateAsync({
        id: deviceId,
        data: { brand: device.brand, model: device.model, status: "active" },
      });
      setImeiFormDevice(null);
      setImeiValue("");
    } catch (err) {
      console.error("Failed to update device:", err);
    }
  };

  const pendingDevices = devices?.filter((d) => d.status === "pending") ?? [];
  const activeDevices = devices?.filter((d) => d.status === "active") ?? [];
  const activeSubscriptions = subscriptions?.filter((s) => s.status === "active") ?? [];

  const userName = user?.name || "Utilisateur";

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-400">
              {t.dashboard.title}
            </p>
            <h1 className="text-2xl font-medium tracking-tight text-indigo-950 md:text-3xl">
              {t.dashboard.welcome}, {userName}
            </h1>
          </div>
          <Link href="/inscription">
            <Button variant="primary" size="sm">{t.dashboard.addDevice}</Button>
          </Link>
        </div>

        {/* IMEI completion alert */}
        {pendingDevices.length > 0 && tab !== "devices" && (
          <div className="mb-6 flex items-start justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon size={20} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {lang === "fr" ? "Complétez l'enregistrement" : "Complete registration"}
                </p>
                <p className="mt-0.5 text-xs text-amber-700">
                  {lang === "fr"
                    ? `${pendingDevices.map((d) => `${d.brand} ${d.model}`).join(", ")} — ajoutez le numéro IMEI pour activer votre couverture complète.`
                    : `${pendingDevices.map((d) => `${d.brand} ${d.model}`).join(", ")} — add your IMEI to activate full coverage.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab("devices")}
              className="ml-3 shrink-0 text-xs font-medium text-amber-700 hover:underline"
            >
              {lang === "fr" ? "Ajouter l'IMEI →" : "Add IMEI →"}
            </button>
          </div>
        )}

        {/* Stats Strip */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label={t.dashboard.active}
            value={String(activeSubscriptions.length)}
            icon={<ShieldCheckIcon size={20} className="text-emerald-500" />}
          />
          <StatCard
            label={t.dashboard.devices}
            value={String(devices?.length ?? 0)}
            icon={<PhoneIcon size={20} className="text-indigo-600" />}
          />
          <StatCard
            label={t.dashboard.claims}
            value={String(claims?.length ?? 0)}
            icon={<ClockIcon size={20} className="text-yellow-500" />}
          />
          <StatCard
            label={t.dashboard.payments}
            value={String(payments?.length ?? 0)}
            icon={<CreditCardIcon size={20} className="text-slate-500" />}
          />
        </div>

        {/* Tab Bar */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1">
          {DASHBOARD_TABS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "shrink-0 cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                tab === key
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950"
              )}
            >
              {tabLabels[key]}
            </button>
          ))}
        </div>

        {/* -- OVERVIEW TAB -- */}
        {tab === "overview" && (
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-3">
              {/* Devices */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-indigo-950">{t.dashboard.myDevices}</h2>
                  <button type="button" onClick={() => setTab("devices")} className="cursor-pointer text-sm font-medium text-indigo-600 hover:underline">
                    {t.dashboard.viewAll}
                  </button>
                </div>
                {devicesLoading ? (
                  <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}</div>
                ) : !devices || devices.length === 0 ? (
                  <EmptyState icon={<PhoneIcon size={28} />} title={lang === "fr" ? "Aucun appareil" : "No devices"} description={lang === "fr" ? "Enregistrez votre premier appareil." : "Register your first device."} />
                ) : (
                  <div className="space-y-3">
                    {devices.slice(0, 3).map((d) => (
                      <div key={d.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/5">
                            <PhoneIcon size={22} className="text-indigo-950" />
                          </div>
                          <div>
                            <div className="font-medium text-indigo-950">{d.brand} {d.model}</div>
                            <div className="mt-0.5 font-mono text-xs text-slate-400">
                              {d.imei && d.imei !== "000000000000000" ? `IMEI: ${d.imei}` : (lang === "fr" ? "IMEI manquant" : "IMEI missing")}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={d.status} label={statusLabels[d.status] || d.status} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Claims */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-indigo-950">{t.dashboard.recentClaims}</h2>
                  <button type="button" onClick={() => setTab("claims")} className="cursor-pointer text-sm font-medium text-indigo-600 hover:underline">
                    {t.dashboard.viewAll}
                  </button>
                </div>
                {claimsLoading ? (
                  <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}</div>
                ) : !claims || claims.length === 0 ? (
                  <EmptyState icon={<ShieldCheckIcon size={28} />} title={t.claims.empty} description={t.claims.emptyDesc} />
                ) : (
                  <div className="space-y-3">
                    {claims.slice(0, 3).map((c) => {
                      const Icon = CLAIM_TYPE_ICONS[c.claim_type] || PhoneIcon;
                      return (
                        <div key={c.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                              <Icon size={18} className="text-slate-500" />
                            </div>
                            <div>
                              <div className="font-medium text-indigo-950">
                                {t.claims.types[c.claim_type as keyof typeof t.claims.types]}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500">
                                {new Date(c.filed_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <StatusBadge status={c.status} label={statusLabels[c.status] || c.status} />
                            {c.amount_xof && <span className="text-sm font-medium text-emerald-600">{formatXOF(c.amount_xof)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => { setTab("claims"); setClaimView("new"); }}>
                    {t.dashboard.newClaim}
                  </Button>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">{t.dashboard.myPlans}</h3>
                {activeSubscriptions.length === 0 ? (
                  <p className="text-sm text-slate-500">{lang === "fr" ? "Aucun forfait actif." : "No active plans."}</p>
                ) : (
                  <div className="space-y-3">
                    {activeSubscriptions.map((sub) => {
                      const device = devices?.find((d) => d.id === sub.device_id);
                      return (
                        <div key={sub.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium text-indigo-950">
                                {device ? `${device.brand} ${device.model}` : "—"}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500">{sub.billing_cycle === "annual" ? (lang === "fr" ? "Annuel" : "Annual") : (lang === "fr" ? "Mensuel" : "Monthly")}</div>
                            </div>
                            <StatusBadge status="active" label={t.dashboard.covered} dot={false} />
                          </div>
                          {sub.current_period_end && (
                            <div className="mt-2 text-xs text-slate-400">
                              {t.dashboard.expires} {new Date(sub.current_period_end).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">{t.dashboard.recentPayments}</h3>
                  <button type="button" onClick={() => setTab("payments")} className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline">
                    {t.dashboard.viewAll}
                  </button>
                </div>
                {paymentsLoading ? (
                  <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}</div>
                ) : !payments || payments.length === 0 ? (
                  <p className="text-sm text-slate-500">{t.dashboard.noPaymentsDesc}</p>
                ) : (
                  <div className="space-y-0">
                    {payments.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between border-b border-slate-50 py-3 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-indigo-950">
                            {PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {p.paid_at ? new Date(p.paid_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US") : "—"}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-emerald-600">{formatXOF(p.amount_xof)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* -- CLAIMS TAB -- */}
        {tab === "claims" && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-medium text-indigo-950">{t.claims.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{t.claims.sub}</p>
              </div>
              <Button
                variant={claimView === "new" ? "outline" : "primary"}
                size="sm"
                onClick={() => setClaimView(claimView === "new" ? "history" : "new")}
              >
                {claimView === "new" ? t.claims.history : t.claims.new}
              </Button>
            </div>

            {createClaim.isSuccess && (
              <div className="mb-6 rounded-2xl border border-emerald-200/60 bg-emerald-50 p-5">
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

            {claimView === "new" && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
                <h3 className="mb-6 text-lg font-medium text-indigo-950">{t.claims.new}</h3>
                <div className="space-y-5">
                  <FormField label={t.claims.device}>
                    <Select value={claimDeviceId} onChange={(e) => setClaimDeviceId((e.target as HTMLSelectElement).value)}>
                      <option value="">{lang === "fr" ? "Sélectionnez un appareil" : "Select a device"}</option>
                      {activeDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.brand} {d.model}{d.imei && d.imei !== "000000000000000" ? ` — IMEI: ${d.imei}` : ""}
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
                            type="button"
                            onClick={() => setClaimType(key)}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                              claimType === key
                                ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600/20"
                                : "border-slate-200 bg-white hover:border-slate-300"
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
                      value={claimDesc}
                      onChange={(e) => setClaimDesc(e.target.value)}
                      placeholder={lang === "fr" ? "Décrivez les circonstances de l'incident..." : "Describe the circumstances of the incident..."}
                    />
                  </FormField>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleClaimSubmit}
                    loading={createClaim.isPending}
                    disabled={!claimType || !claimDesc || !claimDeviceId}
                  >
                    {t.claims.submit}
                  </Button>
                </div>
              </div>
            )}

            {claimView === "history" && (
              <div>
                {claimsLoading ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
                ) : !claims || claims.length === 0 ? (
                  <EmptyState icon={<ShieldCheckIcon size={28} />} title={t.claims.empty} description={t.claims.emptyDesc} action={{ label: t.claims.new, onClick: () => setClaimView("new") }} />
                ) : (
                  <div className="space-y-3">
                    {claims.map((claim) => {
                      const Icon = CLAIM_TYPE_ICONS[claim.claim_type] || PhoneIcon;
                      return (
                        <div key={claim.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                              <Icon size={20} className="text-slate-500" />
                            </div>
                            <div>
                              <div className="font-medium text-indigo-950">{t.claims.types[claim.claim_type as keyof typeof t.claims.types]}</div>
                              <div className="mt-0.5 text-sm text-slate-500">
                                {new Date(claim.filed_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                              </div>
                              <div className="mt-0.5 font-mono text-xs text-slate-400">{claim.id.slice(0, 8)}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={claim.status} label={statusLabels[claim.status] || claim.status} />
                            {claim.amount_xof && <span className="text-sm font-medium text-emerald-600">{formatXOF(claim.amount_xof)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* -- DEVICES TAB -- */}
        {tab === "devices" && (
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-medium text-indigo-950">{t.dashboard.myDevices}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {lang === "fr" ? "Tous vos appareils enregistrés et leurs forfaits actifs." : "All your registered devices and their active plans."}
                </p>
              </div>
              <Link href="/inscription">
                <Button variant="primary" size="sm">{t.dashboard.addDevice}</Button>
              </Link>
            </div>

            {devicesLoading ? (
              <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : !devices || devices.length === 0 ? (
              <EmptyState icon={<PhoneIcon size={28} />} title={lang === "fr" ? "Aucun appareil" : "No devices"} description={lang === "fr" ? "Enregistrez votre premier appareil." : "Register your first device."} action={{ label: t.dashboard.addDevice, onClick: () => window.location.href = "/inscription" }} />
            ) : (
              <div className="space-y-4">
                {devices.map((d) => (
                  <div key={d.id} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-950/5">
                          <PhoneIcon size={26} className="text-indigo-950" />
                        </div>
                        <div>
                          <div className="text-lg font-medium text-indigo-950">{d.brand} {d.model}</div>
                          <div className="mt-0.5 font-mono text-xs text-slate-400">
                            {d.imei && d.imei !== "000000000000000" ? `${t.dashboard.deviceImei}: ${d.imei}` : (lang === "fr" ? "IMEI non renseigné" : "IMEI not provided")}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={d.status} label={statusLabels[d.status] || d.status} />
                    </div>

                    {/* IMEI completion prompt */}
                    {d.status === "pending" && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        {imeiFormDevice === d.id ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-amber-800">
                              {lang === "fr" ? "Entrez votre numéro IMEI" : "Enter your IMEI number"}
                            </p>
                            <p className="text-xs text-amber-700">
                              {lang === "fr" ? "Composez *#06# sur votre téléphone pour trouver votre IMEI." : "Dial *#06# on your phone to find your IMEI."}
                            </p>
                            <div className="flex gap-2">
                              <Input
                                value={imeiValue}
                                onChange={(e) => setImeiValue(e.target.value.replace(/\D/g, "").slice(0, 15))}
                                placeholder="357841092648301"
                                className="font-mono text-sm tracking-wider"
                              />
                              <Button variant="primary" size="sm" onClick={() => handleImeiSubmit(d.id)} disabled={imeiValue.length < 10} loading={updateDevice.isPending}>
                                {lang === "fr" ? "Valider" : "Submit"}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setImeiFormDevice(null); setImeiValue(""); }}>
                                {lang === "fr" ? "Annuler" : "Cancel"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-amber-800">
                                {lang === "fr" ? "Complétez l'enregistrement" : "Complete registration"}
                              </p>
                              <p className="mt-0.5 text-xs text-amber-700">
                                {lang === "fr" ? "Ajoutez l'IMEI pour activer votre couverture complète." : "Add your IMEI to activate full coverage."}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setImeiFormDevice(d.id)}
                              className="ml-4 shrink-0 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-800"
                            >
                              {lang === "fr" ? "Ajouter l'IMEI" : "Add IMEI"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                      <StatusBadge status={d.status} label={statusLabels[d.status] || d.status} />
                      {d.status === "active" && (
                        <div className="ml-auto">
                          <button
                            type="button"
                            onClick={() => { setTab("claims"); setClaimView("new"); setClaimDeviceId(d.id); }}
                            className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline"
                          >
                            {lang === "fr" ? "Déclarer un sinistre" : "File a claim"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -- PAYMENTS TAB -- */}
        {tab === "payments" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-indigo-950">{t.dashboard.tabPayments}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {lang === "fr" ? "Historique complet de vos paiements mensuels." : "Full history of your monthly payments."}
              </p>
            </div>

            {paymentsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : !payments || payments.length === 0 ? (
              <EmptyState icon={<CreditCardIcon size={28} />} title={t.dashboard.noPayments} description={t.dashboard.noPaymentsDesc} />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {[
                          lang === "fr" ? "Montant" : "Amount",
                          lang === "fr" ? "Méthode" : "Method",
                          lang === "fr" ? "Statut" : "Status",
                          "Date",
                        ].map((h) => (
                          <th key={h} className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                          <td className="px-5 py-4 font-medium text-emerald-600">{formatXOF(p.amount_xof)}</td>
                          <td className="px-5 py-4 text-slate-500">{PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}</td>
                          <td className="px-5 py-4">
                            <StatusBadge status={p.status === "completed" ? "active" : p.status} label={statusLabels[p.status] || p.status} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                            {p.paid_at ? new Date(p.paid_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
