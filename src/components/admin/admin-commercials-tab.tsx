"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-field";
import { ClockIcon, CreditCardIcon, ShieldCheckIcon, UsersIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useAdminCommercial,
  useAdminCommercials,
  useCreateCommercialAccount,
  useUpdateCommercialCommission,
  useUpdateCommercialStatus,
} from "@/lib/api/hooks";
import { formatXOF } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";

const DEFAULT_FORM = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  status: "active" as "active" | "inactive",
  commission_percentage: "5",
};

export function AdminCommercialsTab() {
  const { lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [commissionDrafts, setCommissionDrafts] = useState<Record<string, string>>({});

  const { data: commercials = [], isLoading } = useAdminCommercials();
  const resolvedSelectedId = selectedId && commercials.some((item) => item.id === selectedId)
    ? selectedId
    : commercials[0]?.id ?? null;
  const { data: detail } = useAdminCommercial(resolvedSelectedId ?? undefined, {
    enabled: !!resolvedSelectedId,
  });
  const createCommercial = useCreateCommercialAccount();
  const updateStatus = useUpdateCommercialStatus();
  const updateCommission = useUpdateCommercialCommission();

  const totals = useMemo(() => ({
    active: commercials.filter((item) => item.status === "active").length,
    partners: commercials.reduce((sum, item) => sum + item.partners_brought, 0),
    pending: commercials.reduce((sum, item) => sum + item.pending_partners, 0),
    earned: commercials.reduce((sum, item) => sum + item.commission_earned_xof, 0),
  }), [commercials]);

  const submitCreate = async () => {
    await createCommercial.mutateAsync({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password.trim(),
      status: form.status,
      commission_percentage: Number(form.commission_percentage),
    });
    setForm(DEFAULT_FORM);
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={lang === "fr" ? "Commerciaux actifs" : "Active commercials"} value={String(totals.active)} icon={<UsersIcon size={20} className="text-emerald-600" />} />
        <StatCard label={lang === "fr" ? "Partenaires apportés" : "Partners brought"} value={String(totals.partners)} icon={<ShieldCheckIcon size={20} className="text-indigo-600" />} />
        <StatCard label={lang === "fr" ? "Candidatures en attente" : "Pending applications"} value={String(totals.pending)} icon={<ClockIcon size={20} className="text-yellow-500" />} />
        <StatCard label={lang === "fr" ? "Commissions générées" : "Commission earned"} value={formatXOF(totals.earned)} icon={<CreditCardIcon size={20} className="text-violet-600" />} />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium text-indigo-950">
              {lang === "fr" ? "Gestion commerciale" : "Commercial management"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {lang === "fr"
                ? "Créez les commerciaux, suivez leurs partenaires, leurs preuves terrain et leurs commissions."
                : "Create commercials and track partners, field proof, and commissions."}
            </p>
          </div>
          <Button variant={showCreate ? "secondary" : "primary"} onClick={() => setShowCreate((current) => !current)}>
            {showCreate ? (lang === "fr" ? "Fermer" : "Close") : (lang === "fr" ? "Inviter un commercial" : "Invite commercial")}
          </Button>
        </div>

        {showCreate && (
          <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_1fr_180px_auto]">
            <Input placeholder={lang === "fr" ? "Nom complet" : "Full name"} value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} />
            <Input type="email" placeholder="email@safephone.sn" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <Input placeholder={lang === "fr" ? "Téléphone" : "Phone"} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <Input type="password" placeholder={lang === "fr" ? "Mot de passe" : "Password"} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-500">
                {lang === "fr" ? "Commission commercial (%)" : "Commercial commission (%)"}
              </span>
              <div className="relative">
                <Input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={form.commission_percentage}
                  onChange={(event) => setForm((current) => ({ ...current, commission_percentage: event.target.value }))}
                  className="pr-9"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-400">
                  %
                </span>
              </div>
            </label>
            <Button loading={createCommercial.isPending} onClick={submitCreate}>{lang === "fr" ? "Créer" : "Create"}</Button>
          </div>
        )}

        {createCommercial.error instanceof Error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {createCommercial.error.message}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">{lang === "fr" ? "Chargement..." : "Loading..."}</div>
        ) : commercials.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">{lang === "fr" ? "Aucun commercial." : "No commercials."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["Commercial", "Code", "Statut", "Commission %", "Partenaires", "Approuvés", "En attente", "Gagné", "Activité", "Actions"].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commercials.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-indigo-950">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold uppercase tracking-[0.14em] text-slate-500">{item.referral_code}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={item.status === "active" ? "active" : "expired"} label={item.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="relative w-28">
                          <Input className="pr-8" aria-label={lang === "fr" ? "Commission commercial en pourcentage" : "Commercial commission percentage"} type="number" min="0.01" max="100" step="0.01" value={commissionDrafts[item.id] ?? String(item.commission_percentage)} onChange={(event) => setCommissionDrafts((current) => ({ ...current, [item.id]: event.target.value }))} />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-400">
                            %
                          </span>
                        </div>
                        <Button size="sm" variant="outline" loading={updateCommission.isPending} onClick={() => updateCommission.mutate({ id: item.id, commissionPercentage: Number(commissionDrafts[item.id] ?? item.commission_percentage) })}>
                          OK
                        </Button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">{item.partners_brought}</td>
                    <td className="px-5 py-3.5">{item.approved_partners}</td>
                    <td className="px-5 py-3.5">{item.pending_partners}</td>
                    <td className="px-5 py-3.5 font-medium text-indigo-950">{formatXOF(item.commission_earned_xof)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{item.last_activity_date ? new Date(item.last_activity_date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US") : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <Button size="sm" variant={resolvedSelectedId === item.id ? "secondary" : "outline"} onClick={() => setSelectedId(item.id)}>
                          {lang === "fr" ? "Voir" : "View"}
                        </Button>
                        <Select className="w-28 py-2" value={item.status} onChange={(event) => updateStatus.mutate({ id: item.id, status: event.target.value as "active" | "inactive" })}>
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DetailPanel
            title={lang === "fr" ? "Partenaires apportés" : "Brought partners"}
            empty={lang === "fr" ? "Aucun partenaire." : "No partners."}
            rows={detail.partners.map((partner) => [
              partner.store_name,
              `${partner.city} · ${partner.status}`,
              `${partner.active_clients}/${partner.clients_count} clients`,
            ])}
          />
          <DetailPanel
            title={lang === "fr" ? "Rapports terrain" : "Field reports"}
            empty={lang === "fr" ? "Aucun rapport." : "No reports."}
            rows={detail.reports.map((report) => [
              report.partner_store_name ?? report.prospect_name ?? "—",
              report.activity_type,
              new Date(report.created_at).toLocaleString(lang === "fr" ? "fr-FR" : "en-US"),
            ])}
          />
          <DetailPanel
            title={lang === "fr" ? "Commissions commerciales" : "Commercial commissions"}
            empty={lang === "fr" ? "Aucune commission." : "No commissions."}
            rows={detail.commissions.map((commission) => [
              commission.partner_store_name,
              commission.client_name,
              formatXOF(commission.commission_amount_xof),
            ])}
          />
        </div>
      )}
    </div>
  );
}

function DetailPanel({ title, empty, rows }: { title: string; empty: string; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-medium text-indigo-950">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-8 text-sm text-slate-500">{empty}</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <div key={`${row[0]}-${index}`} className="grid gap-2 px-5 py-3 text-sm md:grid-cols-3">
              {row.map((cell) => (
                <span key={cell} className="text-slate-600">{cell}</span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
