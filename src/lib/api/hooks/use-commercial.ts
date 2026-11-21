"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllPages } from "../fetch-all-pages";
import { commercial } from "../endpoints";
import type {
  CommercialActivityReport,
  CommercialCommission,
  CommercialDashboardOverview,
  CommercialPartner,
  PaginationParams,
} from "../types";

interface CommercialQueryOptions {
  enabled?: boolean;
}

export function useCommercialOverview({ enabled = true }: CommercialQueryOptions = {}) {
  return useQuery<CommercialDashboardOverview>({
    queryKey: ["commercial", "overview"],
    queryFn: () => commercial.overview(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useCommercialPartners(params: PaginationParams, { enabled = true }: CommercialQueryOptions = {}) {
  return useQuery<CommercialPartner[]>({
    queryKey: ["commercial", "partners", params],
    queryFn: () => commercial.partners(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCommercialPartnerOptions(enabled: boolean) {
  return useQuery({
    queryKey: ["commercial", "partners", "options"],
    queryFn: ({ signal }) => fetchAllPages(commercial.partners, signal),
    enabled,
  });
}

export function useCommercialCommissions(params: PaginationParams, { enabled = true }: CommercialQueryOptions = {}) {
  return useQuery<CommercialCommission[]>({
    queryKey: ["commercial", "commissions", params],
    queryFn: () => commercial.commissions(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCommercialActivityReports(params: PaginationParams, { enabled = true }: CommercialQueryOptions = {}) {
  return useQuery<CommercialActivityReport[]>({
    queryKey: ["commercial", "activity-reports", params],
    queryFn: () => commercial.activityReports(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCreateCommercialActivityReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => commercial.createActivityReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercial", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["commercial", "activity-reports"] });
    },
  });
}
