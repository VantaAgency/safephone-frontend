"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RouteGuardLoader } from "@/components/auth/route-guard-loader";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import {
  FormField,
  Input,
  Select,
  Textarea,
} from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  CreditCardIcon,
  PhoneIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchIcon,
} from "@/components/ui/icons";
import {
  useCreateOperationalNote,
  useEmployeeClaim,
  useEmployeeClaims,
  useEmployeeClient,
  useEmployeeClients,
  useEmployeeFollowUp,
  useEmployeeNotes,
  useEmployeeOverview,
  useEmployeePaymentFollowUps,
  useEmployeeRepair,
  useEmployeeRepairs,
  useEmployeeTasks,
  useEmployeeUpdateClaimStatus,
  useEmployeeUpdateRepairAmount,
  useEmployeeUpdateRepairStatus,
  useUpsertOperationalFollowUp,
} from "@/lib/api/hooks";
import type {
  ClaimStatus,
  EmployeeClaimDetail,
  EmployeeClientDetail,
  EmployeePaymentFollowUpItem,
  EmployeeRepairDetail,
  EmployeeTaskItem,
  FollowUpStatus,
  OperationalEntityType,
  OperationalNote,
  RepairRequestStatus,
  UpdateRepairRequestStatus,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { formatXOF } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type EmployeeTab =
  | "overview"
  | "clients"
  | "payments"
  | "claims"
  | "repairs"
  | "tasks";

const FOLLOW_UP_STATUS_OPTIONS: FollowUpStatus[] = [
  "to_contact",
  "contacted",
  "awaiting_response",
  "resolved",
];

const REPAIR_STATUS_OPTIONS: UpdateRepairRequestStatus["status"][] = [
  "accepted",
  "rejected",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

export default function EmployeeWorkspacePage() {
  const { lang } = useLanguage();
  const { user, isPending } = useAuth();
  const router = useRouter();
  const isEmployee = user?.role === "employee";

  const [tab, setTab] = useState<EmployeeTab>("overview");
  const [clientSearch, setClientSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [claimSearch, setClaimSearch] = useState("");
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | "">("");
  const [repairSearch, setRepairSearch] = useState("");
  const [repairStatus, setRepairStatus] = useState<RepairRequestStatus | "">("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPaymentSubscriptionId, setSelectedPaymentSubscriptionId] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
  } = useEmployeeOverview({
    enabled: isEmployee,
  });
  const {
    data: clients = [],
    isLoading: clientsLoading,
    isError: clientsError,
  } = useEmployeeClients(
    { search: clientSearch },
    { enabled: isEmployee && tab === "clients" },
  );
  const activeClientId =
    clients.some((item) => item.id === selectedClientId)
      ? selectedClientId
      : clients[0]?.id ?? null;
  const { data: selectedClient, isLoading: clientDetailLoading } = useEmployeeClient(
    activeClientId ?? undefined,
    { enabled: isEmployee && tab === "clients" && !!activeClientId },
  );
  const {
    data: paymentFollowUps = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useEmployeePaymentFollowUps(
    { search: paymentSearch },
    { enabled: isEmployee && tab === "payments" },
  );
  const {
    data: claimItems = [],
    isLoading: claimsLoading,
    isError: claimsError,
  } = useEmployeeClaims(
    {
      search: claimSearch,
      status: claimStatus || undefined,
    },
    { enabled: isEmployee && tab === "claims" },
  );
  const activeClaimId =
    claimItems.some((item) => item.claim.id === selectedClaimId)
      ? selectedClaimId
      : claimItems[0]?.claim.id ?? null;
  const { data: selectedClaim, isLoading: claimDetailLoading } = useEmployeeClaim(
    activeClaimId ?? undefined,
    { enabled: isEmployee && tab === "claims" && !!activeClaimId },
  );
  const {
    data: repairItems = [],
    isLoading: repairsLoading,
    isError: repairsError,
  } = useEmployeeRepairs(
    {
      search: repairSearch,
      status: repairStatus || undefined,
    },
    { enabled: isEmployee && tab === "repairs" },
  );
  const activeRepairId =
    repairItems.some((item) => item.repair.id === selectedRepairId)
      ? selectedRepairId
      : repairItems[0]?.repair.id ?? null;
  const { data: selectedRepair, isLoading: repairDetailLoading } = useEmployeeRepair(
    activeRepairId ?? undefined,
    { enabled: isEmployee && tab === "repairs" && !!activeRepairId },
  );
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useEmployeeTasks(undefined, {
    enabled: isEmployee && (tab === "overview" || tab === "tasks"),
  });

  const updateClaimStatus = useEmployeeUpdateClaimStatus();
  const updateRepairStatus = useEmployeeUpdateRepairStatus();
  const updateRepairAmount = useEmployeeUpdateRepairAmount();

  useEffect(() => {
    if (!isPending && !isEmployee) {
      router.replace("/acces-refuse?required=employee&from=%2Fespace-employe");
    }
  }, [isEmployee, isPending, router]);

  if (isPending || !isEmployee) {
    return <RouteGuardLoader />;
  }

  const metrics = overview?.metrics;
  const selectablePaymentFollowUps = paymentFollowUps.filter(
    (item) => item.subscription?.id,
  );
  const activePaymentSubscriptionId = selectablePaymentFollowUps.some(
    (item) => item.subscription?.id === selectedPaymentSubscriptionId,
  )
    ? selectedPaymentSubscriptionId
    : selectablePaymentFollowUps[0]?.subscription?.id ?? null;
  const selectedPaymentItem =
    paymentFollowUps.find(
      (item) => item.subscription?.id === activePaymentSubscriptionId,
    ) ?? null;
  const activeTaskId = tasks.some((item) => item.id === selectedTaskId)
    ? selectedTaskId
    : tasks[0]?.id ?? null;
  const selectedTask =
    tasks.find((item) => item.id === activeTaskId) ?? null;

  async function handleMoveClaimToReview(claimId: string) {
    await updateClaimStatus.mutateAsync({
      id: claimId,
      data: { status: "review" },
    });
  }

  async function handleSaveRepairStatus(
    nextStatus: UpdateRepairRequestStatus["status"],
    scheduledDate: string,
    scheduledTime: string,
  ) {
    if (!activeRepairId) {
      return;
    }

    await updateRepairStatus.mutateAsync({
      id: activeRepairId,
      data: {
        status: nextStatus,
        scheduled_date: nextStatus === "scheduled" ? scheduledDate : undefined,
        scheduled_time: nextStatus === "scheduled" ? scheduledTime : undefined,
      },
    });
  }

  async function handleSaveRepairAmount(amount: string) {
    if (!activeRepairId || !amount.trim()) {
      return;
    }

    await updateRepairAmount.mutateAsync({
      id: activeRepairId,
      data: {
        repair_amount_xof: Number.parseInt(amount, 10),
      },
    });
  }

  return (
    <div className="bg-slate-50 py-10 md:py-16">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {lang === "fr" ? "Opérations employé" : "Employee operations"}
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-indigo-950">
              {lang === "fr"
                ? "Espace employé SafePhone"
                : "SafePhone employee workspace"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              {lang === "fr"
                ? "Suivez les clients, priorisez les impayés, pilotez les sinistres et coordonnez les réparations depuis un espace dédié aux opérations quotidiennes."
                : "Track clients, prioritize unpaid subscriptions, triage claims, and coordinate repairs from a workspace designed for daily operations."}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {lang === "fr" ? "Urgence du jour" : "Today’s urgency"}
            </p>
            <p className="mt-2 text-2xl font-medium text-indigo-950">
              {overviewLoading ? "—" : metrics?.urgent_tasks_count ?? 0}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {lang === "fr"
                ? "Tâches opérationnelles à traiter rapidement"
                : "Operational items that need fast handling"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label={lang === "fr" ? "Clients à suivre" : "Clients to follow up"}
            value={overviewLoading ? "—" : metrics?.clients_needing_follow_up_count ?? 0}
            icon={<UsersIcon className="text-slate-500" size={20} />}
          />
          <StatCard
            label={lang === "fr" ? "Abonnements impayés" : "Unpaid subscriptions"}
            value={overviewLoading ? "—" : metrics?.unpaid_subscriptions_count ?? 0}
            icon={<CreditCardIcon className="text-slate-500" size={20} />}
          />
          <StatCard
            label={lang === "fr" ? "Sinistres en attente" : "Pending claims"}
            value={overviewLoading ? "—" : metrics?.pending_claims_count ?? 0}
            icon={<ShieldCheckIcon className="text-slate-500" size={20} />}
          />
          <StatCard
            label={lang === "fr" ? "Réparations actives" : "Repairs in progress"}
            value={overviewLoading ? "—" : metrics?.repairs_in_progress_count ?? 0}
            icon={<WrenchIcon className="text-slate-500" size={20} />}
          />
          <StatCard
            label={lang === "fr" ? "IMEI manquants" : "Missing IMEIs"}
            value={overviewLoading ? "—" : metrics?.missing_imei_count ?? 0}
            icon={<SettingsIcon className="text-slate-500" size={20} />}
          />
        </div>

        <div className="mt-8 mb-6 flex w-fit flex-wrap gap-1 rounded-full bg-slate-100 p-1">
          {(
            [
              "overview",
              "clients",
              "payments",
              "claims",
              "repairs",
              "tasks",
            ] as EmployeeTab[]
          ).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                tab === value
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-500 hover:text-indigo-950",
              )}
            >
              {tabLabel(value, lang)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            {overviewError ? (
              <DashboardErrorCard lang={lang} />
            ) : (
              <>
                <div className="grid gap-6 xl:grid-cols-2">
                  <PanelShell
                    title={lang === "fr" ? "Tâches urgentes" : "Urgent tasks"}
                    subtitle={
                      lang === "fr"
                        ? "Les éléments les plus prioritaires du jour."
                        : "The most urgent items in the queue."
                    }
                  >
                    {overviewLoading ? (
                      <StackedSkeleton />
                    ) : overview?.urgent_tasks.length ? (
                      <div className="space-y-3">
                        {overview.urgent_tasks.map((task) => (
                          <TaskCard key={task.id} task={task} lang={lang} compact />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title={lang === "fr" ? "Aucune urgence ouverte" : "No urgent items"}
                        description={
                          lang === "fr"
                            ? "Les suivis prioritaires apparaîtront ici."
                            : "High-priority follow-up items will appear here."
                        }
                      />
                    )}
                  </PanelShell>

                  <PanelShell
                    title={lang === "fr" ? "Paiements à suivre" : "Payments to follow up"}
                    subtitle={
                      lang === "fr"
                        ? "Paiements échoués, en attente et activations bloquées."
                        : "Failed, pending, and blocked activation cases."
                    }
                  >
                    {overviewLoading ? (
                      <StackedSkeleton />
                    ) : overview?.payment_follow_ups.length ? (
                      <div className="space-y-3">
                        {overview.payment_follow_ups.map((item) => (
                          <PaymentCard key={item.subscription?.id ?? `${item.user_id}-${item.device.id}`} item={item} lang={lang} compact />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title={lang === "fr" ? "Aucun impayé prioritaire" : "No urgent payment follow-up"}
                        description={
                          lang === "fr"
                            ? "Les cas nécessitant un suivi apparaîtront ici."
                            : "Items needing payment follow-up will appear here."
                        }
                      />
                    )}
                  </PanelShell>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <PanelShell
                    title={lang === "fr" ? "Sinistres à traiter" : "Claims to process"}
                  >
                    {overviewLoading ? (
                      <StackedSkeleton />
                    ) : overview?.pending_claims.length ? (
                      <div className="space-y-3">
                        {overview.pending_claims.map((item) => (
                          <ClaimCard key={item.claim.id} item={item} lang={lang} compact />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title={lang === "fr" ? "Aucun sinistre ouvert" : "No open claims"}
                        description={
                          lang === "fr"
                            ? "Les sinistres en attente ou en revue apparaîtront ici."
                            : "Pending and in-review claims will appear here."
                        }
                      />
                    )}
                  </PanelShell>

                  <PanelShell
                    title={lang === "fr" ? "Réparations actives" : "Active repairs"}
                  >
                    {overviewLoading ? (
                      <StackedSkeleton />
                    ) : overview?.active_repairs.length ? (
                      <div className="space-y-3">
                        {overview.active_repairs.map((item) => (
                          <RepairCard key={item.repair.id} item={item} lang={lang} compact />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title={lang === "fr" ? "Aucune réparation ouverte" : "No active repairs"}
                        description={
                          lang === "fr"
                            ? "Les réparations planifiées et en cours apparaîtront ici."
                            : "Scheduled and in-progress repairs will appear here."
                        }
                      />
                    )}
                  </PanelShell>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "clients" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <PanelShell
              title={lang === "fr" ? "Clients" : "Clients"}
              actions={
                <Input
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  placeholder={lang === "fr" ? "Rechercher un client..." : "Search clients..."}
                  className="min-w-[240px]"
                />
              }
            >
              {clientsLoading ? (
                <StackedSkeleton />
              ) : clientsError ? (
                <InlineError lang={lang} />
              ) : clients.length ? (
                <div className="space-y-3">
                  {clients.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedClientId(item.id)}
                      className={cn(
                        "w-full cursor-pointer rounded-[1.35rem] border px-4 py-4 text-left transition-all",
                        item.id === activeClientId
                          ? "border-indigo-300 bg-indigo-50/70 shadow-sm"
                          : "border-slate-200/80 bg-white hover:border-slate-300",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-indigo-950">
                            {item.full_name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                        </div>
                        <StatusBadge
                          status={item.latest_coverage_status}
                          label={coverageStatusLabel(item.latest_coverage_status, lang)}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>
                          {lang === "fr" ? "Appareils" : "Devices"}: {item.device_count}
                        </span>
                        <span>
                          {lang === "fr" ? "Actifs" : "Active"}: {item.active_subscription_count}
                        </span>
                        <span>
                          {lang === "fr" ? "Sinistres" : "Claims"}: {item.pending_claims_count}
                        </span>
                        <span>
                          {lang === "fr" ? "Réparations" : "Repairs"}: {item.open_repairs_count}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.follow_up?.status && (
                          <StatusBadge
                            status={item.follow_up.status}
                            label={followUpStatusLabel(item.follow_up.status, lang)}
                          />
                        )}
                        {item.requires_attention && (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                            {lang === "fr" ? "Action requise" : "Action required"}
                          </span>
                        )}
                        {item.partner_store_name && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            {item.partner_store_name}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Aucun client trouvé" : "No clients found"}
                  description={
                    lang === "fr"
                      ? "Essayez un autre nom, email ou numéro."
                      : "Try another name, email, or phone number."
                  }
                />
              )}
            </PanelShell>

            <PanelShell
              title={lang === "fr" ? "Fiche client" : "Client profile"}
              subtitle={
                lang === "fr"
                  ? "Vue opérationnelle complète du client sélectionné."
                  : "Full operational view of the selected client."
              }
            >
              {clientDetailLoading ? (
                <StackedSkeleton />
              ) : selectedClient ? (
                <ClientDetailPanel detail={selectedClient} lang={lang} />
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Sélectionnez un client" : "Select a client"}
                  description={
                    lang === "fr"
                      ? "Choisissez un client dans la liste pour afficher ses abonnements, paiements, sinistres et réparations."
                      : "Choose a client to review subscriptions, payments, claims, and repairs."
                  }
                />
              )}
            </PanelShell>
          </div>
        )}

        {tab === "payments" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <PanelShell
              title={lang === "fr" ? "Paiements / Suivi" : "Payments / Follow-up"}
              actions={
                <Input
                  value={paymentSearch}
                  onChange={(event) => setPaymentSearch(event.target.value)}
                  placeholder={lang === "fr" ? "Rechercher un client ou un appareil..." : "Search a client or device..."}
                  className="min-w-[260px]"
                />
              }
            >
              {paymentsLoading ? (
                <StackedSkeleton />
              ) : paymentsError ? (
                <InlineError lang={lang} />
              ) : paymentFollowUps.length ? (
                <div className="space-y-3">
                  {paymentFollowUps.map((item) => {
                    const subscriptionId = item.subscription?.id;
                    if (!subscriptionId) return null;

                    return (
                      <button
                        key={subscriptionId}
                        type="button"
                        onClick={() => setSelectedPaymentSubscriptionId(subscriptionId)}
                        className={cn(
                          "w-full cursor-pointer rounded-[1.35rem] border px-4 py-4 text-left transition-all",
                          activePaymentSubscriptionId === subscriptionId
                            ? "border-indigo-300 bg-indigo-50/70 shadow-sm"
                            : "border-slate-200/80 bg-white hover:border-slate-300",
                        )}
                      >
                        <PaymentCard item={item} lang={lang} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Aucun paiement à suivre" : "No payment follow-up items"}
                  description={
                    lang === "fr"
                      ? "Les abonnements avec impayés, échecs ou blocages d’activation apparaîtront ici."
                      : "Subscriptions with unpaid, failed, or blocked activation issues will appear here."
                  }
                />
              )}
            </PanelShell>

            <PanelShell
              title={lang === "fr" ? "Détail abonnement / paiement" : "Subscription / payment detail"}
            >
              {selectedPaymentItem ? (
                <PaymentDetailPanel item={selectedPaymentItem} lang={lang} />
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Sélectionnez un dossier" : "Select an item"}
                  description={
                    lang === "fr"
                      ? "Choisissez un abonnement pour piloter son suivi."
                      : "Choose a subscription item to manage follow-up."
                  }
                />
              )}
            </PanelShell>
          </div>
        )}

        {tab === "claims" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <PanelShell
              title={lang === "fr" ? "Sinistres" : "Claims"}
              actions={
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={claimSearch}
                    onChange={(event) => setClaimSearch(event.target.value)}
                    placeholder={lang === "fr" ? "Rechercher..." : "Search..."}
                    className="min-w-[220px]"
                  />
                  <Select
                    value={claimStatus}
                    onChange={(event) =>
                      setClaimStatus(event.target.value as ClaimStatus | "")
                    }
                    className="min-w-[180px]"
                  >
                    <option value="">{lang === "fr" ? "Tous les statuts" : "All statuses"}</option>
                    {["pending", "review", "approved", "rejected", "settled"].map((value) => (
                      <option key={value} value={value}>
                        {claimStatusLabel(value, lang)}
                      </option>
                    ))}
                  </Select>
                </div>
              }
            >
              {claimsLoading ? (
                <StackedSkeleton />
              ) : claimsError ? (
                <InlineError lang={lang} />
              ) : claimItems.length ? (
                <div className="space-y-3">
                  {claimItems.map((item) => (
                    <button
                      key={item.claim.id}
                      type="button"
                      onClick={() => setSelectedClaimId(item.claim.id)}
                      className={cn(
                        "w-full cursor-pointer rounded-[1.35rem] border px-4 py-4 text-left transition-all",
                        activeClaimId === item.claim.id
                          ? "border-indigo-300 bg-indigo-50/70 shadow-sm"
                          : "border-slate-200/80 bg-white hover:border-slate-300",
                      )}
                    >
                      <ClaimCard item={item} lang={lang} />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Aucun sinistre trouvé" : "No claims found"}
                  description={
                    lang === "fr"
                      ? "Ajustez vos filtres ou réessayez plus tard."
                      : "Adjust your filters or try again later."
                  }
                />
              )}
            </PanelShell>

            <PanelShell title={lang === "fr" ? "Détail sinistre" : "Claim detail"}>
              {claimDetailLoading ? (
                <StackedSkeleton />
              ) : selectedClaim ? (
                <ClaimDetailPanel
                  item={selectedClaim}
                  lang={lang}
                  onMoveToReview={handleMoveClaimToReview}
                  updating={updateClaimStatus.isPending}
                />
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Sélectionnez un sinistre" : "Select a claim"}
                  description={
                    lang === "fr"
                      ? "Choisissez un dossier pour voir le client, l’appareil, la couverture et les notes internes."
                      : "Choose a claim to view client, device, coverage, and internal notes."
                  }
                />
              )}
            </PanelShell>
          </div>
        )}

        {tab === "repairs" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <PanelShell
              title={lang === "fr" ? "Réparations" : "Repairs"}
              actions={
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={repairSearch}
                    onChange={(event) => setRepairSearch(event.target.value)}
                    placeholder={lang === "fr" ? "Rechercher..." : "Search..."}
                    className="min-w-[220px]"
                  />
                  <Select
                    value={repairStatus}
                    onChange={(event) =>
                      setRepairStatus(
                        event.target.value as RepairRequestStatus | "",
                      )
                    }
                    className="min-w-[180px]"
                  >
                    <option value="">{lang === "fr" ? "Tous les statuts" : "All statuses"}</option>
                    {[
                      "pending",
                      "accepted",
                      "rejected",
                      "scheduled",
                      "in_progress",
                      "completed",
                      "cancelled",
                    ].map((value) => (
                      <option key={value} value={value}>
                        {repairStatusLabel(value as RepairRequestStatus, lang)}
                      </option>
                    ))}
                  </Select>
                </div>
              }
            >
              {repairsLoading ? (
                <StackedSkeleton />
              ) : repairsError ? (
                <InlineError lang={lang} />
              ) : repairItems.length ? (
                <div className="space-y-3">
                  {repairItems.map((item) => (
                    <button
                      key={item.repair.id}
                      type="button"
                      onClick={() => setSelectedRepairId(item.repair.id)}
                      className={cn(
                        "w-full cursor-pointer rounded-[1.35rem] border px-4 py-4 text-left transition-all",
                        activeRepairId === item.repair.id
                          ? "border-indigo-300 bg-indigo-50/70 shadow-sm"
                          : "border-slate-200/80 bg-white hover:border-slate-300",
                      )}
                    >
                      <RepairCard item={item} lang={lang} />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Aucune réparation trouvée" : "No repairs found"}
                  description={
                    lang === "fr"
                      ? "Les demandes de réparation apparaîtront ici."
                      : "Repair requests will appear here."
                  }
                />
              )}
            </PanelShell>

            <PanelShell title={lang === "fr" ? "Détail réparation" : "Repair detail"}>
              {repairDetailLoading ? (
                <StackedSkeleton />
              ) : selectedRepair ? (
                <div className="space-y-6">
                  <RepairDetailPanel item={selectedRepair} lang={lang} />

                  <RepairUpdateControls
                    key={selectedRepair.repair.id}
                    item={selectedRepair}
                    lang={lang}
                    onSaveStatus={handleSaveRepairStatus}
                    loading={updateRepairStatus.isPending}
                    onSaveAmount={handleSaveRepairAmount}
                    amountLoading={updateRepairAmount.isPending}
                  />

                  <OperationalWorkbench
                    entityType="repair"
                    entityId={selectedRepair.repair.id}
                    title={lang === "fr" ? "Suivi opérationnel" : "Operational follow-up"}
                    subtitle={selectedRepair.repair.reference}
                    contactEmail={selectedRepair.client_email}
                    contactPhone={selectedRepair.repair.customer_phone}
                    lang={lang}
                  />
                </div>
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Sélectionnez une réparation" : "Select a repair"}
                  description={
                    lang === "fr"
                      ? "Choisissez une demande pour mettre à jour son statut, le devis et le suivi."
                      : "Choose a repair request to update status, quote, and follow-up."
                  }
                />
              )}
            </PanelShell>
          </div>
        )}

        {tab === "tasks" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <PanelShell
              title={lang === "fr" ? "File d’actions" : "Action queue"}
              subtitle={
                lang === "fr"
                  ? "Priorités générées à partir des impayés, sinistres, réparations et suivis manuels."
                  : "Priorities generated from unpaid subscriptions, claims, repairs, and manual follow-ups."
              }
            >
              {tasksLoading ? (
                <StackedSkeleton />
              ) : tasksError ? (
                <InlineError lang={lang} />
              ) : tasks.length ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn(
                        "w-full cursor-pointer rounded-[1.35rem] border px-4 py-4 text-left transition-all",
                        activeTaskId === task.id
                          ? "border-indigo-300 bg-indigo-50/70 shadow-sm"
                          : "border-slate-200/80 bg-white hover:border-slate-300",
                      )}
                    >
                      <TaskCard task={task} lang={lang} />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Aucune tâche active" : "No active tasks"}
                  description={
                    lang === "fr"
                      ? "La file se remplira dès qu’un suivi opérationnel sera nécessaire."
                      : "The queue will populate as soon as operational follow-up is needed."
                  }
                />
              )}
            </PanelShell>

            <PanelShell title={lang === "fr" ? "Suivi de la tâche" : "Task follow-up"}>
              {selectedTask ? (
                <div className="space-y-6">
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-indigo-950">
                          {selectedTask.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedTask.description}
                        </p>
                      </div>
                      <PriorityBadge priority={selectedTask.priority} lang={lang} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        {reasonLabel(selectedTask.reason, lang)}
                      </span>
                      {selectedTask.follow_up_status && (
                        <StatusBadge
                          status={selectedTask.follow_up_status}
                          label={followUpStatusLabel(selectedTask.follow_up_status, lang)}
                        />
                      )}
                    </div>
                    <div className="mt-4">
                      <ContactActions
                        email={selectedTask.client_email}
                        phone={selectedTask.client_phone}
                        lang={lang}
                      />
                    </div>
                  </div>

                  <OperationalWorkbench
                    entityType={selectedTask.entity_type}
                    entityId={selectedTask.entity_id}
                    title={lang === "fr" ? "Traitement opérationnel" : "Operational handling"}
                    subtitle={reasonLabel(selectedTask.reason, lang)}
                    contactEmail={selectedTask.client_email}
                    contactPhone={selectedTask.client_phone}
                    lang={lang}
                  />
                </div>
              ) : (
                <EmptyState
                  title={lang === "fr" ? "Sélectionnez une tâche" : "Select a task"}
                  description={
                    lang === "fr"
                      ? "Choisissez une ligne de la file pour piloter son suivi."
                      : "Choose an item from the queue to manage its follow-up."
                  }
                />
              )}
            </PanelShell>
          </div>
        )}
      </div>
    </div>
  );
}

function PanelShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-indigo-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function DashboardErrorCard({ lang }: { lang: "fr" | "en" }) {
  return (
    <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
      {lang === "fr"
        ? "Impossible de charger le tableau de bord employé pour le moment."
        : "We could not load the employee dashboard right now."}
    </div>
  );
}

function InlineError({ lang }: { lang: "fr" | "en" }) {
  return (
    <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {lang === "fr"
        ? "Une erreur est survenue lors du chargement de cette section."
        : "An error occurred while loading this section."}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-indigo-950">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function StackedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/60 p-4"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function DetailSection({
  title,
  subtitle,
  actions,
  defaultOpen = true,
  collapsible = true,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {collapsible ? (
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-indigo-950"
              aria-expanded={open}
            >
              <ChevronToggle open={open} />
              <span className="sr-only">Toggle section</span>
            </button>
          ) : null}
        </div>
      </div>
      {open || !collapsible ? (
        <div className="border-t border-slate-100 px-5 py-5">{children}</div>
      ) : null}
    </section>
  );
}

function DetailCard({
  title,
  subtitle,
  children,
  tone = "soft",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  tone?: "soft" | "plain";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border p-4",
        tone === "soft"
          ? "border-slate-200/80 bg-slate-50/80"
          : "border-slate-200/80 bg-white",
      )}
    >
      {title ? (
        <div className="mb-3">
          <p className="text-sm font-semibold text-indigo-950">{title}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function ChevronToggle({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0")}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1rem] border border-slate-200/70 bg-white px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-6 text-indigo-950">{value}</p>
    </div>
  );
}

function ClientDetailPanel({
  detail,
  lang,
}: {
  detail: EmployeeClientDetail;
  lang: "fr" | "en";
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-indigo-950">
                {detail.full_name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{detail.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {detail.phone ? (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {detail.phone}
                </span>
              ) : null}
              {detail.partner_store_name ? (
                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  {lang === "fr" ? "Enrôlé par" : "Enrolled by"} {detail.partner_store_name}
                </span>
              ) : null}
            </div>
          </div>
          <ContactActions email={detail.email} phone={detail.phone} lang={lang} />
        </div>
      </div>

      <InfoGrid
        items={[
          {
            label: lang === "fr" ? "Appareils" : "Devices",
            value: String(detail.devices.length),
          },
          {
            label: lang === "fr" ? "Abonnements suivis" : "Tracked subscriptions",
            value: String(detail.payment_follow_ups.length),
          },
          {
            label: lang === "fr" ? "Sinistres" : "Claims",
            value: String(detail.claims.length),
          },
          {
            label: lang === "fr" ? "Réparations" : "Repairs",
            value: String(detail.repairs.length),
          },
        ]}
      />

      <DetailSection
        title={lang === "fr" ? "Appareils couverts" : "Covered devices"}
        subtitle={
          lang === "fr"
            ? "Consultez les appareils actifs, leur couverture et les blocages éventuels."
            : "Review covered devices, current coverage, and activation blockers."
        }
        defaultOpen
      >
        <div className="space-y-3">
          {detail.devices.length ? (
            detail.devices.map((item) => (
              <DetailCard key={item.device.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-indigo-950">
                      {item.device.brand} {item.device.model}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.device.device_type}{" "}
                      {item.device.imei
                        ? `• IMEI ${item.device.imei}`
                        : lang === "fr"
                          ? "• IMEI manquant"
                          : "• IMEI missing"}
                    </p>
                  </div>
                  <StatusBadge
                    status={item.coverage_status}
                    label={coverageStatusLabel(item.coverage_status, lang)}
                  />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <MetaItem
                    label={lang === "fr" ? "Formule" : "Plan"}
                    value={item.plan_name_fr || item.plan_name_en || "—"}
                  />
                  <MetaItem
                    label={lang === "fr" ? "Statut abonnement" : "Subscription status"}
                    value={
                      item.subscription
                        ? subscriptionStatusLabel(item.subscription.status, lang)
                        : "—"
                    }
                  />
                  <MetaItem
                    label={lang === "fr" ? "Paiement" : "Payment"}
                    value={
                      item.payment ? paymentStatusLabel(item.payment.status, lang) : "—"
                    }
                  />
                  <MetaItem
                    label={lang === "fr" ? "Dernière mise à jour" : "Updated"}
                    value={formatDateTime(item.device.updated_at, lang)}
                  />
                </div>
              </DetailCard>
            ))
          ) : (
            <EmptyState
              title={lang === "fr" ? "Aucun appareil" : "No devices"}
              description={
                lang === "fr"
                  ? "Ce client n’a pas encore d’appareil lié."
                  : "This client does not have linked devices yet."
              }
            />
          )}
        </div>
      </DetailSection>

      <DetailSection
        title={lang === "fr" ? "Paiements / abonnements" : "Payments / subscriptions"}
        subtitle={
          lang === "fr"
            ? "Historique des paiements et statut de couverture associé."
            : "Payment history and related coverage status."
        }
        defaultOpen
      >
        <div className="space-y-3">
          {detail.payment_follow_ups.length ? (
            detail.payment_follow_ups.map((item) => (
              <DetailCard
                key={item.subscription?.id ?? `${item.user_id}-${item.device.id}`}
              >
                <PaymentCard item={item} lang={lang} />
              </DetailCard>
            ))
          ) : (
            <EmptyState
              title={lang === "fr" ? "Aucun abonnement" : "No subscriptions"}
              description={
                lang === "fr"
                  ? "Aucun historique d’abonnement disponible."
                  : "No subscription history available."
              }
            />
          )}
        </div>
      </DetailSection>

      <DetailSection
        title={lang === "fr" ? "Sinistres" : "Claims"}
        subtitle={
          lang === "fr"
            ? "Demandes déclarées par le client et état de traitement."
            : "Client claims and current processing state."
        }
        defaultOpen={false}
      >
        <div className="space-y-3">
          {detail.claims.length ? (
            detail.claims.map((item) => (
              <DetailCard key={item.claim.id}>
                <ClaimCard item={item} lang={lang} />
              </DetailCard>
            ))
          ) : (
            <EmptyState
              title={lang === "fr" ? "Aucun sinistre" : "No claims"}
              description={
                lang === "fr"
                  ? "Aucune demande enregistrée pour ce client."
                  : "No claim history for this client yet."
              }
            />
          )}
        </div>
      </DetailSection>

      <DetailSection
        title={lang === "fr" ? "Réparations" : "Repairs"}
        subtitle={
          lang === "fr"
            ? "Réparations liées au client, avec leur progression et leur devis."
            : "Client-linked repairs with progress and quoted amount."
        }
        defaultOpen={false}
      >
        <div className="space-y-3">
          {detail.repairs.length ? (
            detail.repairs.map((item) => (
              <DetailCard key={item.repair.id}>
                <RepairCard item={item} lang={lang} />
              </DetailCard>
            ))
          ) : (
            <EmptyState
              title={lang === "fr" ? "Aucune réparation" : "No repairs"}
              description={
                lang === "fr"
                  ? "Aucune demande de réparation liée à ce client."
                  : "No repair requests linked to this client."
              }
            />
          )}
        </div>
      </DetailSection>

      <OperationalWorkbench
        entityType="client"
        entityId={detail.id}
        title={lang === "fr" ? "Suivi client" : "Client follow-up"}
        subtitle={detail.full_name}
        contactEmail={detail.email}
        contactPhone={detail.phone}
        lang={lang}
      />
    </div>
  );
}

function PaymentDetailPanel({
  item,
  lang,
}: {
  item: EmployeePaymentFollowUpItem;
  lang: "fr" | "en";
}) {
  const entityId = item.subscription?.id;

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-indigo-950">
              {item.client_name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {item.device.brand} {item.device.model}
            </p>
          </div>
          <StatusBadge
            status={item.coverage_status}
            label={coverageStatusLabel(item.coverage_status, lang)}
          />
        </div>
        <div className="mt-4">
          <ContactActions
            email={item.client_email}
            phone={item.client_phone}
            lang={lang}
          />
        </div>
      </div>

      <InfoGrid
        items={[
          {
            label: lang === "fr" ? "Contexte" : "Context",
            value:
              item.payment_context === "first_payment"
                ? lang === "fr"
                  ? "Premier paiement"
                  : "First payment"
                : lang === "fr"
                  ? "Renouvellement"
                  : "Renewal",
          },
          {
            label: lang === "fr" ? "Raison" : "Reason",
            value: reasonLabel(item.attention_reason, lang),
          },
          {
            label: lang === "fr" ? "Paiement" : "Payment",
            value: item.payment ? paymentStatusLabel(item.payment.status, lang) : "—",
          },
          {
            label: lang === "fr" ? "Formule" : "Plan",
            value: item.plan_name_fr || item.plan_name_en || "—",
          },
        ]}
      />

      <DetailSection
        title={lang === "fr" ? "Abonnement et activation" : "Subscription and activation"}
        subtitle={
          lang === "fr"
            ? "Retrouvez le contexte de paiement et les informations nécessaires au suivi."
            : "Review billing context and the information needed for follow-up."
        }
        defaultOpen
      >
        <div className="grid gap-3 md:grid-cols-2">
          <MetaItem
            label={lang === "fr" ? "ID abonnement" : "Subscription ID"}
            value={item.subscription?.id ?? "—"}
          />
          <MetaItem
            label={lang === "fr" ? "Statut" : "Status"}
            value={
              item.subscription
                ? subscriptionStatusLabel(item.subscription.status, lang)
                : "—"
            }
          />
          <MetaItem
            label={lang === "fr" ? "Période" : "Billing cycle"}
            value={
              item.subscription?.billing_cycle === "annual"
                ? lang === "fr"
                  ? "Annuel"
                  : "Annual"
                : lang === "fr"
                  ? "Mensuel"
                  : "Monthly"
            }
          />
          <MetaItem
            label={lang === "fr" ? "Partenaire" : "Partner"}
            value={item.partner_store_name ?? "—"}
          />
        </div>
      </DetailSection>

      {entityId && (
        <OperationalWorkbench
          entityType="subscription"
          entityId={entityId}
          title={lang === "fr" ? "Suivi paiement / abonnement" : "Payment / subscription follow-up"}
          subtitle={item.device.brand + " " + item.device.model}
          contactEmail={item.client_email}
          contactPhone={item.client_phone}
          lang={lang}
        />
      )}
    </div>
  );
}

function ClaimDetailPanel({
  item,
  lang,
  onMoveToReview,
  updating,
}: {
  item: EmployeeClaimDetail;
  lang: "fr" | "en";
  onMoveToReview: (claimId: string) => Promise<void>;
  updating: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-indigo-950">
              {item.client_name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {claimTypeLabel(item.claim.claim_type, lang)} • {item.device_brand}{" "}
              {item.device_model}
            </p>
          </div>
          <StatusBadge
            status={item.claim.status}
            label={claimStatusLabel(item.claim.status, lang)}
          />
        </div>
        <div className="mt-4">
          <ContactActions
            email={item.client_email}
            phone={item.client_phone}
            lang={lang}
          />
        </div>
      </div>

      <InfoGrid
        items={[
          {
            label: lang === "fr" ? "Couverture" : "Coverage",
            value: coverageStatusLabel(item.coverage_status, lang),
          },
          {
            label: lang === "fr" ? "Abonnement" : "Subscription",
            value: subscriptionStatusLabel(item.subscription_status, lang),
          },
          {
            label: lang === "fr" ? "Formule" : "Plan",
            value: item.plan_name_fr || item.plan_name_en || "—",
          },
          {
            label: lang === "fr" ? "Montant" : "Amount",
            value:
              item.claim.amount_xof !== undefined
                ? formatXOF(item.claim.amount_xof)
                : "—",
          },
        ]}
      />

      {item.claim.description && (
        <DetailSection
          title={lang === "fr" ? "Description du sinistre" : "Claim description"}
          subtitle={
            lang === "fr"
              ? "Résumé déclaré par le client ou par l’équipe."
              : "Summary provided by the client or the operations team."
          }
          defaultOpen
        >
          <p className="text-sm leading-6 text-slate-600">{item.claim.description}</p>
        </DetailSection>
      )}

      {item.claim.status === "pending" && (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {lang === "fr"
                  ? "Passer ce sinistre en revue"
                  : "Move this claim into review"}
              </p>
              <p className="mt-1 text-sm text-amber-800/80">
                {lang === "fr"
                  ? "Cette action confirme que l’équipe opérations a pris le dossier en charge."
                  : "This marks the claim as taken in charge by operations."}
              </p>
            </div>
            <Button
              variant="primary"
              loading={updating}
              onClick={() => onMoveToReview(item.claim.id)}
            >
              {lang === "fr" ? "Mettre en revue" : "Move to review"}
            </Button>
          </div>
        </div>
      )}

      <OperationalWorkbench
        entityType="claim"
        entityId={item.claim.id}
        title={lang === "fr" ? "Suivi du sinistre" : "Claim follow-up"}
        subtitle={claimTypeLabel(item.claim.claim_type, lang)}
        contactEmail={item.client_email}
        contactPhone={item.client_phone}
        lang={lang}
      />
    </div>
  );
}

function RepairDetailPanel({
  item,
  lang,
}: {
  item: EmployeeRepairDetail;
  lang: "fr" | "en";
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-indigo-950">
              {item.repair.customer_name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {item.repair.device_brand} {item.repair.device_model}
            </p>
          </div>
          <StatusBadge
            status={item.repair.status}
            label={repairStatusLabel(item.repair.status, lang)}
          />
        </div>
        <div className="mt-4">
          <ContactActions
            email={item.client_email}
            phone={item.repair.customer_phone}
            lang={lang}
          />
        </div>
      </div>

      <InfoGrid
        items={[
          {
            label: lang === "fr" ? "Référence" : "Reference",
            value: item.repair.reference,
          },
          {
            label: lang === "fr" ? "Type de réparation" : "Repair type",
            value: item.repair.repair_type,
          },
          {
            label: lang === "fr" ? "Mode" : "Service mode",
            value:
              item.repair.service_mode === "home"
                ? lang === "fr"
                  ? "À domicile"
                  : "At home"
                : lang === "fr"
                  ? "En centre"
                  : "In store",
          },
          {
            label: lang === "fr" ? "Montant" : "Amount",
            value:
              item.repair.repair_amount_xof !== undefined
                ? formatXOF(item.repair.repair_amount_xof)
                : "—",
          },
        ]}
      />

      <DetailSection
        title={lang === "fr" ? "Planification" : "Scheduling"}
        subtitle={
          lang === "fr"
            ? "Créneau demandé, planification confirmée et partenaire associé."
            : "Requested slot, confirmed scheduling, and assigned partner."
        }
        defaultOpen
      >
        <div className="grid gap-3 md:grid-cols-2">
          <MetaItem
            label={lang === "fr" ? "Préférence client" : "Requested slot"}
            value={`${formatShortDate(item.repair.preferred_date, lang)} • ${item.repair.preferred_time}`}
          />
          <MetaItem
            label={lang === "fr" ? "Créée le" : "Created"}
            value={formatDateTime(item.repair.created_at, lang)}
          />
          <MetaItem
            label={lang === "fr" ? "Planifiée pour" : "Scheduled for"}
            value={
              item.repair.scheduled_date
                ? `${formatShortDate(item.repair.scheduled_date, lang)} • ${item.repair.scheduled_time ?? "—"}`
                : "—"
            }
          />
          <MetaItem
            label={lang === "fr" ? "Partenaire" : "Partner"}
            value={item.partner_store_name ?? "—"}
          />
        </div>
      </DetailSection>
    </div>
  );
}

function RepairUpdateControls({
  item,
  lang,
  onSaveStatus,
  loading,
  onSaveAmount,
  amountLoading,
}: {
  item: EmployeeRepairDetail;
  lang: "fr" | "en";
  onSaveStatus: (
    nextStatus: UpdateRepairRequestStatus["status"],
    scheduledDate: string,
    scheduledTime: string,
  ) => Promise<void>;
  loading: boolean;
  onSaveAmount: (amount: string) => Promise<void>;
  amountLoading: boolean;
}) {
  const [repairStatusForm, setRepairStatusForm] =
    useState<UpdateRepairRequestStatus["status"]>(
      item.repair.status === "pending"
        ? "accepted"
        : (item.repair.status as UpdateRepairRequestStatus["status"]),
    );
  const [repairScheduledDate, setRepairScheduledDate] = useState(
    item.repair.scheduled_date ?? "",
  );
  const [repairScheduledTime, setRepairScheduledTime] = useState(
    item.repair.scheduled_time ?? "",
  );
  const [repairAmount, setRepairAmount] = useState(
    item.repair.repair_amount_xof
      ? String(item.repair.repair_amount_xof)
      : "",
  );

  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <SectionTitle title={lang === "fr" ? "Actions de mise à jour" : "Update actions"} />
        <p className="mt-1 text-sm text-slate-500">
          {lang === "fr"
            ? "Séparez ici la progression de la réparation et la mise à jour du devis."
            : "Manage repair progression and quote updates separately here."}
        </p>
      </div>
      <div className="grid gap-4 rounded-[1.25rem] border border-slate-200/70 bg-slate-50/80 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={lang === "fr" ? "Nouveau statut" : "Next status"}>
          <Select
            value={repairStatusForm}
            onChange={(event) =>
              setRepairStatusForm(
                event.target.value as UpdateRepairRequestStatus["status"],
              )
            }
          >
            {REPAIR_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {repairStatusLabel(status, lang)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label={lang === "fr" ? "Montant devis (XOF)" : "Quoted amount (XOF)"}
        >
          <Input
            type="number"
            min="0"
            value={repairAmount}
            onChange={(event) => setRepairAmount(event.target.value)}
            placeholder="25000"
          />
        </FormField>
      </div>

      {repairStatusForm === "scheduled" && (
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={lang === "fr" ? "Date prévue" : "Scheduled date"}>
            <Input
              type="date"
              value={repairScheduledDate}
              onChange={(event) => setRepairScheduledDate(event.target.value)}
            />
          </FormField>
          <FormField label={lang === "fr" ? "Heure prévue" : "Scheduled time"}>
            <Input
              type="time"
              value={repairScheduledTime}
              onChange={(event) => setRepairScheduledTime(event.target.value)}
            />
          </FormField>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={() =>
            onSaveStatus(repairStatusForm, repairScheduledDate, repairScheduledTime)
          }
          loading={loading}
        >
          {lang === "fr" ? "Mettre à jour le statut" : "Update status"}
        </Button>
        <Button
          variant="outline"
          onClick={() => onSaveAmount(repairAmount)}
          loading={amountLoading}
        >
          {lang === "fr" ? "Enregistrer le montant" : "Save amount"}
        </Button>
      </div>
      </div>
    </div>
  );
}

function PaymentCard({
  item,
  lang,
  compact = false,
}: {
  item: EmployeePaymentFollowUpItem;
  lang: "fr" | "en";
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        compact &&
          "rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-indigo-950">{item.client_name}</p>
          <p className="mt-1 text-sm text-slate-500">
            {item.device.brand} {item.device.model}
          </p>
        </div>
        <StatusBadge
          status={item.coverage_status}
          label={coverageStatusLabel(item.coverage_status, lang)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          {reasonLabel(item.attention_reason, lang)}
        </span>
        {item.follow_up?.status && (
          <StatusBadge
            status={item.follow_up.status}
            label={followUpStatusLabel(item.follow_up.status, lang)}
          />
        )}
        {item.partner_store_name && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            {item.partner_store_name}
          </span>
        )}
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <MetaItem
          label={lang === "fr" ? "Paiement" : "Payment"}
          value={item.payment ? paymentStatusLabel(item.payment.status, lang) : "—"}
        />
        <MetaItem
          label={lang === "fr" ? "Contexte" : "Context"}
          value={
            item.payment_context === "first_payment"
              ? lang === "fr"
                ? "Premier paiement"
                : "First payment"
              : lang === "fr"
                ? "Renouvellement"
                : "Renewal"
          }
        />
      </div>
    </div>
  );
}

function ClaimCard({
  item,
  lang,
  compact = false,
}: {
  item: EmployeeClaimDetail;
  lang: "fr" | "en";
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        compact &&
          "rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-indigo-950">{item.client_name}</p>
          <p className="mt-1 text-sm text-slate-500">
            {claimTypeLabel(item.claim.claim_type, lang)} • {item.device_brand}{" "}
            {item.device_model}
          </p>
        </div>
        <StatusBadge
          status={item.claim.status}
          label={claimStatusLabel(item.claim.status, lang)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {item.follow_up?.status && (
          <StatusBadge
            status={item.follow_up.status}
            label={followUpStatusLabel(item.follow_up.status, lang)}
          />
        )}
        {item.partner_store_name && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            {item.partner_store_name}
          </span>
        )}
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <MetaItem
          label={lang === "fr" ? "Déposé le" : "Filed"}
          value={formatDateTime(item.claim.filed_at, lang)}
        />
        <MetaItem
          label={lang === "fr" ? "Couverture" : "Coverage"}
          value={coverageStatusLabel(item.coverage_status, lang)}
        />
      </div>
    </div>
  );
}

function RepairCard({
  item,
  lang,
  compact = false,
}: {
  item: EmployeeRepairDetail;
  lang: "fr" | "en";
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        compact &&
          "rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-indigo-950">
            {item.repair.customer_name}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {item.repair.reference} • {item.repair.device_brand}{" "}
            {item.repair.device_model}
          </p>
        </div>
        <StatusBadge
          status={item.repair.status}
          label={repairStatusLabel(item.repair.status, lang)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {item.follow_up?.status && (
          <StatusBadge
            status={item.follow_up.status}
            label={followUpStatusLabel(item.follow_up.status, lang)}
          />
        )}
        {item.partner_store_name && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            {item.partner_store_name}
          </span>
        )}
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <MetaItem
          label={lang === "fr" ? "Créée le" : "Created"}
          value={formatDateTime(item.repair.created_at, lang)}
        />
        <MetaItem
          label={lang === "fr" ? "Montant" : "Amount"}
          value={
            item.repair.repair_amount_xof !== undefined
              ? formatXOF(item.repair.repair_amount_xof)
              : "—"
          }
        />
      </div>
    </div>
  );
}

function TaskCard({
  task,
  lang,
  compact = false,
}: {
  task: EmployeeTaskItem;
  lang: "fr" | "en";
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        compact &&
          "rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-indigo-950">{task.title}</p>
          <p className="mt-1 text-sm text-slate-500">{task.description}</p>
        </div>
        <PriorityBadge priority={task.priority} lang={lang} />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {reasonLabel(task.reason, lang)}
        </span>
        {task.follow_up_status && (
          <StatusBadge
            status={task.follow_up_status}
            label={followUpStatusLabel(task.follow_up_status, lang)}
          />
        )}
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <MetaItem
          label={lang === "fr" ? "Client" : "Client"}
          value={task.client_name}
        />
        <MetaItem
          label={lang === "fr" ? "Mis à jour" : "Updated"}
          value={formatDateTime(task.updated_at, lang)}
        />
      </div>
    </div>
  );
}

function OperationalWorkbench({
  entityType,
  entityId,
  title,
  subtitle,
  contactEmail,
  contactPhone,
  lang,
}: {
  entityType: OperationalEntityType;
  entityId: string;
  title: string;
  subtitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  lang: "fr" | "en";
}) {
  const { data: followUp, isLoading: followUpLoading } = useEmployeeFollowUp(
    entityType,
    entityId,
  );
  const { data: notes = [], isLoading: notesLoading } = useEmployeeNotes(
    entityType,
    entityId,
  );

  return (
    <DetailSection
      title={title}
      subtitle={subtitle}
      actions={<ContactActions email={contactEmail} phone={contactPhone} lang={lang} />}
      defaultOpen
    >
      {followUpLoading ? (
        <StackedSkeleton />
      ) : (
        <OperationalWorkbenchForm
          key={`${entityType}:${entityId}:${followUp?.updated_at ?? "empty"}`}
          entityType={entityType}
          entityId={entityId}
          followUp={followUp ?? null}
          notes={notes}
          notesLoading={notesLoading}
          lang={lang}
        />
      )}
    </DetailSection>
  );
}

function OperationalWorkbenchForm({
  entityType,
  entityId,
  followUp,
  notes,
  notesLoading,
  lang,
}: {
  entityType: OperationalEntityType;
  entityId: string;
  followUp: ReturnType<typeof useEmployeeFollowUp>["data"];
  notes: OperationalNote[];
  notesLoading: boolean;
  lang: "fr" | "en";
}) {
  const upsertFollowUp = useUpsertOperationalFollowUp();
  const createNote = useCreateOperationalNote();
  const [status, setStatus] = useState<FollowUpStatus>(
    followUp?.status ?? "to_contact",
  );
  const [reason, setReason] = useState(followUp?.reason ?? "");
  const [nextAction, setNextAction] = useState(followUp?.next_action ?? "");
  const [lastContactAt, setLastContactAt] = useState(
    toDateTimeLocal(followUp?.last_contact_at),
  );
  const [noteBody, setNoteBody] = useState("");

  async function handleSaveFollowUp() {
    await upsertFollowUp.mutateAsync({
      entity_type: entityType,
      entity_id: entityId,
      status,
      reason: reason.trim() || undefined,
      next_action: nextAction.trim() || undefined,
      last_contact_at: lastContactAt
        ? new Date(lastContactAt).toISOString()
        : undefined,
    });
  }

  async function handleCreateNote() {
    if (!noteBody.trim()) {
      return;
    }

    await createNote.mutateAsync({
      entity_type: entityType,
      entity_id: entityId,
      body: noteBody.trim(),
    });
    setNoteBody("");
  }

  return (
    <div className="space-y-4">
      <DetailSection
        title={lang === "fr" ? "Action de suivi" : "Follow-up action"}
        subtitle={
          lang === "fr"
            ? "Statut, raison et prochaine étape opérationnelle."
            : "Status, reason, and next operational step."
        }
        defaultOpen
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={lang === "fr" ? "Statut de suivi" : "Follow-up status"}>
              <Select
                value={status}
                onChange={(event) => setStatus(event.target.value as FollowUpStatus)}
              >
                {FOLLOW_UP_STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {followUpStatusLabel(value, lang)}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label={lang === "fr" ? "Dernier contact" : "Last contact"}>
              <Input
                type="datetime-local"
                value={lastContactAt}
                onChange={(event) => setLastContactAt(event.target.value)}
              />
            </FormField>
          </div>

          <FormField label={lang === "fr" ? "Raison du suivi" : "Follow-up reason"}>
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                lang === "fr"
                  ? "Ex. paiement échoué, documents manquants..."
                  : "Example: failed payment, missing documents..."
              }
            />
          </FormField>

          <FormField label={lang === "fr" ? "Prochaine action" : "Next action"}>
            <Textarea
              rows={3}
              value={nextAction}
              onChange={(event) => setNextAction(event.target.value)}
              placeholder={
                lang === "fr"
                  ? "Décrire la prochaine étape opérationnelle..."
                  : "Describe the next operational step..."
              }
            />
          </FormField>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={handleSaveFollowUp}
              loading={upsertFollowUp.isPending}
            >
              {lang === "fr" ? "Enregistrer le suivi" : "Save follow-up"}
            </Button>
            {followUp?.last_contact_at ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
                {lang === "fr" ? "Dernier enregistrement" : "Last update"}:{" "}
                {formatDateTime(followUp.last_contact_at, lang)}
              </span>
            ) : null}
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title={lang === "fr" ? "Notes internes" : "Internal notes"}
        subtitle={
          lang === "fr"
            ? "Commentaires visibles uniquement par l’équipe opérationnelle."
            : "Comments visible only to the operations team."
        }
        defaultOpen={false}
      >
        <div className="space-y-4">
          <DetailCard
            title={lang === "fr" ? "Nouvelle note" : "New note"}
            subtitle={
              lang === "fr"
                ? "Documentez les échanges, les décisions ou les blocages internes."
                : "Record conversations, decisions, or internal blockers."
            }
          >
            <div className="space-y-3">
              <Textarea
                rows={4}
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
                placeholder={
                  lang === "fr"
                    ? "Ajouter une note interne visible uniquement par l’équipe..."
                    : "Add an internal note visible only to the team..."
                }
              />
              <Button
                variant="outline"
                onClick={handleCreateNote}
                loading={createNote.isPending}
              >
                {lang === "fr" ? "Ajouter la note" : "Add note"}
              </Button>
            </div>
          </DetailCard>

          <div className="space-y-3">
            {notesLoading ? (
              <StackedSkeleton />
            ) : notes.length ? (
              notes.map((note) => <NoteCard key={note.id} note={note} lang={lang} />)
            ) : (
              <EmptyState
                title={lang === "fr" ? "Aucune note" : "No notes yet"}
                description={
                  lang === "fr"
                    ? "Les commentaires internes ajoutés par l’équipe apparaîtront ici."
                    : "Internal comments added by the team will appear here."
                }
              />
            )}
          </div>
        </div>
      </DetailSection>
    </div>
  );
}

function NoteCard({
  note,
  lang,
}: {
  note: OperationalNote;
  lang: "fr" | "en";
}) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-indigo-950">
          {note.created_by_name ||
            (lang === "fr" ? "Membre de l’équipe" : "Team member")}
        </p>
        <p className="text-xs text-slate-400">{formatDateTime(note.created_at, lang)}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note.body}</p>
    </div>
  );
}

function ContactActions({
  email,
  phone,
  lang,
}: {
  email?: string;
  phone?: string;
  lang: "fr" | "en";
}) {
  if (!email && !phone) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-indigo-950"
        >
          <PhoneIcon size={14} />
          {lang === "fr" ? "Appeler" : "Call"}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-indigo-950"
        >
          <CreditCardIcon size={14} />
          {lang === "fr" ? "Envoyer un email" : "Email client"}
        </a>
      )}
    </div>
  );
}

function InfoGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.35rem] border border-slate-200/80 bg-white px-4 py-4 shadow-sm"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {item.label}
          </p>
          <p className="mt-2 text-sm font-semibold text-indigo-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
      {title}
    </h3>
  );
}

function PriorityBadge({
  priority,
  lang,
}: {
  priority: "high" | "medium" | "low";
  lang: "fr" | "en";
}) {
  const label =
    priority === "high"
      ? lang === "fr"
        ? "Priorité haute"
        : "High priority"
      : priority === "medium"
        ? lang === "fr"
          ? "Priorité moyenne"
          : "Medium priority"
        : lang === "fr"
          ? "Priorité basse"
          : "Low priority";

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        priority === "high"
          ? "bg-rose-50 text-rose-600"
          : priority === "medium"
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-500",
      )}
    >
      {label}
    </span>
  );
}

function tabLabel(tab: EmployeeTab, lang: "fr" | "en") {
  switch (tab) {
    case "overview":
      return lang === "fr" ? "Vue d’ensemble" : "Overview";
    case "clients":
      return lang === "fr" ? "Clients" : "Clients";
    case "payments":
      return lang === "fr" ? "Paiements / Suivi" : "Payments / Follow-up";
    case "claims":
      return lang === "fr" ? "Sinistres" : "Claims";
    case "repairs":
      return lang === "fr" ? "Réparations" : "Repairs";
    case "tasks":
      return lang === "fr" ? "Tâches / Notes" : "Tasks / Notes";
  }
}

function claimTypeLabel(type: string, lang: "fr" | "en") {
  switch (type) {
    case "screen":
      return lang === "fr" ? "Écran cassé" : "Screen damage";
    case "water":
      return lang === "fr" ? "Dégât liquide" : "Water damage";
    case "theft":
      return lang === "fr" ? "Vol" : "Theft";
    case "breakdown":
      return lang === "fr" ? "Panne" : "Breakdown";
    default:
      return humanize(type);
  }
}

function claimStatusLabel(status: string, lang: "fr" | "en") {
  switch (status) {
    case "pending":
      return lang === "fr" ? "En attente" : "Pending";
    case "review":
      return lang === "fr" ? "En revue" : "In review";
    case "approved":
      return lang === "fr" ? "Approuvé" : "Approved";
    case "rejected":
      return lang === "fr" ? "Rejeté" : "Rejected";
    case "settled":
      return lang === "fr" ? "Réglé" : "Settled";
    default:
      return humanize(status);
  }
}

function repairStatusLabel(status: RepairRequestStatus, lang: "fr" | "en") {
  switch (status) {
    case "pending":
      return lang === "fr" ? "En attente" : "Pending";
    case "accepted":
      return lang === "fr" ? "Acceptée" : "Accepted";
    case "rejected":
      return lang === "fr" ? "Rejetée" : "Rejected";
    case "scheduled":
      return lang === "fr" ? "Planifiée" : "Scheduled";
    case "in_progress":
      return lang === "fr" ? "En cours" : "In progress";
    case "completed":
      return lang === "fr" ? "Terminée" : "Completed";
    case "cancelled":
      return lang === "fr" ? "Annulée" : "Cancelled";
  }
}

function subscriptionStatusLabel(status: string, lang: "fr" | "en") {
  switch (status) {
    case "pending":
      return lang === "fr" ? "En attente" : "Pending";
    case "active":
      return lang === "fr" ? "Actif" : "Active";
    case "cancelled":
      return lang === "fr" ? "Annulé" : "Cancelled";
    case "expired":
      return lang === "fr" ? "Expiré" : "Expired";
    default:
      return humanize(status);
  }
}

function paymentStatusLabel(status: string, lang: "fr" | "en") {
  switch (status) {
    case "pending":
      return lang === "fr" ? "En attente" : "Pending";
    case "completed":
      return lang === "fr" ? "Réussi" : "Completed";
    case "failed":
      return lang === "fr" ? "Échoué" : "Failed";
    case "cancelled":
      return lang === "fr" ? "Annulé" : "Cancelled";
    case "expired":
      return lang === "fr" ? "Expiré" : "Expired";
    case "refunded":
      return lang === "fr" ? "Remboursé" : "Refunded";
    default:
      return humanize(status);
  }
}

function coverageStatusLabel(status: string, lang: "fr" | "en") {
  switch (status) {
    case "active":
      return lang === "fr" ? "Actif" : "Active";
    case "awaiting_payment":
      return lang === "fr" ? "Paiement en attente" : "Awaiting payment";
    case "pending_activation":
      return lang === "fr" ? "Activation bloquée" : "Pending activation";
    case "pending":
      return lang === "fr" ? "En attente" : "Pending";
    case "failed":
      return lang === "fr" ? "Échec paiement" : "Payment failed";
    case "cancelled":
      return lang === "fr" ? "Annulé" : "Cancelled";
    case "expired":
      return lang === "fr" ? "Expiré" : "Expired";
    case "refunded":
      return lang === "fr" ? "Remboursé" : "Refunded";
    case "suspended":
      return lang === "fr" ? "Suspendu" : "Suspended";
    default:
      return humanize(status);
  }
}

function followUpStatusLabel(status: FollowUpStatus, lang: "fr" | "en") {
  switch (status) {
    case "to_contact":
      return lang === "fr" ? "À contacter" : "To contact";
    case "contacted":
      return lang === "fr" ? "Contacté" : "Contacted";
    case "awaiting_response":
      return lang === "fr" ? "En attente retour" : "Awaiting response";
    case "resolved":
      return lang === "fr" ? "Résolu" : "Resolved";
  }
}

function reasonLabel(reason: string, lang: "fr" | "en") {
  switch (reason) {
    case "payment_pending":
      return lang === "fr" ? "Paiement en attente" : "Payment pending";
    case "payment_failed":
      return lang === "fr" ? "Paiement échoué" : "Payment failed";
    case "payment_cancelled":
      return lang === "fr" ? "Paiement annulé" : "Payment cancelled";
    case "payment_expired":
      return lang === "fr" ? "Paiement expiré" : "Payment expired";
    case "activation_missing_imei":
      return lang === "fr" ? "IMEI manquant" : "Missing IMEI";
    case "activation_pending":
      return lang === "fr" ? "Activation en attente" : "Activation pending";
    case "subscription_pending":
      return lang === "fr" ? "Abonnement en attente" : "Subscription pending";
    case "claim_pending_review":
      return lang === "fr" ? "Sinistre à revoir" : "Claim pending review";
    case "repair_pending":
      return lang === "fr" ? "Réparation à traiter" : "Repair pending";
    case "repair_accepted":
      return lang === "fr" ? "Réparation acceptée" : "Repair accepted";
    case "repair_scheduled":
      return lang === "fr" ? "Réparation planifiée" : "Repair scheduled";
    case "repair_in_progress":
      return lang === "fr" ? "Réparation en cours" : "Repair in progress";
    case "repair_overdue":
      return lang === "fr" ? "Réparation en retard" : "Overdue repair";
    case "client_follow_up":
      return lang === "fr" ? "Suivi client" : "Client follow-up";
    case "manual_follow_up":
      return lang === "fr" ? "Suivi manuel" : "Manual follow-up";
    default:
      return humanize(reason);
  }
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value?: string, lang?: "fr" | "en") {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value?: string, lang?: "fr" | "en") {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
