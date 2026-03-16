"use client";

import { useState } from "react";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";
import { CheckCircleIcon, CreditCardIcon, PhoneIcon, ShieldCheckIcon, UsersIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ClientStatus, PartnerClient } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { usePlans } from "@/lib/api/hooks";
import { usePipeline } from "@/lib/pipeline-context";
import { cn } from "@/lib/utils";

const PARTNER_SLUG = "boutique-diallo-mobile";

const MOCK_PARTNER_SALES = [
  { id: "PS-001", customer: "Amadou Ba", plan: "Ecran+", amount: "3 500 XOF", commission: "700 XOF", date: "08 Mar 2025", status: "completed" },
  { id: "PS-002", customer: "Fatou Diop", plan: "Plus", amount: "6 000 XOF", commission: "1 200 XOF", date: "06 Mar 2025", status: "completed" },
  { id: "PS-003", customer: "Moussa Sall", plan: "Essentiel", amount: "1 500 XOF", commission: "300 XOF", date: "05 Mar 2025", status: "completed" },
  { id: "PS-004", customer: "Aissatou Ndiaye", plan: "Haute", amount: "10 000 XOF", commission: "2 000 XOF", date: "03 Mar 2025", status: "completed" },
];

const MOCK_PAYOUTS = [
  { id: "PO-001", amount: "18 400 XOF", method: "Wave", date: "01 Mar 2025", status: "completed" },
  { id: "PO-002", amount: "14 200 XOF", method: "Orange Money", date: "01 Fev 2025", status: "completed" },
];

type PartnerTab = "pipeline" | "performance";

const STATUS_ORDER: ClientStatus[] = ["invited", "plan_purchased", "device_registered", "active"];

export default function PartnerDashboardPage() {
  const { lang } = useLanguage();
  const { clients, addClient } = usePipeline();
  const { data: plans } = usePlans();
  const [tab, setTab] = useState<PartnerTab>("pipeline");
  const [showModal, setShowModal] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalPlan, setModalPlan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newClientId, setNewClientId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const totalClients = clients.length;
  const plansPurchased = clients.filter((c) => c.status !== "invited").length;
  const activeClients = clients.filter((c) => c.status === "active").length;

  const statusLabel: Record<ClientStatus, string> = {
    invited: lang === "fr" ? "Invite" : "Invited",
    plan_purchased: lang === "fr" ? "Plan achete" : "Plan purchased",
    device_registered: lang === "fr" ? "Appareil ajoute" : "Device added",
    active: lang === "fr" ? "Actif" : "Active",
  };

  const handleInvolve = () => {
    setSubmitting(true);
    setTimeout(() => {
      const newClient: PartnerClient = {
        id: `PC-${String(clients.length + 100).padStart(3, "0")}`,
        name: modalName.trim(),
        phone: modalPhone.trim() || "+221 —",
        invitedAt: "13 Mar 2026",
        status: "invited",
        planId: modalPlan || undefined,
        lastActivity: lang === "fr" ? "a l'instant" : "just now",
      };
      addClient(newClient);
      setNewClientId(newClient.id);
      setSubmitting(false);
    }, 1500);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewClientId(null);
    setModalName("");
    setModalPhone("");
    setModalPlan("");
  };

  const canSubmit = modalName.trim().length >= 2;

  return (
    <div className="bg-slate-50 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                {lang === "fr" ? "Partenaire" : "Partner"}
              </span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-indigo-950 md:text-3xl">
              Boutique Diallo Mobile
            </h1>
            <p className="mt-1 text-slate-500">Dakar, Parcelles Assainies</p>
          </div>
          <Button variant="secondary" size="md" onClick={() => setShowModal(true)}>
            + {lang === "fr" ? "Impliquer un client" : "Add a Client"}
          </Button>
        </div>

        {/* Stats strip */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label={lang === "fr" ? "Clients impliques" : "Clients involved"}
            value={String(totalClients)}
            icon={<UsersIcon size={20} className="text-indigo-600" />}
          />
          <StatCard
            label={lang === "fr" ? "Plans achetes" : "Plans purchased"}
            value={String(plansPurchased)}
            icon={<ShieldCheckIcon size={20} className="text-violet-600" />}
          />
          <StatCard
            label={lang === "fr" ? "Clients actifs" : "Active clients"}
            value={String(activeClients)}
            icon={<PhoneIcon size={20} className="text-emerald-500" />}
          />
          <StatCard
            label={lang === "fr" ? "Commission du mois" : "Month commission"}
            value="42 600 XOF"
            icon={<CreditCardIcon size={20} className="text-yellow-500" />}
            trend="+18%"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-full bg-slate-100 p-1 w-fit">
          {(["pipeline", "performance"] as PartnerTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                tab === t
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950"
              )}
            >
              {t === "pipeline"
                ? lang === "fr" ? "Pipeline clients" : "Client Pipeline"
                : lang === "fr" ? "Performance" : "Performance"}
            </button>
          ))}
        </div>

        {/* Pipeline Tab */}
        {tab === "pipeline" && (
          <div>
            {clients.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-sm">
                <p className="font-medium text-indigo-950">
                  {lang === "fr" ? "Aucun client implique" : "No clients yet"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Commencez par impliquer votre premier client SafePhone."
                    : "Start by involving your first SafePhone client."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {[
                          lang === "fr" ? "Client" : "Client",
                          lang === "fr" ? "Telephone" : "Phone",
                          lang === "fr" ? "Invite le" : "Invited on",
                          lang === "fr" ? "Formule" : "Plan",
                          lang === "fr" ? "Progression" : "Progress",
                          lang === "fr" ? "Derniere activite" : "Last activity",
                        ].map((h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => {
                        const planObj = plans?.find((p) => p.id === client.planId || p.slug === client.planId);
                        const stepIndex = STATUS_ORDER.indexOf(client.status);
                        return (
                          <tr
                            key={client.id}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30"
                          >
                            <td className="px-5 py-3.5">
                              <div className="font-medium text-indigo-950">{client.name}</div>
                              <div className="text-xs text-slate-400">{client.id}</div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">{client.phone}</td>
                            <td className="px-5 py-3.5 text-slate-500">{client.invitedAt}</td>
                            <td className="px-5 py-3.5">
                              {planObj ? (
                                <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                                  {lang === "fr" ? planObj.name_fr : planObj.name_en}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1">
                                {STATUS_ORDER.map((s, i) => (
                                  <div
                                    key={s}
                                    className={cn(
                                      "h-1.5 w-6 rounded-full",
                                      i <= stepIndex ? "bg-indigo-950" : "bg-slate-200"
                                    )}
                                  />
                                ))}
                              </div>
                              <StatusBadge
                                status={client.status}
                                label={statusLabel[client.status]}
                                className="mt-1.5"
                              />
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-400">
                              {client.lastActivity}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {tab === "performance" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-4 text-lg font-medium text-indigo-950">
                {lang === "fr" ? "Ventes recentes" : "Recent sales"}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {[
                          lang === "fr" ? "Client" : "Customer",
                          lang === "fr" ? "Forfait" : "Plan",
                          "Commission",
                          "Date",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_PARTNER_SALES.map((sale) => (
                        <tr key={sale.id} className="border-b border-slate-50 last:border-0">
                          <td className="px-5 py-3.5 font-medium text-indigo-950">
                            {sale.customer}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-indigo-950/5 px-2.5 py-0.5 text-xs font-medium text-indigo-950">
                              {sale.plan}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-emerald-600">{sale.commission}</td>
                          <td className="px-5 py-3.5 text-slate-500">{sale.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium text-indigo-950">
                {lang === "fr" ? "Versements" : "Payouts"}
              </h2>
              <div className="space-y-3">
                {MOCK_PAYOUTS.map((payout) => (
                  <div
                    key={payout.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-indigo-950">{payout.amount}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {payout.method} &middot; {payout.date}
                        </div>
                      </div>
                      <StatusBadge status="completed" label={lang === "fr" ? "Verse" : "Paid"} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
                <div className="text-xs font-medium uppercase tracking-wider text-yellow-600">
                  {lang === "fr" ? "Prochaine commission" : "Next commission"}
                </div>
                <div className="mt-2 text-2xl font-medium tracking-tight text-indigo-950">4 200 XOF</div>
                <div className="mt-1 text-xs text-slate-500">
                  {lang === "fr"
                    ? "Versement prevu le 01 Avr 2026"
                    : "Payout expected Apr 01, 2026"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* "Impliquer un client" Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (!submitting) closeModal(); }}
            aria-label={lang === "fr" ? "Fermer" : "Close"}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl">
            {newClientId ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircleIcon size={28} className="text-emerald-500" />
                </div>
                <p className="mt-4 text-lg font-medium text-indigo-950">
                  {lang === "fr" ? "Client implique !" : "Client added!"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {lang === "fr"
                    ? `${modalName} a ete ajoute a votre pipeline.`
                    : `${modalName} has been added to your pipeline.`}
                </p>

                {/* Invite URL */}
                <div className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    {lang === "fr" ? "Partagez ce lien avec votre client :" : "Share this link with your client:"}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-indigo-950 shadow-sm ring-1 ring-slate-200">
                      {`/inscription?partner=${PARTNER_SLUG}&client=${newClientId}`}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/inscription?partner=${PARTNER_SLUG}&client=${newClientId}`
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="shrink-0 rounded-lg bg-indigo-950 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-900"
                    >
                      {copied ? (lang === "fr" ? "Copie" : "Copied") : (lang === "fr" ? "Copier" : "Copy")}
                    </button>
                  </div>
                </div>

                <Button variant="ghost" size="md" className="mt-5 w-full" onClick={closeModal}>
                  {lang === "fr" ? "Fermer" : "Close"}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-indigo-950">
                    {lang === "fr" ? "Impliquer un client" : "Add a Client"}
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-950"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField label={lang === "fr" ? "Nom complet du client" : "Client full name"}>
                    <Input
                      placeholder={lang === "fr" ? "ex: Amadou Diallo" : "e.g. Amadou Diallo"}
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label={lang === "fr" ? "Numero de telephone" : "Phone number"}
                    hint={lang === "fr" ? "Optionnel — format +221..." : "Optional — +221 format"}
                  >
                    <Input
                      placeholder="+221 77 000 00 00"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label={lang === "fr" ? "Formule recommandee" : "Recommended plan"}
                    hint={lang === "fr" ? "Optionnel" : "Optional"}
                  >
                    <Select
                      value={modalPlan}
                      onChange={(e) => setModalPlan((e.target as HTMLSelectElement).value)}
                    >
                      <option value="">
                        {lang === "fr" ? "Aucune recommandation" : "No recommendation"}
                      </option>
                      {(plans ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          SafePhone {lang === "fr" ? p.name_fr : p.name_en}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    {lang === "fr" ? "Annuler" : "Cancel"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-2"
                    onClick={handleInvolve}
                    disabled={!canSubmit || submitting}
                  >
                    {submitting
                      ? lang === "fr" ? "Ajout en cours..." : "Adding..."
                      : lang === "fr" ? "Impliquer →" : "Add →"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
