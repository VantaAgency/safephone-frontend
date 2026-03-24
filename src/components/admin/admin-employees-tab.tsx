"use client";

import { useDeferredValue, useRef, useState } from "react";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/form-field";
import {
  ClockIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchIcon,
} from "@/components/ui/icons";
import { CardSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useAdminEmployee,
  useAdminEmployees,
  useCreateEmployeeAccount,
  useResetEmployeePassword,
  useUpdateEmployeeAccount,
  useUpdateEmployeeAccountStatus,
} from "@/lib/api/hooks";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type {
  AdminEmployeeActivityItem,
  AdminEmployeeDetail,
  AdminEmployeeSort,
  EmployeeAccountStatus,
  ResetEmployeePasswordRequest,
  UpdateEmployeeProfileRequest,
} from "@/lib/api/types";

const DEFAULT_CREATE_FORM = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  status: "active" as EmployeeAccountStatus,
  suspended_reason: "",
};

export function AdminEmployeesTab() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<"" | EmployeeAccountStatus>("");
  const [sort, setSort] = useState<AdminEmployeeSort>("recent_activity");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE_FORM);
  const createSubmitLockRef = useRef(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const {
    data: employees = [],
    isLoading: employeesLoading,
    error: employeesError,
  } = useAdminEmployees({
    search: deferredSearch.trim() || undefined,
    status: statusFilter || undefined,
    sort,
  });
  const resolvedSelectedEmployeeId =
    selectedEmployeeId && employees.some((employee) => employee.id === selectedEmployeeId)
      ? selectedEmployeeId
      : employees[0]?.id ?? null;
  const {
    data: selectedEmployee,
    isLoading: employeeLoading,
    error: employeeError,
  } = useAdminEmployee(resolvedSelectedEmployeeId ?? undefined, {
    enabled: !!resolvedSelectedEmployeeId,
  });

  const createEmployee = useCreateEmployeeAccount();
  const updateEmployee = useUpdateEmployeeAccount();
  const resetEmployeePassword = useResetEmployeePassword();
  const updateEmployeeStatus = useUpdateEmployeeAccountStatus();

  const activeEmployeesCount = employees.filter((employee) => employee.status === "active").length;
  const inactiveEmployeesCount = employees.filter((employee) => employee.status === "inactive").length;
  const suspendedEmployeesCount = employees.filter((employee) => employee.status === "suspended").length;
  const openWorkloadCount = employees.reduce(
    (total, employee) => total + employee.workload.open_follow_ups_count,
    0,
  );

  const createError =
    createEmployee.error instanceof Error ? createEmployee.error.message : null;

  const handleCreateEmployee = async () => {
    if (createSubmitLockRef.current) {
      return;
    }

    const payload = {
      ...createForm,
      full_name: createForm.full_name.trim(),
      email: createForm.email.trim(),
      phone: createForm.phone.trim() || undefined,
      password: createForm.password.trim(),
      suspended_reason: createForm.suspended_reason.trim() || undefined,
    };

    createSubmitLockRef.current = true;
    setIsCreateSubmitting(true);

    try {
      const created = await createEmployee.mutateAsync(payload);
      createEmployee.reset();
      setCreateForm(DEFAULT_CREATE_FORM);
      setShowCreateForm(false);
      setSelectedEmployeeId(created.id);
    } finally {
      createSubmitLockRef.current = false;
      setIsCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={lang === "fr" ? "Employés actifs" : "Active employees"}
          value={String(activeEmployeesCount)}
          icon={<UsersIcon size={20} className="text-emerald-600" />}
        />
        <StatCard
          label={lang === "fr" ? "Employés inactifs" : "Inactive employees"}
          value={String(inactiveEmployeesCount)}
          icon={<ShieldCheckIcon size={20} className="text-slate-500" />}
        />
        <StatCard
          label={lang === "fr" ? "Employés suspendus" : "Suspended employees"}
          value={String(suspendedEmployeesCount)}
          icon={<WrenchIcon size={20} className="text-orange-500" />}
        />
        <StatCard
          label={lang === "fr" ? "Suivis ouverts" : "Open follow-ups"}
          value={String(openWorkloadCount)}
          icon={<ClockIcon size={20} className="text-indigo-600" />}
        />
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-medium text-indigo-950">
              {lang === "fr" ? "Gestion des employés" : "Employee management"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {lang === "fr"
                ? "Pilotez l’accès, la charge opérationnelle et l’activité de l’équipe."
                : "Control access, workload, and operational activity for your team."}
            </p>
          </div>
          <Button
            variant={showCreateForm ? "secondary" : "primary"}
            onClick={() => {
              createEmployee.reset();
              setShowCreateForm((current) => !current);
            }}
          >
            {showCreateForm
              ? lang === "fr"
                ? "Fermer"
                : "Close"
              : lang === "fr"
                ? "Ajouter un employé"
                : "Add employee"}
          </Button>
        </div>

        {showCreateForm && (
          <div className="mt-5 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5">
            <div className="mb-4 flex flex-col gap-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {lang === "fr" ? "Créer un compte employé" : "Create employee account"}
              </h3>
              <p className="text-sm text-slate-500">
                {lang === "fr"
                  ? "Création manuelle avec mot de passe initial défini par l’administrateur."
                  : "Manual creation with an admin-defined initial password."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Input
                placeholder={lang === "fr" ? "Nom complet" : "Full name"}
                value={createForm.full_name}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
              />
              <Input
                type="email"
                placeholder="email@safephone.sn"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <Input
                placeholder={lang === "fr" ? "Téléphone (optionnel)" : "Phone (optional)"}
                value={createForm.phone}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
              <Input
                type="password"
                placeholder={lang === "fr" ? "Mot de passe initial" : "Initial password"}
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
              <Select
                value={createForm.status}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    status: event.target.value as EmployeeAccountStatus,
                  }))
                }
              >
                <option value="active">{getEmployeeStatusLabel("active", lang)}</option>
                <option value="inactive">{getEmployeeStatusLabel("inactive", lang)}</option>
                <option value="suspended">{getEmployeeStatusLabel("suspended", lang)}</option>
              </Select>
            </div>

            {createForm.status === "suspended" && (
              <div className="mt-4">
                <Textarea
                  rows={3}
                  placeholder={
                    lang === "fr"
                      ? "Raison de suspension visible côté administration..."
                      : "Suspension reason visible to admins..."
                  }
                  value={createForm.suspended_reason}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      suspended_reason: event.target.value,
                    }))
                  }
                />
              </div>
            )}

            {createError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {createError}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                loading={createEmployee.isPending || isCreateSubmitting}
                onClick={handleCreateEmployee}
                disabled={
                  isCreateSubmitting ||
                  !createForm.full_name.trim() ||
                  !createForm.email.trim() ||
                  !createForm.password.trim()
                }
              >
                {lang === "fr" ? "Créer l’employé" : "Create employee"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  createEmployee.reset();
                  setCreateForm(DEFAULT_CREATE_FORM);
                  setShowCreateForm(false);
                }}
              >
                {lang === "fr" ? "Annuler" : "Cancel"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Input
                placeholder={
                  lang === "fr"
                    ? "Rechercher par nom, email ou téléphone..."
                    : "Search by name, email, or phone..."
                }
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="grid grid-cols-2 gap-3 lg:w-[280px]">
                <Select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "" | EmployeeAccountStatus)
                  }
                >
                  <option value="">{lang === "fr" ? "Tous statuts" : "All statuses"}</option>
                  <option value="active">{getEmployeeStatusLabel("active", lang)}</option>
                  <option value="inactive">{getEmployeeStatusLabel("inactive", lang)}</option>
                  <option value="suspended">{getEmployeeStatusLabel("suspended", lang)}</option>
                </Select>
                <Select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as AdminEmployeeSort)}
                >
                  <option value="recent_activity">
                    {lang === "fr" ? "Activité récente" : "Recent activity"}
                  </option>
                  <option value="joined">
                    {lang === "fr" ? "Date d’arrivée" : "Join date"}
                  </option>
                </Select>
              </div>
            </div>

            {employeesError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {employeesError instanceof Error
                  ? employeesError.message
                  : lang === "fr"
                    ? "Impossible de charger les employés."
                    : "Unable to load employees."}
              </div>
            )}

            {employeesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                <p className="text-base font-medium text-indigo-950">
                  {lang === "fr" ? "Aucun employé trouvé" : "No employees found"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Ajustez vos filtres ou créez le premier compte employé."
                    : "Adjust your filters or create the first employee account."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => setSelectedEmployeeId(employee.id)}
                    className={cn(
                      "w-full rounded-3xl border p-4 text-left transition-all",
                      selectedEmployeeId === employee.id
                        || resolvedSelectedEmployeeId === employee.id
                        ? "border-indigo-300 bg-indigo-50/60 shadow-[0_12px_36px_rgba(99,102,241,0.12)]"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-medium text-indigo-950">
                          {employee.full_name}
                        </p>
                        <p className="truncate text-sm text-slate-500">{employee.email}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {employee.phone || "—"} · {lang === "fr" ? "Rejoint" : "Joined"}{" "}
                          {formatDate(employee.joined_at, lang)}
                        </p>
                      </div>
                      <StatusBadge
                        status={employee.status}
                        label={getEmployeeStatusLabel(employee.status, lang)}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                      <WorkloadPill
                        label={lang === "fr" ? "Clients" : "Clients"}
                        value={employee.workload.clients_followed_count}
                      />
                      <WorkloadPill
                        label={lang === "fr" ? "Sinistres" : "Claims"}
                        value={employee.workload.active_claims_count}
                      />
                      <WorkloadPill
                        label={lang === "fr" ? "Réparations" : "Repairs"}
                        value={employee.workload.active_repairs_count}
                      />
                      <WorkloadPill
                        label={lang === "fr" ? "Suivis" : "Follow-ups"}
                        value={employee.workload.open_follow_ups_count}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>{lang === "fr" ? "Rôle" : "Role"}: Employé</span>
                      <span>
                        {lang === "fr" ? "Dernière activité" : "Last activity"}:{" "}
                        {formatDateTime(
                          employee.workload.last_activity_at ??
                            employee.workload.last_login_at,
                          lang,
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          {!resolvedSelectedEmployeeId ? (
            <EmptyDetailState lang={lang} />
          ) : employeeLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : employeeError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {employeeError instanceof Error
                ? employeeError.message
                : lang === "fr"
                  ? "Impossible de charger cet employé."
                  : "Unable to load this employee."}
            </div>
          ) : selectedEmployee ? (
            <EmployeeDetailPanel
              key={`${selectedEmployee.id}-${selectedEmployee.updated_at}`}
              employee={selectedEmployee}
              lang={lang}
              saveIdentityPending={updateEmployee.isPending}
              saveIdentityError={
                updateEmployee.error instanceof Error
                  ? updateEmployee.error.message
                  : null
              }
              onSaveIdentity={(data) =>
                updateEmployee.mutateAsync({
                  id: selectedEmployee.id,
                  data,
                })
              }
              resetPasswordPending={resetEmployeePassword.isPending}
              resetPasswordError={
                resetEmployeePassword.error instanceof Error
                  ? resetEmployeePassword.error.message
                  : null
              }
              onResetPassword={(data) =>
                resetEmployeePassword.mutateAsync({
                  id: selectedEmployee.id,
                  data,
                })
              }
              statusPending={updateEmployeeStatus.isPending}
              statusError={
                updateEmployeeStatus.error instanceof Error
                  ? updateEmployeeStatus.error.message
                  : null
              }
              onUpdateStatus={(data) =>
                updateEmployeeStatus.mutateAsync({
                  id: selectedEmployee.id,
                  data,
                })
              }
            />
          ) : (
            <EmptyDetailState lang={lang} />
          )}
        </div>
      </div>
    </div>
  );
}

function WorkloadPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-indigo-950">{value}</div>
    </div>
  );
}

function EmployeeDetailPanel({
  employee,
  lang,
  saveIdentityPending,
  saveIdentityError,
  onSaveIdentity,
  resetPasswordPending,
  resetPasswordError,
  onResetPassword,
  statusPending,
  statusError,
  onUpdateStatus,
}: {
  employee: AdminEmployeeDetail;
  lang: "fr" | "en";
  saveIdentityPending: boolean;
  saveIdentityError: string | null;
  onSaveIdentity: (data: UpdateEmployeeProfileRequest) => Promise<unknown>;
  resetPasswordPending: boolean;
  resetPasswordError: string | null;
  onResetPassword: (data: ResetEmployeePasswordRequest) => Promise<unknown>;
  statusPending: boolean;
  statusError: string | null;
  onUpdateStatus: (data: {
    status: EmployeeAccountStatus;
    suspended_reason?: string;
  }) => Promise<unknown>;
}) {
  const [editForm, setEditForm] = useState({
    full_name: employee.full_name,
    email: employee.email,
    phone: employee.phone ?? "",
  });
  const [passwordDraft, setPasswordDraft] = useState("");
  const [suspendReasonDraft, setSuspendReasonDraft] = useState(
    employee.suspended_reason ?? "",
  );
  const [showSuspendComposer, setShowSuspendComposer] = useState(false);

  const handleStatusChange = async (
    status: EmployeeAccountStatus,
    suspendedReason?: string,
  ) => {
    const confirmationCopy =
      status === "suspended"
        ? lang === "fr"
          ? "Suspendre cet employé et révoquer ses sessions actives ?"
          : "Suspend this employee and revoke active sessions?"
        : status === "inactive"
          ? lang === "fr"
            ? "Désactiver l’accès de cet employé à l’espace opérationnel ?"
            : "Deactivate this employee's access to the operations workspace?"
          : lang === "fr"
            ? "Réactiver l’accès de cet employé ?"
            : "Re-enable this employee's access?";

    if (typeof window !== "undefined" && !window.confirm(confirmationCopy)) {
      return;
    }

    await onUpdateStatus({
      status,
      suspended_reason: suspendedReason?.trim() || undefined,
    });

    if (status !== "suspended") {
      setSuspendReasonDraft("");
      setShowSuspendComposer(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-medium text-indigo-950">
                {employee.full_name}
              </h3>
              <StatusBadge
                status={employee.status}
                label={getEmployeeStatusLabel(employee.status, lang)}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">{employee.email}</p>
            <p className="mt-1 text-sm text-slate-500">
              {employee.phone || "—"} · {lang === "fr" ? "Rôle fixe" : "Fixed role"}:{" "}
              {lang === "fr" ? "Employé" : "Employee"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetaCard
              label={lang === "fr" ? "Dernière activité" : "Last activity"}
              value={formatDateTime(employee.workload.last_activity_at, lang)}
            />
            <MetaCard
              label={lang === "fr" ? "Dernière connexion" : "Last login"}
              value={formatDateTime(employee.workload.last_login_at, lang)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMiniCard
          label={lang === "fr" ? "Clients suivis" : "Clients followed"}
          value={employee.workload.clients_followed_count}
        />
        <SummaryMiniCard
          label={lang === "fr" ? "Sinistres actifs" : "Active claims"}
          value={employee.workload.active_claims_count}
        />
        <SummaryMiniCard
          label={lang === "fr" ? "Réparations actives" : "Active repairs"}
          value={employee.workload.active_repairs_count}
        />
        <SummaryMiniCard
          label={lang === "fr" ? "Suivis ouverts" : "Open follow-ups"}
          value={employee.workload.open_follow_ups_count}
        />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200/80 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {lang === "fr" ? "Identité employé" : "Employee identity"}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {lang === "fr"
                    ? "Modifiez les informations de contact affichées à l’équipe."
                    : "Update the contact information shown to the team."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder={lang === "fr" ? "Nom complet" : "Full name"}
                value={editForm.full_name}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
              />
              <Input
                type="email"
                placeholder="email@safephone.sn"
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <Input
                placeholder={lang === "fr" ? "Téléphone" : "Phone"}
                value={editForm.phone}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="md:col-span-2"
              />
            </div>

            {saveIdentityError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveIdentityError}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                loading={saveIdentityPending}
                onClick={() =>
                  onSaveIdentity({
                    full_name: editForm.full_name.trim(),
                    email: editForm.email.trim(),
                    phone: editForm.phone.trim() || undefined,
                  })
                }
                disabled={!editForm.full_name.trim() || !editForm.email.trim()}
              >
                {lang === "fr" ? "Enregistrer les modifications" : "Save changes"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 p-5">
            <div className="mb-4 flex flex-col gap-1">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {lang === "fr" ? "Activité récente" : "Recent activity"}
              </h4>
              <p className="text-sm text-slate-500">
                {lang === "fr"
                  ? "Derniers suivis et notes opérationnelles attribués à cet employé."
                  : "Latest follow-ups and operational notes attributed to this employee."}
              </p>
            </div>

            {employee.recent_activity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center text-sm text-slate-500">
                {lang === "fr"
                  ? "Aucune activité opérationnelle récente."
                  : "No recent operational activity."}
              </div>
            ) : (
              <div className="space-y-3">
                {employee.recent_activity.map((activity) => (
                  <ActivityRow
                    key={`${activity.kind}-${activity.entity_id}-${activity.occurred_at}`}
                    activity={activity}
                    lang={lang}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200/80 p-5">
            <div className="mb-4 flex flex-col gap-1">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {lang === "fr" ? "Accès et permissions" : "Access and permissions"}
              </h4>
              <p className="text-sm text-slate-500">
                {lang === "fr"
                  ? "L’administrateur contrôle ici l’accès à l’espace employé."
                  : "Admin controls employee workspace access here."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-indigo-950">
                  {lang === "fr" ? "Statut du compte" : "Account status"}
                </span>
                <StatusBadge
                  status={employee.status}
                  label={getEmployeeStatusLabel(employee.status, lang)}
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {employee.workspace_access
                  ? lang === "fr"
                    ? "Accès à l’espace employé autorisé."
                    : "Employee workspace access is enabled."
                  : lang === "fr"
                    ? "Accès à l’espace employé bloqué."
                    : "Employee workspace access is blocked."}
              </p>
              {employee.suspended_reason && (
                <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                  <span className="font-medium">
                    {lang === "fr" ? "Motif de suspension" : "Suspension reason"}:
                  </span>{" "}
                  {employee.suspended_reason}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {employee.status !== "active" && (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={statusPending}
                  onClick={() => handleStatusChange("active")}
                >
                  {lang === "fr" ? "Réactiver" : "Re-enable"}
                </Button>
              )}
              {employee.status !== "inactive" && (
                <Button
                  variant="outline"
                  size="sm"
                  loading={statusPending}
                  onClick={() => handleStatusChange("inactive")}
                >
                  {lang === "fr" ? "Désactiver" : "Deactivate"}
                </Button>
              )}
              {employee.status !== "suspended" && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowSuspendComposer((current) => !current)}
                >
                  {lang === "fr" ? "Suspendre" : "Suspend"}
                </Button>
              )}
            </div>

            {showSuspendComposer && employee.status !== "suspended" && (
              <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
                <Textarea
                  rows={4}
                  placeholder={
                    lang === "fr"
                      ? "Expliquez pourquoi cet accès doit être suspendu..."
                      : "Explain why this access should be suspended..."
                  }
                  value={suspendReasonDraft}
                  onChange={(event) => setSuspendReasonDraft(event.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={statusPending}
                    onClick={() =>
                      handleStatusChange("suspended", suspendReasonDraft)
                    }
                  >
                    {lang === "fr" ? "Confirmer la suspension" : "Confirm suspension"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuspendComposer(false)}
                  >
                    {lang === "fr" ? "Annuler" : "Cancel"}
                  </Button>
                </div>
              </div>
            )}

            {statusError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {statusError}
              </div>
            )}

            <div className="mt-5 border-t border-slate-100 pt-5">
              <h5 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {lang === "fr" ? "Permissions actuelles" : "Current permissions"}
              </h5>
              <div className="mt-3 flex flex-wrap gap-2">
                {employee.permission_summary.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 p-5">
            <div className="mb-4 flex flex-col gap-1">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {lang === "fr" ? "Sécurité du compte" : "Account security"}
              </h4>
              <p className="text-sm text-slate-500">
                {lang === "fr"
                  ? "Définissez un nouveau mot de passe administrateur si nécessaire."
                  : "Set a new password from the admin side when needed."}
              </p>
            </div>

            <Input
              type="password"
              placeholder={lang === "fr" ? "Nouveau mot de passe" : "New password"}
              value={passwordDraft}
              onChange={(event) => setPasswordDraft(event.target.value)}
            />

            {resetPasswordError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {resetPasswordError}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
                loading={resetPasswordPending}
                onClick={async () => {
                  await onResetPassword({
                    password: passwordDraft.trim(),
                  });
                  setPasswordDraft("");
                }}
                disabled={passwordDraft.trim().length < 8}
              >
                {lang === "fr" ? "Réinitialiser le mot de passe" : "Reset password"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 p-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              {lang === "fr" ? "Repères compte" : "Account timeline"}
            </h4>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <TimelineRow
                label={lang === "fr" ? "Compte créé" : "Account created"}
                value={formatDateTime(employee.created_at, lang)}
              />
              <TimelineRow
                label={lang === "fr" ? "Dernière mise à jour" : "Last updated"}
                value={formatDateTime(employee.updated_at, lang)}
              />
              <TimelineRow
                label={lang === "fr" ? "Dernière activité" : "Last activity"}
                value={formatDateTime(employee.workload.last_activity_at, lang)}
              />
              <TimelineRow
                label={lang === "fr" ? "Dernière connexion" : "Last login"}
                value={formatDateTime(employee.workload.last_login_at, lang)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryMiniCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-medium text-indigo-950">{value}</p>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-indigo-950">{value}</p>
    </div>
  );
}

function ActivityRow({
  activity,
  lang,
}: {
  activity: AdminEmployeeActivityItem;
  lang: "fr" | "en";
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-indigo-950">
            {describeActivity(activity, lang)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{activity.description}</p>
        </div>
        <span className="text-xs text-slate-400">
          {formatDateTime(activity.occurred_at, lang)}
        </span>
      </div>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-indigo-950">{value}</span>
    </div>
  );
}

function EmptyDetailState({ lang }: { lang: "fr" | "en" }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div>
        <p className="text-lg font-medium text-indigo-950">
          {lang === "fr" ? "Sélectionnez un employé" : "Select an employee"}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {lang === "fr"
            ? "La fiche détaillée affichera l’identité, l’accès et la charge opérationnelle."
            : "The detail panel will show identity, access controls, and workload."}
        </p>
      </div>
    </div>
  );
}

function getEmployeeStatusLabel(
  status: EmployeeAccountStatus,
  lang: "fr" | "en",
) {
  switch (status) {
    case "active":
      return lang === "fr" ? "Actif" : "Active";
    case "inactive":
      return lang === "fr" ? "Inactif" : "Inactive";
    case "suspended":
      return lang === "fr" ? "Suspendu" : "Suspended";
  }
}

function formatDate(value: string | undefined, lang: "fr" | "en") {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | undefined, lang: "fr" | "en") {
  if (!value) return "—";
  return new Date(value).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function describeActivity(
  activity: AdminEmployeeActivityItem,
  lang: "fr" | "en",
) {
  const kindLabel =
    activity.kind === "note"
      ? lang === "fr"
        ? "Note interne"
        : "Internal note"
      : lang === "fr"
        ? "Suivi"
        : "Follow-up";

  const entityLabel = getEntityLabel(activity.entity_type, lang);
  return `${kindLabel} · ${entityLabel}`;
}

function getEntityLabel(
  entityType: AdminEmployeeActivityItem["entity_type"],
  lang: "fr" | "en",
) {
  switch (entityType) {
    case "client":
      return lang === "fr" ? "Client" : "Client";
    case "subscription":
      return lang === "fr" ? "Abonnement" : "Subscription";
    case "claim":
      return lang === "fr" ? "Sinistre" : "Claim";
    case "repair":
      return lang === "fr" ? "Réparation" : "Repair";
  }
}
