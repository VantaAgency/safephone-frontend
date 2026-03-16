"use client";

import { useState } from "react";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-field";
import { CreditCardIcon, ShieldCheckIcon, UsersIcon, WrenchIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import { MOCK_ADMIN_PARTNERS } from "@/lib/data";
import { useAdminClaims, useUpdateClaimStatus } from "@/lib/api/hooks";
import { formatXOF } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type { ClaimStatus } from "@/lib/api/types";

const ADMIN_TABS = ["overview", "claims", "customers", "payments", "partners"] as const;
type AdminTab = (typeof ADMIN_TABS)[number];

// Mock data for tabs without backend support
const MOCK_ADMIN_CUSTOMERS = [
  { id: 1, name: "Fatou Diallo", phone: "+221 77 123 45 67", email: "fatou@email.com", plan: "Plus", devices: 1, status: "active" },
  { id: 2, name: "Ibrahima Sow", phone: "+221 76 987 65 43", email: "ibra@email.com", plan: "Ecran+", devices: 2, status: "active" },
  { id: 3, name: "Ousmane Ndiaye", phone: "+221 78 456 78 90", email: null, plan: "Haute", devices: 1, status: "active" },
  { id: 4, name: "Aissatou Ba", phone: "+221 77 111 22 33", email: "aissatou@email.com", plan: "Totale", devices: 3, status: "active" },
];

const MOCK_ADMIN_PAYMENTS = [
  { id: "TXN-001", customer: "Fatou Diallo", plan: "Plus", amount: 6000, method: "Wave", ref: "WV-38F2C", status: "completed", date: "08 Mar 2025" },
  { id: "TXN-002", customer: "Ibrahima Sow", plan: "Ecran+", amount: 3500, method: "Orange Money", ref: "OM-19A4D", status: "completed", date: "07 Mar 2025" },
  { id: "TXN-003", customer: "Ousmane Ndiaye", plan: "Haute", amount: 10000, method: "Wave", ref: "WV-55B1E", status: "completed", date: "06 Mar 2025" },
  { id: "TXN-004", customer: "Aissatou Ba", plan: "Totale", amount: 15000, method: "Free Money", ref: "FM-72D3F", status: "completed", date: "05 Mar 2025" },
];

const STATUS_TRANSITIONS: Record<string, ClaimStatus[]> = {
  pending: ["review"],
  review: ["approved", "rejected"],
  approved: ["settled"],
};

export default function AdminPage() {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");

  const { data: adminClaims, isLoading: claimsLoading } = useAdminClaims();
  const updateClaimStatus = useUpdateClaimStatus();

  const tabLabels: Record<AdminTab, string> = {
    overview: lang === "fr" ? "Vue d'ensemble" : "Overview",
    claims: lang === "fr" ? "Sinistres" : "Claims",
    customers: lang === "fr" ? "Clients" : "Customers",
    payments: lang === "fr" ? "Paiements" : "Payments",
    partners: lang === "fr" ? "Partenaires" : "Partners",
  };

  const statusLabels: Record<string, string> = {
    pending: lang === "fr" ? "En attente" : "Pending",
    review: lang === "fr" ? "En traitement" : "In progress",
    approved: lang === "fr" ? "Approuve" : "Approved",
    rejected: lang === "fr" ? "Rejete" : "Rejected",
    settled: lang === "fr" ? "Traite" : "Settled",
    completed: lang === "fr" ? "Paye" : "Paid",
    active: lang === "fr" ? "Actif" : "Active",
  };

  const methodColors: Record<string, string> = {
    Wave: "bg-[#1B95C8]", "Orange Money": "bg-[#F77F00]", "Free Money": "bg-[#003087]", Stripe: "bg-[#635BFF]",
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
              <StatCard label={lang === "fr" ? "Abonnes actifs" : "Active subscribers"} value="1 247" icon={<UsersIcon size={20} className="text-indigo-600" />} trend="+12%" />
              <StatCard label={lang === "fr" ? "Revenu mensuel" : "Monthly revenue"} value="4.2M XOF" icon={<CreditCardIcon size={20} className="text-emerald-500" />} trend="+8%" />
              <StatCard label={lang === "fr" ? "Sinistres ouverts" : "Open claims"} value={String(adminClaims?.filter((c) => c.status !== "settled" && c.status !== "rejected").length ?? 0)} icon={<ShieldCheckIcon size={20} className="text-yellow-500" />} />
              <StatCard label={lang === "fr" ? "Reparations MobiTech" : "MobiTech repairs"} value="89" icon={<WrenchIcon size={20} className="text-slate-500" />} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-400">
                  {lang === "fr" ? "Revenu par methode" : "Revenue by method"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "Wave", amount: "2 604 000", color: "#1B95C8" },
                    { name: "Orange Money", amount: "882 000", color: "#F77F00" },
                    { name: "Free Money", amount: "378 000", color: "#003087" },
                    { name: "Stripe", amount: "336 000", color: "#635BFF" },
                  ].map((m) => (
                    <div key={m.name} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="text-xs font-medium text-slate-500">{m.name}</span>
                      </div>
                      <div className="mt-2 text-lg font-medium text-indigo-950">{m.amount}</div>
                      <div className="text-xs text-slate-400">XOF</div>
                    </div>
                  ))}
                </div>
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

        {/* Customers Tab -- Mock (no backend endpoint) */}
        {tab === "customers" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-indigo-950">{lang === "fr" ? "Gestion des clients" : "Customer management"}</h2>
              <Input placeholder={lang === "fr" ? "Rechercher..." : "Search..."} className="w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <p className="mb-4 text-xs text-slate-400 italic">
              {lang === "fr" ? "Donnees de demonstration — endpoint backend non disponible." : "Demo data — backend endpoint not available."}
            </p>
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
                    {MOCK_ADMIN_CUSTOMERS.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                        <td className="px-5 py-3.5 font-medium text-indigo-950">{c.name}</td>
                        <td className="px-5 py-3.5 text-slate-500">{c.phone}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{c.email || "—"}</td>
                        <td className="px-5 py-3.5"><span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-medium text-yellow-600">{c.plan}</span></td>
                        <td className="px-5 py-3.5 text-center text-slate-500">{c.devices}</td>
                        <td className="px-5 py-3.5"><StatusBadge status="active" label={statusLabels.active} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab -- Mock (no backend endpoint) */}
        {tab === "payments" && (
          <div>
            <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-medium text-indigo-950">{lang === "fr" ? "Paiements & Reconciliation" : "Payments & Reconciliation"}</h2>
              <Button variant="outline" size="sm">{lang === "fr" ? "Export CSV" : "Export CSV"}</Button>
            </div>
            <p className="mb-4 text-xs text-slate-400 italic">
              {lang === "fr" ? "Donnees de demonstration — endpoint backend non disponible." : "Demo data — backend endpoint not available."}
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { name: "Wave", amount: "2 604 000", color: "#1B95C8" },
                { name: "Orange Money", amount: "882 000", color: "#F77F00" },
                { name: "Free Money", amount: "378 000", color: "#003087" },
                { name: "Stripe", amount: "336 000", color: "#635BFF" },
              ].map((m) => (
                <div key={m.name} className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-sm">
                  <div className="text-xs font-medium text-slate-500">{m.name}</div>
                  <div className="mt-1 text-lg font-medium" style={{ color: m.color }}>{m.amount}</div>
                  <div className="text-[10px] text-slate-400">XOF</div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {["ID", "Client", lang === "fr" ? "Forfait" : "Plan", lang === "fr" ? "Montant" : "Amount", lang === "fr" ? "Methode" : "Method", lang === "fr" ? "Statut" : "Status", "Date"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ADMIN_PAYMENTS.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.id}</td>
                        <td className="px-5 py-3.5 font-medium text-indigo-950">{p.customer}</td>
                        <td className="px-5 py-3.5 text-slate-500">{p.plan}</td>
                        <td className="px-5 py-3.5 font-medium text-emerald-600">{p.amount.toLocaleString()} XOF</td>
                        <td className="px-5 py-3.5">
                          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium text-white", methodColors[p.method] || "bg-slate-500")}>
                            {p.method}
                          </span>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status="completed" label={statusLabels.completed} /></td>
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Partners Tab -- Mock */}
        {tab === "partners" && (
          <div>
            <p className="mb-4 text-xs text-slate-400 italic">
              {lang === "fr" ? "Donnees de demonstration — endpoint backend non disponible." : "Demo data — backend endpoint not available."}
            </p>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                label={lang === "fr" ? "Partenaires actifs" : "Active partners"}
                value={String(MOCK_ADMIN_PARTNERS.filter((p) => p.status === "active").length)}
                icon={<UsersIcon size={20} className="text-indigo-600" />}
              />
              <StatCard
                label={lang === "fr" ? "Clients impliques" : "Clients involved"}
                value={String(MOCK_ADMIN_PARTNERS.reduce((s, p) => s + p.clientsCount, 0))}
                icon={<ShieldCheckIcon size={20} className="text-violet-600" />}
              />
              <StatCard
                label={lang === "fr" ? "Taux de conversion" : "Conversion rate"}
                value={`${Math.round(
                  (MOCK_ADMIN_PARTNERS.reduce((s, p) => s + p.activeClients, 0) /
                    Math.max(MOCK_ADMIN_PARTNERS.reduce((s, p) => s + p.clientsCount, 0), 1)) *
                    100
                )}%`}
                icon={<WrenchIcon size={20} className="text-yellow-500" />}
              />
              <StatCard
                label={lang === "fr" ? "Revenus via partenaires" : "Partner revenue"}
                value={`${MOCK_ADMIN_PARTNERS.reduce((s, p) => s + p.commissionThisMonth, 0).toLocaleString("fr-FR")} XOF`}
                icon={<CreditCardIcon size={20} className="text-emerald-500" />}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
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
                    {MOCK_ADMIN_PARTNERS.map((partner) => {
                      const conversionPct = partner.clientsCount > 0 ? Math.round((partner.activeClients / partner.clientsCount) * 100) : 0;
                      return (
                        <tr key={partner.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-indigo-950">{partner.storeName}</div>
                            <div className="text-xs text-slate-400">{partner.ownerName}</div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{partner.city}</td>
                          <td className="px-5 py-3.5 text-center font-medium text-indigo-950">{partner.clientsCount}</td>
                          <td className="px-5 py-3.5 text-center font-medium text-emerald-600">{partner.activeClients}</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={cn("text-sm font-medium", conversionPct >= 80 ? "text-emerald-600" : conversionPct >= 50 ? "text-yellow-500" : "text-red-500")}>
                              {conversionPct}%
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-indigo-950">
                            {partner.commissionThisMonth > 0 ? `${partner.commissionThisMonth.toLocaleString("fr-FR")} XOF` : "—"}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
