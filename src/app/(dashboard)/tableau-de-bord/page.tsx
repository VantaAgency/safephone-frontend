"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  WrenchIcon,
} from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/cards/stat-card";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import {
  useDevices,
  useClaims,
  usePayments,
  useResumePayment,
  useSubscriptions,
  useCreateClaim,
  useMyRepairRequests,
  useUpdateDevice,
} from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/auth-provider";
import { formatXOF } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import {
  REPAIR_PROGRESS_FLOW,
  formatRepairDeviceLabel,
  formatRepairPreferredSlot,
  formatRepairScheduledSlot,
  getRepairServiceLabel,
  getRepairStatusLabel,
  getRepairTypeLabel,
} from "@/lib/repairs";
import { cn } from "@/lib/utils";
import type {
  ClaimType,
  Device,
  Payment,
  RepairRequestStatus,
  Subscription,
} from "@/lib/api/types";

const DASHBOARD_TABS = ["overview", "claims", "repairs", "devices", "payments"] as const;
type DashboardTab = (typeof DASHBOARD_TABS)[number];

const CLAIM_TYPE_ICONS: Record<string, typeof ScreenIcon> = {
  screen: ScreenIcon,
  water: DropletIcon,
  theft: ShieldCheckIcon,
  breakdown: PhoneIcon,
};

type DeviceCoverageStatus =
  | "active"
  | "awaiting_payment"
  | "pending_activation"
  | "pending"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded"
  | "suspended";

interface DeviceCoverageMeta {
  status: DeviceCoverageStatus;
  payment?: Payment;
  subscription?: Subscription;
}

function formatDeviceDisplayName(device: Device): string {
  const brand = device.brand.trim();
  const model = device.model.trim();

  if (!brand) return model;
  if (!model) return brand;

  const normalizedBrand = brand.toLowerCase();
  const normalizedModel = model.toLowerCase();

  if (
    normalizedModel === normalizedBrand ||
    normalizedModel.startsWith(`${normalizedBrand} `)
  ) {
    return model;
  }

  return `${brand} ${model}`;
}

function RepairProgress({
  status,
  lang,
}: {
  status: RepairRequestStatus;
  lang: "fr" | "en";
}) {
  if (status === "rejected" || status === "cancelled") {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
        {lang === "fr"
          ? "Le suivi s'arrête ici pour cette demande."
          : "Progress ends here for this request."}
      </div>
    );
  }

  const currentIndex = REPAIR_PROGRESS_FLOW.indexOf(status);

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {REPAIR_PROGRESS_FLOW.map((step, index) => (
        <div key={step} className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
              index <= currentIndex
                ? "bg-indigo-950 text-white"
                : "bg-slate-100 text-slate-400",
            )}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              "hidden truncate text-xs font-medium sm:block",
              index <= currentIndex ? "text-indigo-950" : "text-slate-400",
            )}
          >
            {getRepairStatusLabel(step, lang)}
          </span>
          {index < REPAIR_PROGRESS_FLOW.length - 1 && (
            <div
              className={cn(
                "h-px min-w-4 flex-1",
                index < currentIndex ? "bg-indigo-950" : "bg-slate-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function DashboardStatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-12" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

function DashboardBannerSkeleton() {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3">
          <Skeleton className="mt-0.5 h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full max-w-2xl" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function DashboardSidebarSectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [tab, setTab] = useState<DashboardTab>(() => {
    if (requestedTab && DASHBOARD_TABS.includes(requestedTab as DashboardTab)) {
      return requestedTab as DashboardTab;
    }
    return "overview";
  });

  const {
    data: devices,
    isLoading: devicesLoading,
    refetch: refetchDevices,
  } = useDevices();
  const { data: claims, isLoading: claimsLoading } = useClaims();
  const { data: repairRequests, isLoading: repairsLoading } = useMyRepairRequests();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const {
    data: subscriptions,
    isLoading: subscriptionsLoading,
    refetch: refetchSubscriptions,
  } = useSubscriptions();

  const createClaim = useCreateClaim();
  const updateDevice = useUpdateDevice();
  const resumePayment = useResumePayment();

  // Claims form state
  const [claimView, setClaimView] = useState<"history" | "new">("history");
  const [claimType, setClaimType] = useState("");
  const [claimDesc, setClaimDesc] = useState("");
  const [claimDeviceId, setClaimDeviceId] = useState("");

  // IMEI form state
  const [imeiFormDevice, setImeiFormDevice] = useState<string | null>(null);
  const [imeiValue, setImeiValue] = useState("");
  const [paymentActionError, setPaymentActionError] = useState("");

  const tabLabels: Record<DashboardTab, string> = {
    overview: t.dashboard.tabOverview,
    claims: t.dashboard.tabClaims,
    repairs: lang === "fr" ? "Mes réparations" : "My repairs",
    devices: t.dashboard.tabDevices,
    payments: t.dashboard.tabPayments,
  };

  const statusLabels: Record<string, string> = {
    awaiting_payment: lang === "fr" ? "Paiement en attente" : "Payment pending",
    pending: t.claims.pending,
    accepted: lang === "fr" ? "Acceptée" : "Accepted",
    pending_activation:
      lang === "fr" ? "Activation en attente" : "Pending activation",
    review: t.claims.review,
    approved: t.claims.approved,
    scheduled: lang === "fr" ? "Planifiée" : "Scheduled",
    in_progress: lang === "fr" ? "En cours" : "In progress",
    settled: t.claims.settled,
    completed: lang === "fr" ? "Payé" : "Paid",
    failed: lang === "fr" ? "Paiement échoué" : "Payment failed",
    cancelled: lang === "fr" ? "Paiement annulé" : "Payment cancelled",
    expired: lang === "fr" ? "Paiement expiré" : "Payment expired",
    refunded: lang === "fr" ? "Remboursé" : "Refunded",
    suspended: lang === "fr" ? "Suspendu" : "Suspended",
    active: t.dashboard.covered,
  };

  const imeiHelpText =
    lang === "fr"
      ? "Astuce : composez *#06# sur votre téléphone, ou allez dans Réglages > Général > Informations pour retrouver l’IMEI."
      : "Tip: dial *#06# on your phone, or go to Settings > General > About to find the IMEI.";

  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    wave: "Wave",
    orange_money: "Orange Money",
    free_money: "Free Money",
    card: lang === "fr" ? "Carte bancaire" : "Bank card",
  };

  const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
    dexpay: "DEXPAY",
  };

  const getPaymentProviderLabel = (provider?: string) => {
    if (!provider) return "—";
    return PAYMENT_PROVIDER_LABELS[provider] || provider.toUpperCase();
  };

  const getPaymentMethodLabel = (payment?: Payment) => {
    if (!payment?.payment_method) return null;
    return (
      PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method
    );
  };

  const getPaymentDisplayLabel = (payment: Payment) => {
    const providerLabel = getPaymentProviderLabel(payment.provider);
    const methodLabel = getPaymentMethodLabel(payment);
    return methodLabel ? `${providerLabel} • ${methodLabel}` : providerLabel;
  };

  const completedPaymentIdsSignature = useMemo(
    () =>
      (payments ?? [])
        .filter((payment) => payment.status === "completed")
        .map((payment) => payment.id)
        .sort()
        .join(","),
    [payments],
  );

  useEffect(() => {
    if (!completedPaymentIdsSignature) return;
    void refetchDevices();
    void refetchSubscriptions();
  }, [completedPaymentIdsSignature, refetchDevices, refetchSubscriptions]);

  const subscriptionsReady = !subscriptionsLoading;
  const coverageDataLoading =
    devicesLoading || subscriptionsLoading || paymentsLoading;
  const coverageDataReady = !coverageDataLoading;
  const plansSectionLoading = devicesLoading || subscriptionsLoading;

  const handleClaimSubmit = async () => {
    if (!claimType || !claimDesc || !claimDeviceId) return;
    const sub = subscriptions?.find(
      (s) => s.device_id === claimDeviceId && s.status === "active",
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
        data: { brand: device.brand, model: device.model, imei: imeiValue },
      });
      setImeiFormDevice(null);
      setImeiValue("");
    } catch (err) {
      console.error("Failed to update device:", err);
    }
  };

  const handleResumeCheckout = async (paymentId: string) => {
    setPaymentActionError("");
    try {
      const result = await resumePayment.mutateAsync(paymentId);
      if (result.payment_url) {
        window.location.assign(result.payment_url);
        return;
      }
      setPaymentActionError(
        lang === "fr"
          ? "Ce paiement n'a plus de session de paiement disponible."
          : "This payment no longer has an available checkout session.",
      );
    } catch (err) {
      console.error("Failed to resume payment:", err);
      setPaymentActionError(
        lang === "fr"
          ? "Impossible de reprendre ce paiement pour le moment."
          : "Could not resume this payment right now.",
      );
    }
  };

  const latestSubscriptionByDeviceId = useMemo(() => {
    const subscriptionMap = new Map<string, Subscription>();

    if (!coverageDataReady) return subscriptionMap;

    (subscriptions ?? []).forEach((sub) => {
      if (!subscriptionMap.has(sub.device_id)) {
        subscriptionMap.set(sub.device_id, sub);
      }
    });

    return subscriptionMap;
  }, [coverageDataReady, subscriptions]);

  const latestPaymentBySubscriptionId = useMemo(() => {
    const paymentMap = new Map<string, Payment>();

    if (!coverageDataReady) return paymentMap;

    (payments ?? []).forEach((payment) => {
      if (!paymentMap.has(payment.subscription_id)) {
        paymentMap.set(payment.subscription_id, payment);
      }
    });

    return paymentMap;
  }, [coverageDataReady, payments]);

  const getDeviceCoverageMeta = (device: Device): DeviceCoverageMeta => {
    const subscription = latestSubscriptionByDeviceId.get(device.id);
    const payment = subscription
      ? latestPaymentBySubscriptionId.get(subscription.id)
      : undefined;

    if (subscription?.status === "active") {
      if (device.status === "active") {
        return { status: "active", payment, subscription };
      }
      return { status: "pending_activation", payment, subscription };
    }

    if (payment) {
      switch (payment.status) {
        case "completed":
          return device.status === "active"
            ? { status: "active", payment, subscription }
            : { status: "pending_activation", payment, subscription };
        case "pending":
          return { status: "awaiting_payment", payment, subscription };
        case "failed":
          return { status: "failed", payment, subscription };
        case "cancelled":
          return { status: "cancelled", payment, subscription };
        case "expired":
          return { status: "expired", payment, subscription };
        case "refunded":
          return { status: "refunded", payment, subscription };
      }
    }

    if (device.status === "suspended") {
      return { status: "suspended", payment, subscription };
    }
    if (device.status === "active") {
      return { status: "pending_activation", payment, subscription };
    }

    return { status: "pending", payment, subscription };
  };

  const deviceCoverageById = new Map<string, DeviceCoverageMeta>();
  if (coverageDataReady && devices) {
    devices.forEach((device) => {
      deviceCoverageById.set(device.id, getDeviceCoverageMeta(device));
    });
  }

  const devicesPendingActivation =
    coverageDataReady && devices
      ? devices.filter(
          (device) =>
            deviceCoverageById.get(device.id)?.status === "pending_activation",
        )
      : [];

  const activeSubscriptions = subscriptionsReady
    ? (subscriptions ?? []).filter((sub) => sub.status === "active")
    : [];

  const eligibleDevices =
    coverageDataReady && devices
      ? devices.filter((device) => {
          const meta = deviceCoverageById.get(device.id);
          return (
            meta?.status === "active" && meta.subscription?.status === "active"
          );
        })
      : [];

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
            <Button variant="primary" size="sm">
              {t.dashboard.addDevice}
            </Button>
          </Link>
        </div>

        {paymentActionError && (
          <div className="mb-6 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {paymentActionError}
          </div>
        )}

        {/* IMEI completion alert */}
        {tab !== "devices" && coverageDataLoading && <DashboardBannerSkeleton />}
        {tab !== "devices" &&
          coverageDataReady &&
          devicesPendingActivation.length > 0 && (
            <div className="mb-6 flex items-start justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-600"
                />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {lang === "fr"
                      ? "Complétez l'enregistrement"
                      : "Complete registration"}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    {lang === "fr"
                      ? `${devicesPendingActivation.map((d) => formatDeviceDisplayName(d)).join(", ")} — ajoutez le numéro IMEI pour finaliser l'activation après confirmation du paiement.`
                      : `${devicesPendingActivation.map((d) => formatDeviceDisplayName(d)).join(", ")} — add the IMEI to finish activation after payment confirmation.`}
                  </p>
                  <p className="mt-1 text-xs text-amber-700/90">
                    {imeiHelpText}
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
          {subscriptionsLoading ? (
            <DashboardStatCardSkeleton />
          ) : (
            <StatCard
              label={t.dashboard.active}
              value={String(activeSubscriptions.length)}
              icon={<ShieldCheckIcon size={20} className="text-emerald-500" />}
            />
          )}
          {devicesLoading ? (
            <DashboardStatCardSkeleton />
          ) : (
            <StatCard
              label={t.dashboard.devices}
              value={String(devices?.length ?? 0)}
              icon={<PhoneIcon size={20} className="text-indigo-600" />}
            />
          )}
          {claimsLoading ? (
            <DashboardStatCardSkeleton />
          ) : (
            <StatCard
              label={t.dashboard.claims}
              value={String(claims?.length ?? 0)}
              icon={<ClockIcon size={20} className="text-yellow-500" />}
            />
          )}
          {paymentsLoading ? (
            <DashboardStatCardSkeleton />
          ) : (
            <StatCard
              label={t.dashboard.payments}
              value={String(payments?.length ?? 0)}
              icon={<CreditCardIcon size={20} className="text-slate-500" />}
            />
          )}
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
                  : "text-slate-500 hover:text-indigo-950",
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
                  <h2 className="text-lg font-medium text-indigo-950">
                    {t.dashboard.myDevices}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setTab("devices")}
                    className="cursor-pointer text-sm font-medium text-indigo-600 hover:underline"
                  >
                    {t.dashboard.viewAll}
                  </button>
                </div>
                {coverageDataLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                ) : !devices || devices.length === 0 ? (
                  <EmptyState
                    icon={<PhoneIcon size={28} />}
                    title={lang === "fr" ? "Aucun appareil" : "No devices"}
                    description={
                      lang === "fr"
                        ? "Enregistrez votre premier appareil."
                        : "Register your first device."
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {devices.slice(0, 3).map((d) => {
                      const coverage = deviceCoverageById.get(d.id);
                      if (!coverage) return null;

                      return (
                        <div
                          key={d.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/5">
                              <PhoneIcon
                                size={22}
                                className="text-indigo-950"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-indigo-950">
                                {formatDeviceDisplayName(d)}
                              </div>
                              <div className="mt-0.5 font-mono text-xs text-slate-400">
                                {d.imei && d.imei !== "000000000000000"
                                  ? `IMEI: ${d.imei}`
                                  : lang === "fr"
                                    ? "IMEI manquant"
                                    : "IMEI missing"}
                              </div>
                            </div>
                          </div>
                          <StatusBadge
                            status={coverage.status}
                            label={
                              statusLabels[coverage.status] || coverage.status
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Recent Claims */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-indigo-950">
                    {t.dashboard.recentClaims}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setTab("claims")}
                    className="cursor-pointer text-sm font-medium text-indigo-600 hover:underline"
                  >
                    {t.dashboard.viewAll}
                  </button>
                </div>
                {claimsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                ) : !claims || claims.length === 0 ? (
                  <EmptyState
                    icon={<ShieldCheckIcon size={28} />}
                    title={t.claims.empty}
                    description={t.claims.emptyDesc}
                  />
                ) : (
                  <div className="space-y-3">
                    {claims.slice(0, 3).map((c) => {
                      const Icon = CLAIM_TYPE_ICONS[c.claim_type] || PhoneIcon;
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                              <Icon size={18} className="text-slate-500" />
                            </div>
                            <div>
                              <div className="font-medium text-indigo-950">
                                {
                                  t.claims.types[
                                    c.claim_type as keyof typeof t.claims.types
                                  ]
                                }
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500">
                                {new Date(c.filed_at).toLocaleDateString(
                                  lang === "fr" ? "fr-FR" : "en-US",
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <StatusBadge
                              status={c.status}
                              label={statusLabels[c.status] || c.status}
                            />
                            {c.amount_xof && (
                              <span className="text-sm font-medium text-emerald-600">
                                {formatXOF(c.amount_xof)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTab("claims");
                      setClaimView("new");
                    }}
                  >
                    {t.dashboard.newClaim}
                  </Button>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
                  {t.dashboard.myPlans}
                </h3>
                {plansSectionLoading ? (
                  <DashboardSidebarSectionSkeleton />
                ) : activeSubscriptions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {lang === "fr"
                      ? "Aucun forfait actif."
                      : "No active plans."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeSubscriptions.map((sub) => {
                      const device = devices?.find(
                        (d) => d.id === sub.device_id,
                      );
                      return (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium text-indigo-950">
                                {device
                                  ? `${device.brand} ${device.model}`
                                  : "—"}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500">
                                {sub.billing_cycle === "annual"
                                  ? lang === "fr"
                                    ? "Annuel"
                                    : "Annual"
                                  : lang === "fr"
                                    ? "Mensuel"
                                    : "Monthly"}
                              </div>
                            </div>
                            <StatusBadge
                              status="active"
                              label={t.dashboard.covered}
                              dot={false}
                            />
                          </div>
                          {sub.current_period_end && (
                            <div className="mt-2 text-xs text-slate-400">
                              {t.dashboard.expires}{" "}
                              {new Date(
                                sub.current_period_end,
                              ).toLocaleDateString(
                                lang === "fr" ? "fr-FR" : "en-US",
                              )}
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
                  <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {t.dashboard.recentPayments}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setTab("payments")}
                    className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline"
                  >
                    {t.dashboard.viewAll}
                  </button>
                </div>
                {paymentsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                ) : !payments || payments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {t.dashboard.noPaymentsDesc}
                  </p>
                ) : (
                  <div className="space-y-0">
                    {payments.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between border-b border-slate-50 py-3 last:border-0"
                      >
                        <div>
                          <div className="text-sm font-medium text-indigo-950">
                            {getPaymentDisplayLabel(p)}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {p.paid_at
                              ? new Date(p.paid_at).toLocaleDateString(
                                  lang === "fr" ? "fr-FR" : "en-US",
                                )
                              : "—"}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-emerald-600">
                          {formatXOF(p.amount_xof)}
                        </span>
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
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-medium text-indigo-950">
                  {t.claims.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{t.claims.sub}</p>
              </div>
              <Button
                variant={claimView === "new" ? "outline" : "primary"}
                size="sm"
                onClick={() =>
                  setClaimView(claimView === "new" ? "history" : "new")
                }
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
                      {lang === "fr"
                        ? "Sinistre déclaré avec succès"
                        : "Claim submitted successfully"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {lang === "fr"
                        ? "Nous traitons votre dossier sous 48h."
                        : "We'll process your case within 48h."}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {claimView === "new" && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
                <h3 className="mb-6 text-lg font-medium text-indigo-950">
                  {t.claims.new}
                </h3>
                <div className="space-y-5">
                  <FormField label={t.claims.device}>
                    {coverageDataLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    ) : (
                      <Select
                        value={claimDeviceId}
                        onChange={(e) =>
                          setClaimDeviceId(
                            (e.target as HTMLSelectElement).value,
                          )
                        }
                      >
                        <option value="">
                          {lang === "fr"
                            ? "Sélectionnez un appareil"
                            : "Select a device"}
                        </option>
                        {eligibleDevices.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.brand} {d.model}
                            {d.imei && d.imei !== "000000000000000"
                              ? ` — IMEI: ${d.imei}`
                              : ""}
                          </option>
                        ))}
                      </Select>
                    )}
                  </FormField>

                  <FormField label={t.claims.type}>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        Object.entries(t.claims.types) as [string, string][]
                      ).map(([key, label]) => {
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
                                : "border-slate-200 bg-white hover:border-slate-300",
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
                      placeholder={
                        lang === "fr"
                          ? "Décrivez les circonstances de l'incident..."
                          : "Describe the circumstances of the incident..."
                      }
                    />
                  </FormField>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleClaimSubmit}
                    loading={createClaim.isPending}
                    disabled={
                      coverageDataLoading ||
                      !claimType ||
                      !claimDesc ||
                      !claimDeviceId
                    }
                  >
                    {t.claims.submit}
                  </Button>
                </div>
              </div>
            )}

            {claimView === "history" && (
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
                  />
                ) : (
                  <div className="space-y-3">
                    {claims.map((claim) => {
                      const Icon =
                        CLAIM_TYPE_ICONS[claim.claim_type] || PhoneIcon;
                      return (
                        <div
                          key={claim.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                              <Icon size={20} className="text-slate-500" />
                            </div>
                            <div>
                              <div className="font-medium text-indigo-950">
                                {
                                  t.claims.types[
                                    claim.claim_type as keyof typeof t.claims.types
                                  ]
                                }
                              </div>
                              <div className="mt-0.5 text-sm text-slate-500">
                                {new Date(claim.filed_at).toLocaleDateString(
                                  lang === "fr" ? "fr-FR" : "en-US",
                                )}
                              </div>
                              <div className="mt-0.5 font-mono text-xs text-slate-400">
                                {claim.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge
                              status={claim.status}
                              label={statusLabels[claim.status] || claim.status}
                            />
                            {claim.amount_xof && (
                              <span className="text-sm font-medium text-emerald-600">
                                {formatXOF(claim.amount_xof)}
                              </span>
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
        )}

        {tab === "repairs" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-indigo-950">
                {lang === "fr" ? "Mes réparations MobiTech" : "My MobiTech repairs"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {lang === "fr"
                  ? "Suivez vos demandes de réparation, leur statut et le devis fixé par l'admin."
                  : "Track your repair requests, their status, and the quote set by admin."}
              </p>
            </div>

            {repairsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : !repairRequests || repairRequests.length === 0 ? (
              <EmptyState
                icon={<WrenchIcon size={28} />}
                title={
                  lang === "fr" ? "Aucune réparation" : "No repair requests"
                }
                description={
                  lang === "fr"
                    ? "Vos demandes MobiTech apparaîtront ici après soumission."
                    : "Your MobiTech requests will appear here after submission."
                }
                action={{
                  label: lang === "fr" ? "Prendre rendez-vous" : "Book a repair",
                  onClick: () => {
                    window.location.assign("/reparations");
                  },
                }}
              />
            ) : (
              <div className="space-y-4">
                {repairRequests.map((repair) => (
                  <div
                    key={repair.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="font-medium text-indigo-950">
                          {formatRepairDeviceLabel(repair, lang)}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {getRepairTypeLabel(repair.repair_type, lang)}
                        </div>
                        <div className="mt-1 font-mono text-xs text-slate-400">
                          {repair.reference}
                        </div>
                      </div>
                      <StatusBadge
                        status={repair.status}
                        label={getRepairStatusLabel(repair.status, lang)}
                      />
                    </div>

                    <div className="mt-5">
                      <RepairProgress status={repair.status} lang={lang} />
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {lang === "fr" ? "Mode / centre" : "Mode / center"}
                        </div>
                        <div className="mt-1 text-sm font-medium text-indigo-950">
                          {getRepairServiceLabel(repair, lang)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {lang === "fr" ? "Créneau demandé" : "Requested slot"}
                        </div>
                        <div className="mt-1 text-sm font-medium text-indigo-950">
                          {formatRepairPreferredSlot(repair)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {lang === "fr" ? "Rendez-vous planifié" : "Scheduled appointment"}
                        </div>
                        <div className="mt-1 text-sm font-medium text-indigo-950">
                          {formatRepairScheduledSlot(repair) ||
                            (lang === "fr" ? "En attente" : "Pending")}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {lang === "fr" ? "Montant réparation" : "Repair amount"}
                        </div>
                        <div className="mt-1 text-sm font-medium text-indigo-950">
                          {repair.repair_amount_xof
                            ? formatXOF(repair.repair_amount_xof)
                            : lang === "fr"
                              ? "Devis en attente"
                              : "Quote pending"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -- DEVICES TAB -- */}
        {tab === "devices" && (
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-medium text-indigo-950">
                  {t.dashboard.myDevices}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Tous vos appareils enregistrés et leurs forfaits actifs."
                    : "All your registered devices and their active plans."}
                </p>
              </div>
              <Link href="/inscription">
                <Button variant="primary" size="sm">
                  {t.dashboard.addDevice}
                </Button>
              </Link>
            </div>

            {coverageDataLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : !devices || devices.length === 0 ? (
              <EmptyState
                icon={<PhoneIcon size={28} />}
                title={lang === "fr" ? "Aucun appareil" : "No devices"}
                description={
                  lang === "fr"
                    ? "Enregistrez votre premier appareil."
                    : "Register your first device."
                }
              />
            ) : (
              <div className="space-y-4">
                {devices.map((d) => {
                  const coverage = deviceCoverageById.get(d.id);
                  if (!coverage) return null;

                  const canResume =
                    !!coverage.payment &&
                    ["pending", "failed", "cancelled", "expired"].includes(
                      coverage.payment.status,
                    );

                  return (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-950/5">
                            <PhoneIcon size={26} className="text-indigo-950" />
                          </div>
                          <div>
                            <div className="text-lg font-medium text-indigo-950">
                              {formatDeviceDisplayName(d)}
                            </div>
                            <div className="mt-0.5 font-mono text-xs text-slate-400">
                              {d.imei && d.imei !== "000000000000000"
                                ? `${t.dashboard.deviceImei}: ${d.imei}`
                                : lang === "fr"
                                  ? "IMEI non renseigné"
                                  : "IMEI not provided"}
                            </div>
                          </div>
                        </div>
                        <StatusBadge
                          status={coverage.status}
                          label={
                            statusLabels[coverage.status] || coverage.status
                          }
                        />
                      </div>

                      {coverage.status === "pending_activation" && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          {imeiFormDevice === d.id ? (
                            <div className="space-y-3">
                              <p className="text-sm font-medium text-amber-800">
                                {lang === "fr"
                                  ? "Entrez votre numéro IMEI"
                                  : "Enter your IMEI number"}
                              </p>
                              <p className="text-xs text-amber-700">
                                {lang === "fr"
                                  ? "Le paiement est confirmé. Ajoutez maintenant l'IMEI pour finaliser l'activation."
                                  : "Payment is confirmed. Add the IMEI now to finish activation."}
                              </p>
                              <p className="text-xs text-amber-700/90">
                                {imeiHelpText}
                              </p>
                              <div className="flex gap-2">
                                <Input
                                  value={imeiValue}
                                  onChange={(e) =>
                                    setImeiValue(
                                      e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 15),
                                    )
                                  }
                                  placeholder="357841092648301"
                                  className="font-mono text-sm tracking-wider"
                                />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleImeiSubmit(d.id)}
                                  disabled={imeiValue.length < 10}
                                  loading={updateDevice.isPending}
                                >
                                  {lang === "fr" ? "Valider" : "Submit"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setImeiFormDevice(null);
                                    setImeiValue("");
                                  }}
                                >
                                  {lang === "fr" ? "Annuler" : "Cancel"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-amber-800">
                                  {lang === "fr"
                                    ? "Activation en attente"
                                    : "Activation pending"}
                                </p>
                                <p className="mt-0.5 text-xs text-amber-700">
                                  {lang === "fr"
                                    ? "Le paiement est confirmé, mais l'IMEI est encore requis pour finaliser la protection."
                                    : "Payment is confirmed, but the IMEI is still required to finish protection."}
                                </p>
                                <p className="mt-1 text-xs text-amber-700/90">
                                  {imeiHelpText}
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

                      {coverage.status === "awaiting_payment" &&
                        coverage.payment && (
                          <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div>
                              <p className="text-sm font-medium text-amber-800">
                                {lang === "fr"
                                  ? "Paiement en attente"
                                  : "Payment pending"}
                              </p>
                              <p className="mt-0.5 text-xs text-amber-700">
                                {lang === "fr"
                                  ? "Cet appareil n'est pas encore protégé. Reprenez le checkout pour terminer le paiement."
                                  : "This device is not protected yet. Resume checkout to complete payment."}
                              </p>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                handleResumeCheckout(coverage.payment!.id)
                              }
                              loading={resumePayment.isPending}
                            >
                              {lang === "fr"
                                ? "Continuer le paiement"
                                : "Continue payment"}
                            </Button>
                          </div>
                        )}

                      {canResume &&
                        coverage.status !== "awaiting_payment" &&
                        coverage.payment && (
                          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {lang === "fr"
                                  ? "Paiement à reprendre"
                                  : "Payment can be resumed"}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {lang === "fr"
                                  ? "Le précédent checkout n'a pas abouti. Vous pouvez relancer un paiement proprement."
                                  : "The previous checkout did not finish. You can start a fresh payment safely."}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleResumeCheckout(coverage.payment!.id)
                              }
                              loading={resumePayment.isPending}
                            >
                              {lang === "fr" ? "Reprendre" : "Resume"}
                            </Button>
                          </div>
                        )}

                      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                        <StatusBadge
                          status={coverage.status}
                          label={
                            statusLabels[coverage.status] || coverage.status
                          }
                        />
                        {coverage.status === "active" && (
                          <div className="ml-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setTab("claims");
                                setClaimView("new");
                                setClaimDeviceId(d.id);
                              }}
                              className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline"
                            >
                              {lang === "fr"
                                ? "Déclarer un sinistre"
                                : "File a claim"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* -- PAYMENTS TAB -- */}
        {tab === "payments" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-indigo-950">
                {t.dashboard.tabPayments}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {lang === "fr"
                  ? "Historique complet de vos paiements mensuels."
                  : "Full history of your monthly payments."}
              </p>
            </div>

            {paymentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : !payments || payments.length === 0 ? (
              <EmptyState
                icon={<CreditCardIcon size={28} />}
                title={t.dashboard.noPayments}
                description={t.dashboard.noPaymentsDesc}
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {[
                          lang === "fr" ? "Montant" : "Amount",
                          lang === "fr"
                            ? "Prestataire / méthode"
                            : "Provider / method",
                          lang === "fr" ? "Statut" : "Status",
                          "Date",
                          lang === "fr" ? "Action" : "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30"
                        >
                          <td className="px-5 py-4 font-medium text-emerald-600">
                            {formatXOF(p.amount_xof)}
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {getPaymentDisplayLabel(p)}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                p.status === "completed"
                                  ? "completed"
                                  : p.status
                              }
                              label={statusLabels[p.status] || p.status}
                            />
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                            {p.paid_at
                              ? new Date(p.paid_at).toLocaleDateString(
                                  lang === "fr" ? "fr-FR" : "en-US",
                                )
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            {[
                              "pending",
                              "failed",
                              "cancelled",
                              "expired",
                            ].includes(p.status) ? (
                              <Button
                                variant={
                                  p.status === "pending" ? "primary" : "outline"
                                }
                                size="sm"
                                onClick={() => handleResumeCheckout(p.id)}
                                loading={resumePayment.isPending}
                              >
                                {p.status === "pending"
                                  ? lang === "fr"
                                    ? "Continuer"
                                    : "Continue"
                                  : lang === "fr"
                                    ? "Réessayer"
                                    : "Retry"}
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
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
