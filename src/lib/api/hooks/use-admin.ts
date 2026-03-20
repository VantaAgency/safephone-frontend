"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { admin } from "../endpoints";
import type {
  AdminCustomer,
  AdminPartner,
  AdminPartnerCommission,
  AdminPartnerApplication,
  AdminPayment,
  AdminStats,
  PartnerApplicationStatus,
  ReviewPartnerApplicationRequest,
} from "../types";

interface AdminQueryOptions {
  enabled?: boolean;
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
  });
}

export function useAdminPayments({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminPayment[]>({
    queryKey: ["admin-payments"],
    queryFn: () => admin.payments(),
    enabled,
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

export function useAdminPartnerApplications(status?: PartnerApplicationStatus, { enabled = true }: AdminQueryOptions = {}) {
  return useQuery<AdminPartnerApplication[]>({
    queryKey: ["admin-partner-applications", status],
    queryFn: () => admin.partnerApplications({ status }),
    enabled,
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
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-commissions"] });
    },
  });
}
