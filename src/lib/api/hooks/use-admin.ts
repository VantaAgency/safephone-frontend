"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ApiResponse } from "../types";
import { admin } from "../endpoints";
import type {
  AdminCustomer,
  AdminDashboardOverview,
  AdminEmployeeDetail,
  AdminEmployeeListItem,
  AdminEmployeeParams,
  AdminPartner,
  AdminPartnerCommission,
  AdminPartnerReferral,
  AdminPartnerApplication,
  AdminPayment,
  AdminStats,
  CreateEmployeeRequest,
  PartnerApplicationStatus,
  ResetEmployeePasswordRequest,
  ReviewPartnerApplicationRequest,
  UpdateEmployeeProfileRequest,
  UpdateEmployeeStatusRequest,
} from "../types";

interface AdminQueryOptions {
  enabled?: boolean;
}

async function fetchAdminAction<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(
      body && "error" in body && body.error?.message
        ? body.error.message
        : "An unexpected error occurred",
    );
  }

  return (body as ApiResponse<T>).data;
}

export function useAdminOverview({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminDashboardOverview>({
    queryKey: ["admin-overview"],
    queryFn: () => admin.overview(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useAdminStats({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => admin.stats(),
    enabled,
  });
}

export function useAdminCustomers(search?: string, { enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminCustomer[]>({
    queryKey: ["admin-customers", search],
    queryFn: () => admin.customers({ search }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminPayments({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminPayment[]>({
    queryKey: ["admin-payments"],
    queryFn: () => admin.payments(),
    enabled,
  });
}

export function useAdminEmployees(
  params?: AdminEmployeeParams,
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery<AdminEmployeeListItem[]>({
    queryKey: ["admin-employees", params],
    queryFn: () => admin.employees(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminEmployee(
  employeeId?: string,
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery<AdminEmployeeDetail>({
    queryKey: ["admin-employee", employeeId],
    queryFn: () => admin.employee(employeeId!),
    enabled: enabled && !!employeeId,
  });
}

export function useAdminPartners({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminPartner[]>({
    queryKey: ["admin-partners"],
    queryFn: () => admin.partners(),
    enabled,
  });
}

export function useAdminPartnerCommissions(partnerId?: string, { enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminPartnerCommission[]>({
    queryKey: ["admin-partner-commissions", partnerId],
    queryFn: () => admin.partnerCommissions(partnerId!),
    enabled: enabled && !!partnerId,
  });
}

export function useAdminPartnerReferrals(
  partnerId?: string,
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery<AdminPartnerReferral[]>({
    queryKey: ["admin-partner-referrals", partnerId],
    queryFn: () => admin.partnerReferrals(partnerId!),
    enabled: enabled && !!partnerId,
  });
}

export function useAdminPartnerApplications(status?: PartnerApplicationStatus, { enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminPartnerApplication[]>({
    queryKey: ["admin-partner-applications", status],
    queryFn: () => admin.partnerApplications({ status }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useReviewPartnerApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewPartnerApplicationRequest }) =>
      admin.reviewPartnerApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-referrals"] });
    },
  });
}

export function useCreateEmployeeAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) =>
      fetchAdminAction<{ id: string }>("/api/admin/employees", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
      await queryClient.refetchQueries({
        queryKey: ["admin-employees"],
        type: "active",
      });
    },
  });
}

export function useUpdateEmployeeAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEmployeeProfileRequest;
    }) =>
      fetchAdminAction<{ id: string }>(`/api/admin/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
      queryClient.invalidateQueries({ queryKey: ["admin-employee", variables.id] });
    },
  });
}

export function useResetEmployeePassword() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ResetEmployeePasswordRequest;
    }) =>
      fetchAdminAction<{ id: string }>(`/api/admin/employees/${id}/password`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateEmployeeAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEmployeeStatusRequest;
    }) =>
      fetchAdminAction<{ id: string }>(`/api/admin/employees/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
      queryClient.invalidateQueries({ queryKey: ["admin-employee", variables.id] });
    },
  });
}
