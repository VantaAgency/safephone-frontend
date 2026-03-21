"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RouteGuardLoader } from "@/components/auth/route-guard-loader";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";
import {
  CheckCircleIcon,
  CreditCardIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/lib/auth/auth-provider";
import { useLanguage } from "@/lib/language-context";
import { usePlans } from "@/lib/api/hooks";
import {
  usePartnerOverview,
  useCreatePartnerClient,
  useRefreshPartnerInvitation,
  usePartnerSales,
  usePartnerPayouts,
} from "@/lib/api/hooks";
import { formatXOF } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { PartnerClient } from "@/lib/api/types";

type ClientStatus = PartnerClient["status"];
type PartnerTab = "pipeline" | "performance";

const STATUS_ORDER: ClientStatus[] = [
  "invited",
  "account_created",
  "payment_pending",
  "active",
];

export default function PartnerDashboardPage() {
  const { lang } = useLanguage();
  const { user, isPending } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<PartnerTab>("pipeline");
  const isPartner = user?.role === "partner";
  const { data: overview, isLoading: overviewLoading } = usePartnerOverview({
    enabled: isPartner,
  });
  const { data: sales = [], isLoading: salesLoading } = usePartnerSales({
    enabled: isPartner && tab === "performance",
  });
  const { data: payouts = [], isLoading: payoutsLoading } = usePartnerPayouts({
    enabled: isPartner && tab === "performance",
  });
  const { data: plans } = usePlans();
  const createClient = useCreatePartnerClient();
  const refreshInvitation = useRefreshPartnerInvitation();
  const [showModal, setShowModal] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalPlan, setModalPlan] = useState("");
  const [createdClient, setCreatedClient] = useState<PartnerClient | null>(
    null,
  );
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);
  const profile = overview?.profile;
  const clients = overview?.recent_clients ?? [];
  const profileLoading = overviewLoading;
  const clientsLoading = overviewLoading;

  useEffect(() => {
    if (!isPending && !isPartner) {
      router.replace("/acces-refuse?required=partner&from=%2Fespace-partenaire");
    }
  }, [isPartner, isPending, router]);

  if (isPending || !isPartner) {
    return <RouteGuardLoader />;
  }

  const statusLabel: Record<ClientStatus, string> = {
    invited: lang === "fr" ? "Invité" : "Invited",
    account_created: lang === "fr" ? "Compte créé" : "Account created",
    payment_pending: lang === "fr" ? "Paiement en attente" : "Payment pending",
    active: lang === "fr" ? "Actif" : "Active",
    expired: lang === "fr" ? "Expiré" : "Expired",
    draft: lang === "fr" ? "Brouillon" : "Draft",
    cancelled: lang === "fr" ? "Annulé" : "Cancelled",
    failed: lang === "fr" ? "Échoué" : "Failed",
  };

  const handleInvolve = async () => {
    try {
      const client = await createClient.mutateAsync({
        client_name: modalName.trim(),
        client_phone: modalPhone.trim() || undefined,
        plan_id: modalPlan || undefined,
      });
      setCreatedClient(client);
    } catch {
      // error shown via createClient.isError
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCreatedClient(null);
    setModalName("");
    setModalPhone("");
    setModalPlan("");
  };

  const canSubmit = modalName.trim().length >= 2;

  const handleCopyInvitation = async (client: PartnerClient) => {
    if (!client.invitation_url) return;
    await navigator.clipboard.writeText(client.invitation_url);
    setCopiedClientId(client.id);
    window.setTimeout(
      () =>
        setCopiedClientId((current) =>
          current === client.id ? null : current,
        ),
      2000,
    );
  };

  const handleShareInvitation = async (client: PartnerClient) => {
    if (!client.invitation_url) return;
    const shareText =
      lang === "fr"
        ? `Bonjour ${client.client_name}, voici votre lien SafePhone pour finaliser votre inscription: ${client.invitation_url}`
        : `Hi ${client.client_name}, here is your SafePhone invitation link to complete your signup: ${client.invitation_url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SafePhone",
          text: shareText,
          url: client.invitation_url,
        });
        return;
      } catch {
        // fall back to clipboard
      }
    }

    await handleCopyInvitation(client);
  };

  const handleRefreshInvitation = async (clientId: string) => {
    try {
      const refreshed = await refreshInvitation.mutateAsync(clientId);
      setCreatedClient(refreshed);
    } catch {
      // error surfaced via mutation state if needed later
    }
  };

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
              {profileLoading ? (
                <span className="inline-block h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
              ) : (
                (profile?.store_name ?? "—")
              )}
            </h1>
            <p className="mt-1 text-slate-500">
              {profileLoading ? (
                <span className="inline-block h-4 w-48 animate-pulse rounded bg-slate-200" />
              ) : (
                `${profile?.city ?? "—"}${profile?.business_location ? ` · ${profile.business_location}` : ""}`
              )}
            </p>
            {!profileLoading && profile && (
              <p className="mt-2 text-sm text-slate-500">
                {lang === "fr"
                  ? `Commission d'acquisition attribuée : ${profile.commission_percentage}%`
                  : `Assigned acquisition commission: ${profile.commission_percentage}%`}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowModal(true)}
            disabled={!profile}
          >
            + {lang === "fr" ? "Inviter un client" : "Invite a client"}
          </Button>
        </div>

        {/* Stats strip */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label={lang === "fr" ? "Clients inscrits" : "Enrolled clients"}
            value={profileLoading ? "—" : String(profile?.total_clients ?? 0)}
            icon={<UsersIcon size={20} className="text-indigo-600" />}
          />
          <StatCard
            label={lang === "fr" ? "Clients actifs" : "Active clients"}
            value={profileLoading ? "—" : String(profile?.active_clients ?? 0)}
            icon={<ShieldCheckIcon size={20} className="text-violet-600" />}
          />
          <StatCard
            label={lang === "fr" ? "Commission attribuée" : "Assigned commission"}
            value={profileLoading ? "—" : `${profile?.commission_percentage ?? 0}%`}
            icon={<PhoneIcon size={20} className="text-emerald-500" />}
          />
          <StatCard
            label={lang === "fr" ? "Commissions gagnées" : "Commissions earned"}
            value={
              profileLoading
                ? "—"
                : formatXOF(profile?.total_commission_earned_xof ?? 0)
            }
            icon={<CreditCardIcon size={20} className="text-yellow-500" />}
          />
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Commissions dues" : "Commissions owed"}
            </p>
            <p className="mt-2 text-xl font-medium text-indigo-950">
              {profileLoading ? "—" : formatXOF(profile?.total_commission_owed_xof ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Commissions payées" : "Commissions paid"}
            </p>
            <p className="mt-2 text-xl font-medium text-indigo-950">
              {profileLoading ? "—" : formatXOF(profile?.total_commission_paid_xof ?? 0)}
            </p>
          </div>
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
                  : "text-slate-500 hover:text-indigo-950",
              )}
            >
              {t === "pipeline"
                ? lang === "fr"
                  ? "Pipeline clients"
                  : "Client Pipeline"
                : lang === "fr"
                  ? "Performance"
                  : "Performance"}
            </button>
          ))}
        </div>

        {/* Pipeline Tab */}
        {tab === "pipeline" && (
          <div>
            {clientsLoading ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border-b border-slate-50 px-5 py-4 last:border-0"
                  >
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-sm">
                <p className="font-medium text-indigo-950">
                  {lang === "fr" ? "Aucun client invité" : "No clients yet"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Commencez par créer votre premier client et partagez ensuite son lien d’invitation."
                    : "Start by creating your first client, then share their invitation link."}
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
                          lang === "fr" ? "Statut" : "Status",
                          lang === "fr" ? "Commission" : "Commission",
                          lang === "fr" ? "Invitation" : "Invitation",
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
                      {clients.map((client: PartnerClient) => {
                        const planObj = plans?.find(
                          (p) => p.id === client.plan_id,
                        );
                        const stepIndex = STATUS_ORDER.indexOf(
                          client.status as ClientStatus,
                        );
                        const invitationExpired = client.status === "expired";
                        return (
                          <tr
                            key={client.id}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30"
                          >
                            <td className="px-5 py-3.5">
                              <div className="font-medium text-indigo-950">
                                {client.client_name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {client.id.slice(0, 8)}…
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">
                              {client.client_phone ?? "—"}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">
                              {new Date(client.invited_at).toLocaleDateString(
                                lang === "fr" ? "fr-FR" : "en-US",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              {planObj ? (
                                <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                                  {lang === "fr"
                                    ? planObj.name_fr
                                    : planObj.name_en}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1">
                                {STATUS_ORDER.map((s, i) => (
                                  <div
                                    key={s}
                                    className={cn(
                                      "h-1.5 w-6 rounded-full",
                                      stepIndex >= 0 && i <= stepIndex
                                        ? "bg-indigo-950"
                                        : "bg-slate-200",
                                    )}
                                  />
                                ))}
                              </div>
                              <StatusBadge
                                status={
                                  (invitationExpired
                                    ? "expired"
                                    : client.status) as ClientStatus
                                }
                                label={
                                  statusLabel[
                                    (invitationExpired
                                      ? "expired"
                                      : client.status) as ClientStatus
                                  ] ?? client.status
                                }
                                className="mt-1.5"
                              />
                            </td>
                            <td className="px-5 py-3.5">
                              {client.has_generated_commission ? (
                                <div>
                                  <div className="font-medium text-emerald-600">
                                    {formatXOF(client.commission_amount_xof ?? 0)}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {client.commission_percentage ?? profile?.commission_percentage ?? 0}% ·{" "}
                                    {client.commission_status === "paid"
                                      ? (lang === "fr" ? "payée" : "paid")
                                      : (lang === "fr" ? "en attente" : "pending")}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400">
                                  {lang === "fr"
                                    ? "Aucune commission tant que le 1er paiement réussi n'est pas confirmé."
                                    : "No commission until the first successful payment is confirmed."}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-2">
                                <div className="max-w-[260px] truncate text-xs text-slate-400">
                                  {client.invitation_url ?? "—"}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {invitationExpired
                                    ? lang === "fr"
                                      ? "Lien expiré"
                                      : "Link expired"
                                    : client.invitation_expires_at
                                      ? lang === "fr"
                                        ? `Valide jusqu’au ${new Date(client.invitation_expires_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`
                                        : `Valid until ${new Date(client.invitation_expires_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}`
                                      : "—"}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyInvitation(client)}
                                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-indigo-950 transition-colors hover:bg-slate-50"
                                  >
                                    {copiedClientId === client.id
                                      ? lang === "fr"
                                        ? "Copié"
                                        : "Copied"
                                      : lang === "fr"
                                        ? "Copier"
                                        : "Copy"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleShareInvitation(client)
                                    }
                                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-indigo-950 transition-colors hover:bg-slate-50"
                                  >
                                    {lang === "fr" ? "Partager" : "Share"}
                                  </button>
                                  {invitationExpired && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRefreshInvitation(client.id)
                                      }
                                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-indigo-950 transition-colors hover:bg-slate-50"
                                    >
                                      {lang === "fr" ? "Renouveler" : "Renew"}
                                    </button>
                                  )}
                                </div>
                              </div>
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
              <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {lang === "fr" ? "Règle de commission" : "Commission rule"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Ces commissions sont des commissions d'acquisition uniques. Un client génère une seule commission, uniquement après son premier paiement réussi."
                    : "These are one-time acquisition commissions. A client generates one commission only, after their first successful payment."}
                </p>
              </div>
              <h2 className="mb-4 text-lg font-medium text-indigo-950">
                {lang === "fr" ? "Commissions d'acquisition" : "Acquisition commissions"}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                {salesLoading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 w-full animate-pulse rounded bg-slate-200"
                      />
                    ))}
                  </div>
                ) : sales.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    {lang === "fr"
                      ? "Aucune commission générée pour l'instant"
                      : "No commissions generated yet"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          {[
                            lang === "fr" ? "Client" : "Customer",
                            lang === "fr" ? "Forfait" : "Plan",
                            lang === "fr" ? "Base" : "Base",
                            "Commission",
                            lang === "fr" ? "Statut" : "Status",
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
                        {sales.map((sale) => (
                          <tr
                            key={sale.id}
                            className="border-b border-slate-50 last:border-0"
                          >
                            <td className="px-5 py-3.5 font-medium text-indigo-950">
                              {sale.customer_name}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="rounded-full bg-indigo-950/5 px-2.5 py-0.5 text-xs font-medium text-indigo-950">
                                {lang === "fr"
                                  ? (sale.plan_name_fr ?? "—")
                                  : (sale.plan_name_en ?? "—")}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">
                              {formatXOF(sale.base_amount_xof)}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-emerald-600">
                              <div>{formatXOF(sale.commission_amount_xof)}</div>
                              <div className="text-xs text-slate-400">
                                {sale.commission_percentage}%
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusBadge
                                status={sale.status === "paid" ? "active" : "pending"}
                                label={sale.status === "paid"
                                  ? (lang === "fr" ? "Payée" : "Paid")
                                  : (lang === "fr" ? "En attente" : "Pending")}
                              />
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">
                              {new Date(sale.paid_at ?? sale.created_at).toLocaleDateString(
                                lang === "fr" ? "fr-FR" : "en-US",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium text-indigo-950">
                {lang === "fr" ? "Versements" : "Payouts"}
              </h2>
              {payoutsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                    >
                      <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white py-10 text-center text-sm text-slate-500 shadow-sm">
                  {lang === "fr" ? "Aucun versement" : "No payouts yet"}
                </div>
              ) : (
                <div className="space-y-3">
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-medium text-indigo-950">
                            {formatXOF(payout.amount_xof)}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {payout.payout_method} &middot;{" "}
                            {new Date(payout.paid_at).toLocaleDateString(
                              lang === "fr" ? "fr-FR" : "en-US",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                        <StatusBadge
                          status="completed"
                          label={lang === "fr" ? "Verse" : "Paid"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            onClick={() => {
              if (!createClient.isPending) closeModal();
            }}
            aria-label={lang === "fr" ? "Fermer" : "Close"}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl">
            {createdClient ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircleIcon size={28} className="text-emerald-500" />
                </div>
                <p className="mt-4 text-lg font-medium text-indigo-950">
                  {lang === "fr" ? "Invitation prête" : "Invitation ready"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {lang === "fr"
                    ? `${createdClient.client_name} a été ajouté à votre pipeline et peut maintenant recevoir son lien d’invitation.`
                    : `${createdClient.client_name} has been added to your pipeline and can now receive their invitation link.`}
                </p>

                {/* Invite URL */}
                <div className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    {lang === "fr"
                      ? "Partagez ce lien avec votre client :"
                      : "Share this link with your client:"}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-indigo-950 shadow-sm ring-1 ring-slate-200">
                      {createdClient.invitation_url}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        void handleCopyInvitation(createdClient);
                      }}
                      className="shrink-0 rounded-lg bg-indigo-950 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-900"
                    >
                      {copiedClientId === createdClient.id
                        ? lang === "fr"
                          ? "Copié"
                          : "Copied"
                        : lang === "fr"
                          ? "Copier"
                          : "Copy"}
                    </button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="md"
                  className="mt-5 w-full"
                  onClick={closeModal}
                >
                  {lang === "fr"
                    ? "Fermer et retrouver ce lien plus tard"
                    : "Close and find this link later"}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-indigo-950">
                    {lang === "fr" ? "Inviter un client" : "Invite a client"}
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
                  <FormField
                    label={
                      lang === "fr"
                        ? "Nom complet du client"
                        : "Client full name"
                    }
                  >
                    <Input
                      placeholder={
                        lang === "fr"
                          ? "ex: Amadou Diallo"
                          : "e.g. Amadou Diallo"
                      }
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label={
                      lang === "fr" ? "Numero de telephone" : "Phone number"
                    }
                    hint={
                      lang === "fr"
                        ? "Optionnel — format +221..."
                        : "Optional — +221 format"
                    }
                  >
                    <Input
                      placeholder="+221 77 000 00 00"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label={
                      lang === "fr" ? "Formule recommandee" : "Recommended plan"
                    }
                    hint={lang === "fr" ? "Optionnel" : "Optional"}
                  >
                    <Select
                      value={modalPlan}
                      onChange={(e) =>
                        setModalPlan((e.target as HTMLSelectElement).value)
                      }
                    >
                      <option value="">
                        {lang === "fr"
                          ? "Aucune recommandation"
                          : "No recommendation"}
                      </option>
                      {(plans ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          SafePhone {lang === "fr" ? p.name_fr : p.name_en}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                {createClient.isError && (
                  <div className="mt-3 rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {lang === "fr"
                      ? "Une erreur est survenue. Réessayez."
                      : "An error occurred. Please try again."}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    onClick={closeModal}
                    disabled={createClient.isPending}
                  >
                    {lang === "fr" ? "Annuler" : "Cancel"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-2"
                    onClick={handleInvolve}
                    loading={createClient.isPending}
                    disabled={!canSubmit || createClient.isPending}
                  >
                    {lang === "fr"
                      ? "Créer l’invitation →"
                      : "Create invitation →"}
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
