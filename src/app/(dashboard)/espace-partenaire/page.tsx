"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RouteGuardLoader } from "@/components/auth/route-guard-loader";
import { PartnerReferralCard } from "@/components/partner/partner-referral-card";
import { StatCard } from "@/components/cards/stat-card";
import {
  CheckCircleIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/lib/auth/auth-provider";
import { useLanguage } from "@/lib/language-context";
import {
  usePartnerOverview,
  usePartnerPayouts,
  usePartnerSales,
  usePlans,
} from "@/lib/api/hooks";
import { formatXOF } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { PartnerClient, PartnerClientStatus } from "@/lib/api/types";

type PartnerTab = "clients" | "performance";

const STATUS_ORDER: PartnerClientStatus[] = [
  "invited",
  "account_created",
  "payment_pending",
  "active",
];

function formatShortDate(value: string | undefined, lang: "fr" | "en") {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PartnerDashboardPage() {
  const { lang } = useLanguage();
  const { user, isPending } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<PartnerTab>("clients");
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

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
  const { data: plans = [] } = usePlans();

  useEffect(() => {
    if (!isPending && !isPartner) {
      router.replace("/acces-refuse?required=partner&from=%2Fespace-partenaire");
    }
  }, [isPartner, isPending, router]);

  if (isPending || !isPartner) {
    return <RouteGuardLoader />;
  }

  const profile = overview?.profile;
  const clients = overview?.recent_clients ?? [];
  const referralMetrics = overview?.referral_metrics ?? {
    total_visits: 0,
    qr_visits: 0,
    share_visits: 0,
    total_signups: 0,
    payment_pending_count: 0,
    active_clients: 0,
    conversion_rate: 0,
  };
  const planBreakdown = overview?.plan_breakdown ?? [];

  const statusLabel: Record<PartnerClientStatus, string> = {
    invited: lang === "fr" ? "Invité" : "Invited",
    account_created: lang === "fr" ? "Compte créé" : "Account created",
    payment_pending: lang === "fr" ? "Paiement en attente" : "Payment pending",
    active: lang === "fr" ? "Actif" : "Active",
    expired: lang === "fr" ? "Expiré" : "Expired",
    draft: lang === "fr" ? "Brouillon" : "Draft",
    cancelled: lang === "fr" ? "Annulé" : "Cancelled",
    failed: lang === "fr" ? "Échoué" : "Failed",
  };

  const handleCopyLegacyInvitation = async (client: PartnerClient) => {
    if (!client.invitation_url) return;

    await navigator.clipboard.writeText(client.invitation_url);
    setCopiedClientId(client.id);
    window.setTimeout(
      () => setCopiedClientId((current) => (current === client.id ? null : current)),
      2000,
    );
  };

  const getClientSourceCopy = (client: PartnerClient) => {
    if (client.attribution_source === "manual_invitation") {
      return {
        label: lang === "fr" ? "Invitation manuelle" : "Manual invitation",
        detail:
          lang === "fr"
            ? "Flux historique"
            : "Legacy flow",
      };
    }

    switch (client.referral_medium) {
      case "qr":
        return {
          label: lang === "fr" ? "QR code" : "QR code",
          detail: client.referral_code ?? (lang === "fr" ? "Lien partenaire" : "Partner link"),
        };
      case "share":
        return {
          label: lang === "fr" ? "Lien partagé" : "Shared link",
          detail: client.referral_code ?? (lang === "fr" ? "Lien partenaire" : "Partner link"),
        };
      default:
        return {
          label: lang === "fr" ? "Lien partenaire" : "Partner link",
          detail: client.referral_code ?? (lang === "fr" ? "Attribution automatique" : "Automatic attribution"),
        };
    }
  };

  return (
    <div className="overflow-x-hidden bg-slate-50 py-8 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
              {lang === "fr" ? "Partenaire" : "Partner"}
            </span>
            {profile?.referral_code && (
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-950 shadow-sm ring-1 ring-slate-200">
                {profile.referral_code}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-indigo-950 md:text-3xl">
            {overviewLoading ? (
              <span className="inline-block h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
            ) : (
              profile?.store_name ?? "—"
            )}
          </h1>
          <p className="mt-1 text-slate-500">
            {overviewLoading ? (
              <span className="inline-block h-4 w-48 animate-pulse rounded bg-slate-200" />
            ) : (
              `${profile?.city ?? "—"}${profile?.business_location ? ` · ${profile.business_location}` : ""}`
            )}
          </p>
          {profile && (
            <p className="mt-2 text-sm text-slate-500">
              {lang === "fr"
                ? `Commission d'acquisition attribuée : ${profile.commission_percentage}%`
                : `Assigned acquisition commission: ${profile.commission_percentage}%`}
            </p>
          )}
        </div>

        <PartnerReferralCard
          lang={lang}
          storeName={profile?.store_name}
          referralCode={profile?.referral_code}
          referralLink={overview?.referral_link ?? ""}
          className="mb-8"
        />

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label={lang === "fr" ? "Visites du lien" : "Referral visits"}
            value={overviewLoading ? "—" : String(referralMetrics.total_visits)}
            icon={<PhoneIcon size={20} className="text-indigo-600" />}
          />
          <StatCard
            label={lang === "fr" ? "Inscriptions" : "Signups"}
            value={overviewLoading ? "—" : String(referralMetrics.total_signups)}
            icon={<UsersIcon size={20} className="text-violet-600" />}
          />
          <StatCard
            label={lang === "fr" ? "Activations" : "Activations"}
            value={overviewLoading ? "—" : String(referralMetrics.active_clients)}
            icon={<ShieldCheckIcon size={20} className="text-emerald-500" />}
          />
          <StatCard
            label={lang === "fr" ? "Conversion" : "Conversion"}
            value={
              overviewLoading
                ? "—"
                : `${referralMetrics.conversion_rate.toFixed(1)}%`
            }
            icon={<CheckCircleIcon size={20} className="text-yellow-500" />}
          />
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Visites QR" : "QR visits"}
            </p>
            <p className="mt-2 text-xl font-medium text-indigo-950">
              {overviewLoading ? "—" : referralMetrics.qr_visits}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Paiements en attente" : "Payments pending"}
            </p>
            <p className="mt-2 text-xl font-medium text-indigo-950">
              {overviewLoading ? "—" : referralMetrics.payment_pending_count}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Commissions gagnées" : "Commissions earned"}
            </p>
            <p className="mt-2 text-xl font-medium text-indigo-950">
              {overviewLoading
                ? "—"
                : formatXOF(profile?.total_commission_earned_xof ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Commissions dues" : "Commissions owed"}
            </p>
            <p className="mt-2 text-xl font-medium text-indigo-950">
              {overviewLoading
                ? "—"
                : formatXOF(profile?.total_commission_owed_xof ?? 0)}
            </p>
          </div>
        </div>

        <div className="mb-6 flex w-full gap-1 rounded-full bg-slate-100 p-1 sm:w-fit">
          {(["clients", "performance"] as PartnerTab[]).map((currentTab) => (
            <button
              key={currentTab}
              type="button"
              onClick={() => setTab(currentTab)}
              className={cn(
                "flex-1 cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium transition-all sm:flex-none sm:px-5",
                tab === currentTab
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950",
              )}
            >
              {currentTab === "clients"
                ? lang === "fr"
                  ? "Clients attribués"
                  : "Referred customers"
                : lang === "fr"
                  ? "Performance"
                  : "Performance"}
            </button>
          ))}
        </div>

        {tab === "clients" && (
          <div>
            <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-indigo-950">
                {lang === "fr"
                  ? "Chaque inscription via votre lien ou votre QR code apparaît ici avec son statut, son forfait et son suivi commission."
                  : "Every signup from your link or QR code appears here with its status, plan, and commission follow-up."}
              </p>
            </div>

            {overviewLoading ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
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
                  {lang === "fr"
                    ? "Aucun client attribué pour le moment"
                    : "No referred customers yet"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Partagez votre lien partenaire ou affichez votre QR code en boutique pour commencer à enregistrer des inscriptions."
                    : "Share your partner link or display your QR code in-store to start recording signups."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {[
                          lang === "fr" ? "Client" : "Customer",
                          lang === "fr" ? "Source" : "Source",
                          lang === "fr" ? "Date" : "Date",
                          lang === "fr" ? "Formule" : "Plan",
                          lang === "fr" ? "Statut" : "Status",
                          lang === "fr" ? "Commission" : "Commission",
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
                      {clients.map((client) => {
                        const plan = plans.find((item) => item.id === client.plan_id);
                        const sourceCopy = getClientSourceCopy(client);
                        const stepIndex = STATUS_ORDER.indexOf(client.status);
                        const status = client.status === "expired" ? "expired" : client.status;

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
                                {client.client_phone ?? "—"}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-1">
                                <span className="w-fit rounded-full bg-indigo-950/5 px-2.5 py-0.5 text-xs font-medium text-indigo-950">
                                  {sourceCopy.label}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {sourceCopy.detail}
                                </span>
                                {client.attribution_source === "manual_invitation" &&
                                  client.invitation_url && (
                                    <button
                                      type="button"
                                      onClick={() => void handleCopyLegacyInvitation(client)}
                                      className="w-fit text-xs font-medium text-indigo-600 hover:underline"
                                    >
                                      {copiedClientId === client.id
                                        ? lang === "fr"
                                          ? "Lien historique copié"
                                          : "Legacy link copied"
                                        : lang === "fr"
                                          ? "Copier le lien historique"
                                          : "Copy legacy link"}
                                    </button>
                                  )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">
                              {formatShortDate(
                                client.attributed_at ?? client.invited_at,
                                lang,
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              {plan ? (
                                <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                                  {lang === "fr" ? plan.name_fr : plan.name_en}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1">
                                {STATUS_ORDER.map((item, index) => (
                                  <div
                                    key={item}
                                    className={cn(
                                      "h-1.5 w-6 rounded-full",
                                      stepIndex >= 0 && index <= stepIndex
                                        ? "bg-indigo-950"
                                        : "bg-slate-200",
                                    )}
                                  />
                                ))}
                              </div>
                              <StatusBadge
                                status={status}
                                label={statusLabel[status] ?? client.status}
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
                                    {client.commission_percentage ??
                                      profile?.commission_percentage ??
                                      0}
                                    % ·{" "}
                                    {client.commission_status === "paid"
                                      ? lang === "fr"
                                        ? "payée"
                                        : "paid"
                                      : lang === "fr"
                                        ? "en attente"
                                        : "pending"}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400">
                                  {lang === "fr"
                                    ? "Une commission est générée après le premier paiement réussi."
                                    : "A commission is generated after the first successful payment."}
                                </div>
                              )}
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

        {tab === "performance" && (
          <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
            <div>
              <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {lang === "fr" ? "Suivi commercial" : "Commercial tracking"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Les visites, inscriptions, activations et commissions sont consolidées à partir de votre lien et de votre QR code. Une commission d’acquisition n’est créée qu’une seule fois, après le premier paiement réussi."
                    : "Visits, signups, activations, and commissions are consolidated from your link and QR code. An acquisition commission is created only once, after the first successful payment."}
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-lg font-medium text-indigo-950">
                    {lang === "fr"
                      ? "Commissions d'acquisition"
                      : "Acquisition commissions"}
                  </h2>
                </div>
                {salesLoading ? (
                  <div className="space-y-3 p-6">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
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
                            lang === "fr" ? "Commission" : "Commission",
                            lang === "fr" ? "Statut" : "Status",
                            lang === "fr" ? "Date" : "Date",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                            >
                              {heading}
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
                                  ? sale.plan_name_fr ?? "—"
                                  : sale.plan_name_en ?? "—"}
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
                                label={
                                  sale.status === "paid"
                                    ? lang === "fr"
                                      ? "Payée"
                                      : "Paid"
                                    : lang === "fr"
                                      ? "En attente"
                                      : "Pending"
                                }
                              />
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">
                              {formatShortDate(sale.paid_at ?? sale.created_at, lang)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-medium text-indigo-950">
                  {lang === "fr" ? "Répartition des formules" : "Plan breakdown"}
                </h2>
                {planBreakdown.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    {lang === "fr"
                      ? "Les choix de formule apparaîtront ici dès les premières souscriptions."
                      : "Plan choices will appear here once the first subscriptions come in."}
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {planBreakdown.map((item) => (
                      <div
                        key={`${item.plan_id ?? "unknown"}-${item.count}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-indigo-950">
                              {lang === "fr"
                                ? item.plan_name_fr ?? "Plan inconnu"
                                : item.plan_name_en ?? "Unknown plan"}
                            </p>
                            {item.plan_id && (
                              <p className="mt-1 text-xs text-slate-400">
                                {item.plan_id}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-indigo-950 shadow-sm ring-1 ring-slate-200">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-medium text-indigo-950">
                  {lang === "fr" ? "Versements" : "Payouts"}
                </h2>
                {payoutsLoading ? (
                  <div className="mt-4 space-y-3">
                    {[...Array(2)].map((_, index) => (
                      <div
                        key={index}
                        className="h-16 w-full animate-pulse rounded-2xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : payouts.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    {lang === "fr" ? "Aucun versement pour le moment." : "No payouts yet."}
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {payouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-lg font-medium text-indigo-950">
                              {formatXOF(payout.amount_xof)}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {payout.payout_method} · {formatShortDate(payout.paid_at, lang)}
                            </div>
                          </div>
                          <StatusBadge
                            status="completed"
                            label={lang === "fr" ? "Versé" : "Paid"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
