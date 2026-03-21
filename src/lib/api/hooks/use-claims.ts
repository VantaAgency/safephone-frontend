"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { claims } from "../endpoints";
import type {
  AdminClaimParams,
  Claim,
  CreateClaimRequest,
  UpdateClaimStatusRequest,
} from "../types";

export function useClaims({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<Claim[]>({
    queryKey: ["claims"],
    queryFn: () => claims.list(),
    enabled,
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClaimRequest) => claims.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}

export function useAdminClaims(params?: AdminClaimParams, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<Claim[]>({
    queryKey: ["admin-claims", params],
    queryFn: () => claims.adminList(params),
    enabled,
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateClaimStatusRequest;
    }) => claims.adminUpdateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
