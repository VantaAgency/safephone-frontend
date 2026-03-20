"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RouteGuardLoader } from "@/components/auth/route-guard-loader";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-field";
import { CreditCardIcon, ShieldCheckIcon, UsersIcon, WrenchIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  useAcceptRepairRequest,
  useAdminClaims,
  useAdminRepairRequests,
  useUpdateClaimStatus,
  useUpdateRepairRequestAmount,
  useUpdateRepairRequestStatus,
  useAdminStats,
  useAdminCustomers,
  useAdminPayments,
  useAdminPartners,
  useAdminPartnerCommissions,
  useAdminPartnerApplications,
  useRejectRepairRequest,
  useReviewPartnerApplication,
} from "@/lib/api/hooks";
import { formatXOF } from "@/lib/data";
import { useAuth } from "@/lib/auth/auth-provider";
import { useLanguage } from "@/lib/language-context";
import {
  ADMIN_REPAIR_TRANSITIONS,
  formatRepairDeviceLabel,
  formatRepairPreferredSlot,
  formatRepairScheduledSlot,
  getRepairServiceLabel,
  getRepairStatusLabel,
  getRepairTypeLabel,
} from "@/lib/repairs";
import { cn } from "@/lib/utils";
import type { ClaimStatus, RepairRequest, RepairRequestStatus } from "@/lib/api/types";

const ADMIN_TABS = ["overview", "claims", "repairs", "customers", "payments", "applications", "partners"] as const;
type AdminTab = (typeof ADMIN_TABS)[number];

const STATUS_TRANSITIONS: Record<string, ClaimStatus[]> = {
  pending: ["review"],
  review: ["approved", "rejected"],
  approved: ["settled"],
};

const PAYMENT_PROVIDER_DISPLAY: Record<string, { label: string; color: string }> = {
  dexpay: { label: "DEXPAY", color: "#0066FF" },
};

export default function AdminPage() {
  const { lang } = useLanguage();
  const { user, isPending } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";
  const { data: adminClaims, isLoading: claimsLoading } = useAdminClaims(undefined, { enabled: isAdmin });
  const { data: adminRepairs = [], isLoading: repairsLoading } = useAdminRepairRequests(
    { search },
    { enabled: isAdmin },
  );
  const updateClaimStatus = useUpdateClaimStatus();
  const acceptRepair = useAcceptRepairRequest();
  const rejectRepair = useRejectRepairRequest();
  const updateRepairStatus = useUpdateRepairRequestStatus();
  const updateRepairAmount = useUpdateRepairRequestAmount();
  const { data: stats, isLoading: statsLoading } = useAdminStats({ enabled: isAdmin });
  const { data: customers, isLoading: customersLoading } = useAdminCustomers(search, { enabled: isAdmin });
  const { data: adminPayments, isLoading: paymentsLoading } = useAdminPayments({ enabled: isAdmin });
  const { data: adminPartners = [], isLoading: partnersLoading } = useAdminPartners({ enabled: isAdmin });
  const { data: partnerApps = [], isLoading: appsLoading } = useAdminPartnerApplications(undefined, { enabled: isAdmin });
  const reviewApplication = useReviewPartnerApplication();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [commissionDrafts, setCommissionDrafts] = useState<Record<string, string>>({});
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [repairStatusDrafts, setRepairStatusDrafts] = useState<Record<string, RepairRequestStatus>>({});
  const [repairAmountDrafts, setRepairAmountDrafts] = useState<Record<string, string>>({});
  const [repairDateDrafts, setRepairDateDrafts] = useState<Record<string, string>>({});
  const [repairTimeDrafts, setRepairTimeDrafts] = useState<Record<string, string>>({});
  const selectedPartner = adminPartners.find((partner) => partner.id === selectedPartnerId) ?? null;
  const { data: selectedPartnerCommissions = [], isLoading: partnerCommissionsLoading } = useAdminPartnerCommissions(
    selectedPartnerId ?? undefined,
    { enabled: isAdmin && !!selectedPartnerId },
  );

  useEffect(() => {
    if (!isPending && !isAdmin) {
      router.replace("/acces-refuse?required=admin&from=%2Fadmin");
    }
  }, [isAdmin, isPending, router]);

  if (isPending || !isAdmin) {
    return <RouteGuardLoader />;
  }

  const tabLabels: Record<AdminTab, string> = {
    overview: lang === "fr" ? "Vue d'ensemble" : "Overview",
    claims: lang === "fr" ? "Sinistres" : "Claims",
    repairs: lang === "fr" ? "Réparations" : "Repairs",
    customers: lang === "fr" ? "Clients" : "Customers",
    payments: lang === "fr" ? "Paiements" : "Payments",
    applications: lang === "fr" ? "Candidatures" : "Applications",
    partners: lang === "fr" ? "Partenaires" : "Partners",
  };

  const statusLabels: Record<string, string> = {
    pending: lang === "fr" ? "En attente" : "Pending",
    accepted: lang === "fr" ? "Acceptée" : "Accepted",
    review: lang === "fr" ? "En traitement" : "In progress",
    approved: lang === "fr" ? "Approuve" : "Approved",
    rejected: lang === "fr" ? "Rejete" : "Rejected",
    scheduled: lang === "fr" ? "Planifiée" : "Scheduled",
    in_progress: lang === "fr" ? "En cours" : "In progress",
    settled: lang === "fr" ? "Traite" : "Settled",
    completed: lang === "fr" ? "Paye" : "Paid",
    failed: lang === "fr" ? "Échoué" : "Failed",
    cancelled: lang === "fr" ? "Annulé" : "Cancelled",
    expired: lang === "fr" ? "Expiré" : "Expired",
    refunded: lang === "fr" ? "Remboursé" : "Refunded",
    active: lang === "fr" ? "Actif" : "Active",
  };

  const paymentMethodLabels: Record<string, string> = {
    wave: "Wave",
    orange_money: "Orange Money",
    free_money: "Free Money",
    card: lang === "fr" ? "Carte bancaire" : "Bank card",
  };

  const revenueByProviderEntries = Object.entries(stats?.revenue_by_provider ?? {});
  const providerCards: Array<[string, number]> =
    revenueByProviderEntries.length > 0 ? revenueByProviderEntries : [["dexpay", 0]];

  const getProviderDisplay = (provider?: string) => {
    if (!provider) {
      return { label: "—", color: "#64748B" };
    }
    return PAYMENT_PROVIDER_DISPLAY[provider] ?? {
      label: provider.toUpperCase(),
      color: "#64748B",
    };
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return null;
    return paymentMethodLabels[method] ?? method;
  };

  const parseCommissionPercentage = (value: string) => {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) return null;

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100) {
      return null;
    }

    const rounded = Math.round(parsed * 100) / 100;
    if (Math.abs(parsed - rounded) > 1e-9) {
      return null;
    }

    return rounded;
  };

  const CLAIM_TYPE_LABELS: Record<string, string> = {
    screen: lang === "fr" ? "Ecran casse" : "Cracked screen",
    water: lang === "fr" ? "Degats des eaux" : "Water damage",
    theft: lang === "fr" ? "Vol / perte" : "Theft / loss",
    breakdown: lang === "fr" ? "Panne" : "Breakdown",
  };

  const handleStatusChange = async (claimId: string, newStatus: ClaimStatus) => {
    try {
      await updateClaimStatus.mutateAsync({
        id: claimId,
        data: { status: newStatus as "review" | "approved" | "rejected" | "settled" },
      });
    } catch (err) {
      console.error("Failed to update claim status:", err);
    }
  };

  const getRepairDraftStatus = (repair: RepairRequest): RepairRequestStatus =>
    repairStatusDrafts[repair.id] ?? repair.status;

  const getRepairDraftAmount = (repair: RepairRequest): string =>
    repairAmountDrafts[repair.id] ?? String(repair.repair_amount_xof ?? "");

  const handleRepairAmountSave = async (repair: RepairRequest) => {
    const amountValue = getRepairDraftAmount(repair).trim();
    if (amountValue === "") return;

    try {
      await updateRepairAmount.mutateAsync({
        id: repair.id,
        data: { repair_amount_xof: Number(amountValue) },
      });
    } catch (err) {
      console.error("Failed to update repair amount:", err);
    }
  };

  const handleRepairStatusSave = async (repair: RepairRequest) => {
    const nextStatus = getRepairDraftStatus(repair);
    if (!nextStatus || nextStatus === repair.status) return;
    if (nextStatus === "pending") return;

    try {
      if (nextStatus === "accepted") {
        await acceptRepair.mutateAsync(repair.id);
        return;
      }
      if (nextStatus === "rejected") {
        await rejectRepair.mutateAsync(repair.id);
        return;
      }

      const statusForUpdate: Exclude<
        RepairRequestStatus,
        "pending" | "accepted" | "rejected"
      > = nextStatus;

      await updateRepairStatus.mutateAsync({
        id: repair.id,
        data: {
          status: statusForUpdate,
          scheduled_date:
            statusForUpdate === "scheduled"
              ? repairDateDrafts[repair.id] || repair.scheduled_date
              : undefined,
          scheduled_time:
            statusForUpdate === "scheduled"
              ? repairTimeDrafts[repair.id] || repair.scheduled_time
              : undefined,
        },
      });
    } catch (err) {
      console.error("Failed to update repair status:", err);
    }
  };

  return (
    <div className="bg-slate-50 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">Admin</span>
          <h1 className="text-2xl font-medium tracking-tight text-indigo-950 md:text-3xl">
            SafePhone Administration
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1">
          {ADMIN_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-shrink-0 cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                tab === t
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950"
              )}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                <>
                  <StatCard
                    label={lang === "fr" ? "Abonnes actifs" : "Active subscribers"}
                    value={stats ? stats.active_subscribers.toLocaleString("fr-FR") : "—"}
                    icon={<UsersIcon size={20} className="text-indigo-600" />}
                  />
                  <StatCard
                    label={lang === "fr" ? "Revenu mensuel" : "Monthly revenue"}
                    value={stats ? formatXOF(stats.monthly_revenue_xof) : "—"}
                    icon={<CreditCardIcon size={20} className="text-emerald-500" />}
                  />
                  <StatCard
                    label={lang === "fr" ? "Sinistres ouverts" : "Open claims"}
                    value={stats ? String(stats.open_claims) : "—"}
                    icon={<ShieldCheckIcon size={20} className="text-yellow-500" />}
                  />
                  <StatCard
                    label={lang === "fr" ? "Total clients" : "Total clients"}
                    value={stats ? String(stats.total_customers) : "—"}
                    icon={<WrenchIcon size={20} className="text-slate-500" />}
                  />
                </>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-400">
                  {lang === "fr" ? "Revenu par prestataire" : "Revenue by provider"}
                </h3>
                {statsLoading ? (
                  <div className="grid grid-cols-1 gap-3">
                    {Array.from({ length: 1 }).map((_, i) => <CardSkeleton key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {providerCards.map(([provider, amount]) => {
                      const display = getProviderDisplay(provider);
                      return (
                        <div key={provider} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: display.color }} />
                            <span className="text-xs font-medium text-slate-500">{display.label}</span>
                          </div>
                          <div className="mt-2 text-lg font-medium text-indigo-950">
                            {amount.toLocaleString("fr-FR")}
                          </div>
                          <div className="text-xs text-slate-400">XOF</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-400">
                  {lang === "fr" ? "Sinistres recents" : "Recent claims"}
                </h3>
                {claimsLoading ? (
                  <div className="space-y-2.5">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
                ) : (
                  <div className="space-y-2.5">
                    {(adminClaims ?? []).slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                        <div>
                          <div className="text-sm font-medium text-indigo-950">
                            {CLAIM_TYPE_LABELS[c.claim_type] || c.claim_type}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {new Date(c.filed_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                          </div>
                        </div>
                        <StatusBadge status={c.status} label={statusLabels[c.status] || c.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Claims Tab -- Real API */}
        {tab === "claims" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-indigo-950">{lang === "fr" ? "Gestion des sinistres" : "Claims management"}</h2>
              <Input placeholder={lang === "fr" ? "Rechercher..." : "Search..."} className="w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {claimsLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : (
              <div className="space-y-3">
                {(adminClaims ?? []).map((c) => {
                  const nextStatuses = STATUS_TRANSITIONS[c.status] ?? [];
                  return (
                    <div key={c.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-indigo-950">{CLAIM_TYPE_LABELS[c.claim_type] || c.claim_type}</div>
                          <div className="mt-0.5 text-sm text-slate-500">
                            {c.id.slice(0, 8)} &middot; {new Date(c.filed_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                          </div>
                          {c.description && (
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">{c.description}</p>
                          )}
                          {c.amount_xof && (
                            <p className="mt-1 text-sm font-medium text-emerald-600">{formatXOF(c.amount_xof)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={c.status} label={statusLabels[c.status] || c.status} />
                        </div>
                      </div>
                      {nextStatuses.length > 0 && (
                        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                          {nextStatuses.map((s) => (
                            <Button
                              key={s}
                              variant={s === "approved" || s === "settled" ? "primary" : s === "rejected" ? "danger" : "outline"}
                              size="sm"
                              onClick={() => handleStatusChange(c.id, s)}
                              loading={updateClaimStatus.isPending}
                            >
                              {statusLabels[s] || s}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "repairs" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-indigo-950">
                {lang === "fr" ? "Demandes MobiTech" : "MobiTech requests"}
              </h2>
              <Input
                placeholder={
                  lang === "fr"
                    ? "Référence, client, téléphone..."
                    : "Reference, customer, phone..."
                }
                className="w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {repairsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : adminRepairs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-400 shadow-sm">
                {lang === "fr"
                  ? "Aucune demande de réparation trouvée."
                  : "No repair requests found."}
              </div>
            ) : (
              <div className="space-y-4">
                {adminRepairs.map((repair) => {
                  const nextStatuses = ADMIN_REPAIR_TRANSITIONS[repair.status] ?? [];
                  const draftStatus = getRepairDraftStatus(repair);
                  const scheduledSlot = formatRepairScheduledSlot(repair);

                  return (
                    <div
                      key={repair.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-medium text-indigo-950">
                              {repair.reference}
                            </div>
                            <StatusBadge
                              status={repair.status}
                              label={getRepairStatusLabel(repair.status, lang)}
                            />
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {repair.customer_name} • {repair.customer_phone}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {formatRepairDeviceLabel(repair, lang)} •{" "}
                            {getRepairTypeLabel(repair.repair_type, lang)}
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(repair.created_at).toLocaleDateString(
                            lang === "fr" ? "fr-FR" : "en-US",
                          )}
                        </div>
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
                            {lang === "fr" ? "Créneau planifié" : "Scheduled slot"}
                          </div>
                          <div className="mt-1 text-sm font-medium text-indigo-950">
                            {scheduledSlot || (lang === "fr" ? "Non planifié" : "Not scheduled")}
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {lang === "fr" ? "Source" : "Source"}
                          </div>
                          <div className="mt-1 text-sm font-medium text-indigo-950">
                            {repair.request_source === "safephone_user"
                              ? lang === "fr"
                                ? "Utilisateur SafePhone"
                                : "SafePhone user"
                              : lang === "fr"
                                ? "Visiteur public"
                                : "Public visitor"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                          <div className="mb-3 text-sm font-medium text-indigo-950">
                            {lang === "fr" ? "Gestion du statut" : "Status management"}
                          </div>

                          {repair.status === "pending" ? (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                loading={acceptRepair.isPending}
                                onClick={() => acceptRepair.mutateAsync(repair.id)}
                              >
                                {lang === "fr" ? "Accepter" : "Accept"}
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                loading={rejectRepair.isPending}
                                onClick={() => rejectRepair.mutateAsync(repair.id)}
                              >
                                {lang === "fr" ? "Refuser" : "Reject"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                loading={updateRepairStatus.isPending}
                                onClick={() =>
                                  updateRepairStatus.mutateAsync({
                                    id: repair.id,
                                    data: { status: "cancelled" },
                                  })
                                }
                              >
                                {lang === "fr" ? "Annuler" : "Cancel"}
                              </Button>
                            </div>
                          ) : nextStatuses.length > 0 ? (
                            <div className="space-y-3">
                              <Select
                                value={draftStatus}
                                onChange={(e) =>
                                  setRepairStatusDrafts((current) => ({
                                    ...current,
                                    [repair.id]: e.target.value as RepairRequestStatus,
                                  }))
                                }
                              >
                                <option value={repair.status}>
                                  {getRepairStatusLabel(repair.status, lang)}
                                </option>
                                {nextStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {getRepairStatusLabel(status, lang)}
                                  </option>
                                ))}
                              </Select>

                              {draftStatus === "scheduled" && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <Input
                                    type="date"
                                    value={repairDateDrafts[repair.id] ?? repair.scheduled_date ?? ""}
                                    onChange={(e) =>
                                      setRepairDateDrafts((current) => ({
                                        ...current,
                                        [repair.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <Input
                                    type="time"
                                    value={repairTimeDrafts[repair.id] ?? repair.scheduled_time ?? ""}
                                    onChange={(e) =>
                                      setRepairTimeDrafts((current) => ({
                                        ...current,
                                        [repair.id]: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              )}

                              <Button
                                variant="secondary"
                                size="sm"
                                loading={updateRepairStatus.isPending}
                                onClick={() => handleRepairStatusSave(repair)}
                                disabled={draftStatus === repair.status}
                              >
                                {lang === "fr" ? "Mettre à jour" : "Update"}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              {lang === "fr"
                                ? "Cette demande est dans un état final."
                                : "This request is in a final state."}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                          <div className="mb-3 text-sm font-medium text-indigo-950">
                            {lang === "fr" ? "Devis réparation" : "Repair quote"}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min={0}
                              value={getRepairDraftAmount(repair)}
                              onChange={(e) =>
                                setRepairAmountDrafts((current) => ({
                                  ...current,
                                  [repair.id]: e.target.value,
                                }))
                              }
                              placeholder="25000"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              loading={updateRepairAmount.isPending}
                              onClick={() => handleRepairAmountSave(repair)}
                            >
                              {lang === "fr" ? "Enregistrer" : "Save"}
                            </Button>
                          </div>
                          <p className="mt-3 text-xs text-slate-500">
                            {repair.repair_amount_xof
                              ? `${formatXOF(repair.repair_amount_xof)}`
                              : lang === "fr"
                                ? "Aucun montant défini pour le moment."
                                : "No amount set yet."}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Customers Tab -- Real API */}
        {tab === "customers" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-indigo-950">{lang === "fr" ? "Gestion des clients" : "Customer management"}</h2>
              <Input placeholder={lang === "fr" ? "Rechercher..." : "Search..."} className="w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {customersLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {[lang === "fr" ? "Client" : "Customer", "Phone", "Email", lang === "fr" ? "Forfait" : "Plan", lang === "fr" ? "Appareils" : "Devices", lang === "fr" ? "Statut" : "Status"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(customers ?? []).map((c) => (
                        <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                          <td className="px-5 py-3.5 font-medium text-indigo-950">{c.full_name}</td>
                          <td className="px-5 py-3.5 text-slate-500">{c.phone || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-400 text-xs">{c.email}</td>
                          <td className="px-5 py-3.5">
                            {(lang === "fr" ? c.plan_name_fr : c.plan_name_en)
                              ? <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-medium text-yellow-600">{lang === "fr" ? c.plan_name_fr : c.plan_name_en}</span>
                              : <span className="text-slate-400 text-xs">—</span>
                            }
                          </td>
                          <td className="px-5 py-3.5 text-center text-slate-500">{c.device_count}</td>
                          <td className="px-5 py-3.5">
                            <StatusBadge
                              status={c.subscription_status === "active" ? "active" : "pending"}
                              label={c.subscription_status ? (statusLabels[c.subscription_status] || c.subscription_status) : "—"}
                            />
                          </td>
                        </tr>
                      ))}
                      {(customers ?? []).length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">
                            {lang === "fr" ? "Aucun client trouvé" : "No customers found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab -- Real API */}
        {tab === "payments" && (
          <div>
            <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-medium text-indigo-950">{lang === "fr" ? "Paiements & Reconciliation" : "Payments & Reconciliation"}</h2>
              <Button variant="outline" size="sm">{lang === "fr" ? "Export CSV" : "Export CSV"}</Button>
            </div>

            {!paymentsLoading && stats && (
              <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {providerCards.map(([provider, amount]) => {
                  const display = getProviderDisplay(provider);
                  return (
                    <div key={provider} className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-sm">
                      <div className="text-xs font-medium text-slate-500">{display.label}</div>
                      <div className="mt-1 text-lg font-medium" style={{ color: display.color }}>
                        {amount.toLocaleString("fr-FR")}
                      </div>
                      <div className="text-[10px] text-slate-400">XOF</div>
                    </div>
                  );
                })}
              </div>
            )}

            {paymentsLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {[
                          "ID",
                          "Client",
                          lang === "fr" ? "Forfait" : "Plan",
                          lang === "fr" ? "Montant" : "Amount",
                          lang === "fr" ? "Prestataire" : "Provider",
                          lang === "fr" ? "Méthode finale" : "Final method",
                          lang === "fr" ? "Statut" : "Status",
                          "Date",
                        ].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(adminPayments ?? []).map((p) => {
                        const providerDisplay = getProviderDisplay(p.provider);
                        const paymentMethodLabel = getPaymentMethodLabel(p.payment_method);
                        const planName = lang === "fr" ? p.plan_name_fr : p.plan_name_en;
                        return (
                          <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.id.slice(0, 8)}</td>
                            <td className="px-5 py-3.5 font-medium text-indigo-950">{p.customer_name}</td>
                            <td className="px-5 py-3.5 text-slate-500">{planName || "—"}</td>
                            <td className="px-5 py-3.5 font-medium text-emerald-600">{p.amount_xof.toLocaleString("fr-FR")} XOF</td>
                            <td className="px-5 py-3.5">
                              <span className="rounded-md px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: providerDisplay.color }}>
                                {providerDisplay.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">{paymentMethodLabel || "—"}</td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={p.status as "completed" | "pending" | "failed" | "cancelled" | "expired" | "refunded"} label={statusLabels[p.status] || p.status} />
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                              {new Date(p.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                            </td>
                          </tr>
                        );
                      })}
                      {(adminPayments ?? []).length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-400">
                            {lang === "fr" ? "Aucun paiement trouvé" : "No payments found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {tab === "applications" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-indigo-950">
                {lang === "fr" ? "Candidatures partenaires" : "Partner applications"}
              </h2>
            </div>
            {appsLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {[
                          lang === "fr" ? "Boutique" : "Store",
                          lang === "fr" ? "Candidat" : "Applicant",
                          "Phone",
                          "Email",
                          lang === "fr" ? "Ville" : "City",
                          lang === "fr" ? "Zone" : "Business area",
                          lang === "fr" ? "Commission %" : "Commission %",
                          lang === "fr" ? "Statut" : "Status",
                          "Date",
                          "Actions",
                        ].map((h) => (
                          <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {partnerApps.map((app) => (
                        <tr key={app.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                          <td className="px-5 py-3.5 font-medium text-indigo-950">{app.store_name}</td>
                          <td className="px-5 py-3.5 text-slate-600">{app.full_name}</td>
                          <td className="px-5 py-3.5 text-slate-500">{app.phone}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-400">{app.email}</td>
                          <td className="px-5 py-3.5 text-slate-500">{app.city}</td>
                          <td className="px-5 py-3.5 text-slate-500">{app.business_location}</td>
                          <td className="px-5 py-3.5">
                            {app.status === "pending" ? (
                              <div className="space-y-2">
                                <Input
                                  type="number"
                                  min="0.01"
                                  max="100"
                                  step="0.01"
                                  value={commissionDrafts[app.id] ?? ""}
                                  onChange={(e) =>
                                    setCommissionDrafts((current) => ({
                                      ...current,
                                      [app.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="10"
                                  className="w-28 text-xs"
                                />
                                <p className="text-[11px] text-slate-400">
                                  {lang === "fr" ? "0,01 à 100" : "0.01 to 100"}
                                </p>
                              </div>
                            ) : app.commission_percentage ? (
                              <span className="font-medium text-indigo-950">
                                {app.commission_percentage}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge
                              status={app.status === "approved" ? "active" : app.status === "rejected" ? "expired" : "pending"}
                              label={statusLabels[app.status] || app.status}
                            />
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                            {new Date(app.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                          </td>
                          <td className="px-5 py-3.5">
                            {app.status === "pending" && (
                              <div className="flex gap-2">
                                {rejectingId === app.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder={lang === "fr" ? "Raison (optionnel)" : "Reason (optional)"}
                                      className="w-40 text-xs"
                                    />
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      loading={reviewApplication.isPending}
                                      onClick={async () => {
                                        await reviewApplication.mutateAsync({
                                          id: app.id,
                                          data: {
                                            decision: "rejected",
                                            rejection_reason: rejectionReason || undefined,
                                          },
                                        });
                                        setRejectingId(null);
                                        setRejectionReason("");
                                      }}
                                    >
                                      {lang === "fr" ? "Confirmer" : "Confirm"}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                                    >
                                      {lang === "fr" ? "Annuler" : "Cancel"}
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      loading={reviewApplication.isPending}
                                      disabled={parseCommissionPercentage(commissionDrafts[app.id] ?? "") === null}
                                      onClick={async () => {
                                        await reviewApplication.mutateAsync({
                                          id: app.id,
                                          data: {
                                            decision: "approved",
                                            commission_percentage: parseCommissionPercentage(commissionDrafts[app.id] ?? "") ?? undefined,
                                          },
                                        });
                                        setCommissionDrafts((current) => {
                                          const next = { ...current };
                                          delete next[app.id];
                                          return next;
                                        });
                                      }}
                                    >
                                      {lang === "fr" ? "Approuver" : "Approve"}
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => setRejectingId(app.id)}
                                    >
                                      {lang === "fr" ? "Refuser" : "Reject"}
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                            {app.status === "rejected" && app.rejection_reason && (
                              <span className="text-xs text-slate-400" title={app.rejection_reason}>
                                {app.rejection_reason.length > 30
                                  ? app.rejection_reason.slice(0, 30) + "..."
                                  : app.rejection_reason}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {partnerApps.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-5 py-8 text-center text-sm text-slate-400">
                            {lang === "fr" ? "Aucune candidature" : "No applications"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Partners Tab */}
        {tab === "partners" && (
          <div>
            {partnersLoading ? (
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                  label={lang === "fr" ? "Partenaires actifs" : "Active partners"}
                  value={String(adminPartners.filter((p) => p.status === "active").length)}
                  icon={<UsersIcon size={20} className="text-indigo-600" />}
                />
                <StatCard
                  label={lang === "fr" ? "Clients impliques" : "Clients involved"}
                  value={String(adminPartners.reduce((s, p) => s + p.clients_count, 0))}
                  icon={<ShieldCheckIcon size={20} className="text-violet-600" />}
                />
                <StatCard
                  label={lang === "fr" ? "Commissions gagnées" : "Commissions earned"}
                  value={formatXOF(adminPartners.reduce((s, p) => s + p.total_commission_earned_xof, 0))}
                  icon={<WrenchIcon size={20} className="text-yellow-500" />}
                />
                <StatCard
                  label={lang === "fr" ? "Commissions dues" : "Commissions owed"}
                  value={formatXOF(adminPartners.reduce((s, p) => s + p.total_commission_owed_xof, 0))}
                  icon={<CreditCardIcon size={20} className="text-emerald-500" />}
                />
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              {partnersLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : adminPartners.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-500">
                  {lang === "fr" ? "Aucun partenaire enregistre" : "No partners registered"}
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {[
                        lang === "fr" ? "Boutique / Proprietaire" : "Store / Owner",
                        lang === "fr" ? "Ville / Zone" : "City / Area",
                        lang === "fr" ? "Commission %" : "Commission %",
                        lang === "fr" ? "Clients" : "Clients",
                        lang === "fr" ? "Actifs" : "Active",
                        lang === "fr" ? "Gagné" : "Earned",
                        lang === "fr" ? "Dû" : "Owed",
                        lang === "fr" ? "Statut" : "Status",
                        lang === "fr" ? "Détails" : "Details",
                      ].map((h) => (
                        <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminPartners.map((partner) => {
                      return (
                        <tr key={partner.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-indigo-950">{partner.store_name}</div>
                            <div className="text-xs text-slate-400">{partner.owner_name}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-slate-500">{partner.city}</div>
                            <div className="text-xs text-slate-400">{partner.business_location}</div>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-indigo-950">{partner.commission_percentage}%</td>
                          <td className="px-5 py-3.5 text-center font-medium text-indigo-950">{partner.clients_count}</td>
                          <td className="px-5 py-3.5 text-center font-medium text-emerald-600">{partner.active_clients}</td>
                          <td className="px-5 py-3.5 font-medium text-indigo-950">
                            {partner.total_commission_earned_xof > 0 ? formatXOF(partner.total_commission_earned_xof) : "—"}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-600">
                            {partner.total_commission_owed_xof > 0 ? formatXOF(partner.total_commission_owed_xof) : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge
                              status={partner.status === "active" ? "active" : "expired"}
                              label={partner.status === "active" ? (lang === "fr" ? "Actif" : "Active") : (lang === "fr" ? "Inactif" : "Inactive")}
                            />
                          </td>
                          <td className="px-5 py-3.5">
                            <Button
                              variant={selectedPartnerId === partner.id ? "secondary" : "outline"}
                              size="sm"
                              onClick={() =>
                                setSelectedPartnerId((current) =>
                                  current === partner.id ? null : partner.id,
                                )
                              }
                            >
                              {selectedPartnerId === partner.id
                                ? lang === "fr"
                                  ? "Masquer"
                                  : "Hide"
                                : lang === "fr"
                                  ? "Voir"
                                  : "View"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </div>

            {selectedPartner && (
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-indigo-950">
                      {selectedPartner.store_name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedPartner.owner_name} · {selectedPartner.city} · {selectedPartner.business_location}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {lang === "fr"
                        ? "Commissions d'acquisition uniques"
                        : "One-time acquisition commissions"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {lang === "fr" ? "Commission %" : "Commission %"}
                      </p>
                      <p className="mt-2 text-lg font-medium text-indigo-950">
                        {selectedPartner.commission_percentage}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {lang === "fr" ? "Gagné" : "Earned"}
                      </p>
                      <p className="mt-2 text-lg font-medium text-indigo-950">
                        {formatXOF(selectedPartner.total_commission_earned_xof)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {lang === "fr" ? "Payé" : "Paid"}
                      </p>
                      <p className="mt-2 text-lg font-medium text-indigo-950">
                        {formatXOF(selectedPartner.total_commission_paid_xof)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80">
                  {partnerCommissionsLoading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                      ))}
                    </div>
                  ) : selectedPartnerCommissions.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-500">
                      {lang === "fr"
                        ? "Aucune commission générée pour ce partenaire."
                        : "No commissions have been generated for this partner yet."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            {[
                              lang === "fr" ? "Client" : "Client",
                              lang === "fr" ? "Formule" : "Plan",
                              lang === "fr" ? "Base" : "Base",
                              lang === "fr" ? "Commission" : "Commission",
                              lang === "fr" ? "Statut" : "Status",
                              lang === "fr" ? "Date" : "Date",
                            ].map((heading) => (
                              <th
                                key={heading}
                                className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPartnerCommissions.map((commission) => (
                            <tr key={commission.id} className="border-b border-slate-50 last:border-0">
                              <td className="px-5 py-3.5 font-medium text-indigo-950">
                                {commission.customer_name}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500">
                                {lang === "fr" ? commission.plan_name_fr ?? "—" : commission.plan_name_en ?? "—"}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500">
                                {formatXOF(commission.base_amount_xof)}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="font-medium text-indigo-950">
                                  {formatXOF(commission.commission_amount_xof)}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {commission.commission_percentage}%
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <StatusBadge
                                  status={commission.status === "paid" ? "active" : "pending"}
                                  label={commission.status === "paid"
                                    ? (lang === "fr" ? "Payée" : "Paid")
                                    : (lang === "fr" ? "En attente" : "Pending")}
                                />
                              </td>
                              <td className="px-5 py-3.5 text-slate-500">
                                {new Date(commission.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
