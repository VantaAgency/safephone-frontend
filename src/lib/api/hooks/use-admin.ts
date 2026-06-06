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
  AdminCommercialDetail,
  AdminCommercialListItem,
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
  MarketCode,
  CreateEmployeeRequest,
  CreateCommercialRequest,
  PartnerApplicationStatus,
  ResetEmployeePasswordRequest,
  ReviewPartnerApplicationRequest,
  UpdateEmployeeProfileRequest,
  UpdateEmployeeStatusRequest,
} from "../types";

interface AdminQueryOptions {
  enabled?: boolean;
}

/** Standard pagination shape — mirrors PaginationParams on endpoints.ts. */
export interface AdminPaginationParams {
  limit?: number;
  offset?: number;
  /** Optional market filter (omit = all markets). */
  market?: MarketCode;
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

export function useAdminCustomers(
  search?: string,
  pagination?: AdminPaginationParams,
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery<AdminCustomer[]>({
    queryKey: ["admin-customers", search, pagination?.limit, pagination?.offset, pagination?.market],
    queryFn: () => admin.customers({ search, ...pagination }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminPayments(
  pagination?: AdminPaginationParams,
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery<AdminPayment[]>({
    queryKey: ["admin-payments", pagination?.limit, pagination?.offset, pagination?.market],
    queryFn: () => admin.payments(pagination),
    enabled,
    placeholderData: keepPreviousData,
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

export function useAdminCommercials(
  pagination?: AdminPaginationParams,
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery<AdminCommercialListItem[]>({
    queryKey: ["admin-commercials", pagination?.limit, pagination?.offset],
    queryFn: () => admin.commercials(pagination),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminCommercial(
  commercialId?: string,
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery<AdminCommercialDetail>({
    queryKey: ["admin-commercial", commercialId],
    queryFn: () => admin.commercial(commercialId!),
    enabled: enabled && !!commercialId,
  });
}

export function useCreateCommercialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommercialRequest) =>
      fetchAdminAction<{ id: string }>("/api/admin/commercials", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-commercials"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}

export function useUpdateCommercialStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      admin.updateCommercialStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-commercials"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commercial", variables.id] });
    },
  });
}

export function useUpdateCommercialCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      commissionPercentage,
    }: {
      id: string;
      commissionPercentage: number;
    }) => admin.updateCommercialCommission(id, commissionPercentage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-commercials"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commercial", variables.id] });
    },
  });
}

export function useAdminPartners(
  pagination?: AdminPaginationParams,
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery<AdminPartner[]>({
    queryKey: ["admin-partners", pagination?.limit, pagination?.offset],
    queryFn: () => admin.partners(pagination),
    enabled,
    placeholderData: keepPreviousData,
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
