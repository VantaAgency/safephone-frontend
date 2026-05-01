"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commercial } from "../endpoints";
import type {
  CommercialActivityReport,
  CommercialCommission,
  CommercialDashboardOverview,
  CommercialPartner,
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

export function useCommercialPartners({ enabled = true }: CommercialQueryOptions = {}) {
  return useQuery<CommercialPartner[]>({
    queryKey: ["commercial", "partners"],
    queryFn: () => commercial.partners(),
    enabled,
  });
}

export function useCommercialCommissions({ enabled = true }: CommercialQueryOptions = {}) {
  return useQuery<CommercialCommission[]>({
    queryKey: ["commercial", "commissions"],
    queryFn: () => commercial.commissions(),
    enabled,
  });
}

export function useCommercialActivityReports({ enabled = true }: CommercialQueryOptions = {}) {
  return useQuery<CommercialActivityReport[]>({
    queryKey: ["commercial", "activity-reports"],
    queryFn: () => commercial.activityReports(),
    enabled,
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
