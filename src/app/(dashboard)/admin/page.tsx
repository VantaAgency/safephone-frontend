"use client";

import { useState } from "react";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-field";
import { CreditCardIcon, ShieldCheckIcon, UsersIcon, WrenchIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  useAdminClaims,
  useUpdateClaimStatus,
  useAdminStats,
  useAdminCustomers,
  useAdminPayments,
  useAdminPartners,
  useAdminPartnerApplications,
  useReviewPartnerApplication,
} from "@/lib/api/hooks";
import { formatXOF } from "@/lib/data";
import { useAuth } from "@/lib/auth/auth-provider";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type { ClaimStatus } from "@/lib/api/types";

const ADMIN_TABS = ["overview", "claims", "customers", "payments", "applications", "partners"] as const;
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
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";
  const { data: adminClaims, isLoading: claimsLoading } = useAdminClaims(undefined, { enabled: isAdmin });
  const updateClaimStatus = useUpdateClaimStatus();
  const { data: stats, isLoading: statsLoading } = useAdminStats({ enabled: isAdmin });
  const { data: customers, isLoading: customersLoading } = useAdminCustomers(search, { enabled: isAdmin });
  const { data: adminPayments, isLoading: paymentsLoading } = useAdminPayments({ enabled: isAdmin });
  const { data: adminPartners = [], isLoading: partnersLoading } = useAdminPartners({ enabled: isAdmin });
  const { data: partnerApps = [], isLoading: appsLoading } = useAdminPartnerApplications(undefined, { enabled: isAdmin });
  const reviewApplication = useReviewPartnerApplication();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!isPending && !isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldCheckIcon size={48} className="text-slate-300" />
        <h1 className="text-xl font-semibold text-slate-800">
          {lang === "fr" ? "Accès refusé" : "Access denied"}
        </h1>
        <p className="text-sm text-slate-500">
          {lang === "fr"
            ? "Vous n'avez pas les droits pour accéder à cette page."
            : "You don't have permission to access this page."}
        </p>
        <a href="/tableau-de-bord" className="text-sm font-medium text-blue-600 hover:underline">
          {lang === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
        </a>
      </div>
    );
  }

  const tabLabels: Record<AdminTab, string> = {
    overview: lang === "fr" ? "Vue d'ensemble" : "Overview",
    claims: lang === "fr" ? "Sinistres" : "Claims",
    customers: lang === "fr" ? "Clients" : "Customers",
    payments: lang === "fr" ? "Paiements" : "Payments",
    applications: lang === "fr" ? "Candidatures" : "Applications",
    partners: lang === "fr" ? "Partenaires" : "Partners",
  };

  const statusLabels: Record<string, string> = {
    pending: lang === "fr" ? "En attente" : "Pending",
    review: lang === "fr" ? "En traitement" : "In progress",
    approved: lang === "fr" ? "Approuve" : "Approved",
    rejected: lang === "fr" ? "Rejete" : "Rejected",
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
                                      onClick={() =>
                                        reviewApplication.mutateAsync({
                                          id: app.id,
                                          data: { decision: "approved" },
                                        })
                                      }
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
                          <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-400">
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
                  label={lang === "fr" ? "Taux de conversion" : "Conversion rate"}
                  value={`${Math.round(
                    (adminPartners.reduce((s, p) => s + p.active_clients, 0) /
                      Math.max(adminPartners.reduce((s, p) => s + p.clients_count, 0), 1)) *
                      100
                  )}%`}
                  icon={<WrenchIcon size={20} className="text-yellow-500" />}
                />
                <StatCard
                  label={lang === "fr" ? "Revenus via partenaires" : "Partner revenue"}
                  value={formatXOF(adminPartners.reduce((s, p) => s + p.commission_this_month, 0))}
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
                        lang === "fr" ? "Ville" : "City",
                        lang === "fr" ? "Clients" : "Clients",
                        lang === "fr" ? "Actifs" : "Active",
                        "Conversion%",
                        lang === "fr" ? "Commission mois" : "Month commission",
                        lang === "fr" ? "Statut" : "Status",
                      ].map((h) => (
                        <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminPartners.map((partner) => {
                      const conversionPct = partner.clients_count > 0 ? Math.round((partner.active_clients / partner.clients_count) * 100) : 0;
                      return (
                        <tr key={partner.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-indigo-950">{partner.store_name}</div>
                            <div className="text-xs text-slate-400">{partner.owner_name}</div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{partner.city}</td>
                          <td className="px-5 py-3.5 text-center font-medium text-indigo-950">{partner.clients_count}</td>
                          <td className="px-5 py-3.5 text-center font-medium text-emerald-600">{partner.active_clients}</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={cn("text-sm font-medium", conversionPct >= 80 ? "text-emerald-600" : conversionPct >= 50 ? "text-yellow-500" : "text-red-500")}>
                              {conversionPct}%
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-indigo-950">
                            {partner.commission_this_month > 0 ? formatXOF(partner.commission_this_month) : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge
                              status={partner.status === "active" ? "active" : "expired"}
                              label={partner.status === "active" ? (lang === "fr" ? "Actif" : "Active") : (lang === "fr" ? "Inactif" : "Inactive")}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
