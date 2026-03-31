"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partner } from "../endpoints";
import type {
  ClaimPartnerReferralRequest,
  CreatePartnerReferralVisitRequest,
  CreatePartnerClientRequest,
  PartnerDashboardOverview,
  PartnerReferralDetails,
} from "../types";

interface PartnerQueryOptions {
  enabled?: boolean;
}

export function usePartnerOverview({ enabled = true }: PartnerQueryOptions = {}) {
  return useQuery<PartnerDashboardOverview>({
    queryKey: ["partner", "overview"],
    queryFn: () => partner.overview(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function usePartnerProfile({ enabled = true }: PartnerQueryOptions = {}) {
  return useQuery({
    queryKey: ["partner", "profile"],
    queryFn: () => partner.getProfile(),
    enabled,
  });
}

export function usePartnerClients({ enabled = true }: PartnerQueryOptions = {}) {
  return useQuery({
    queryKey: ["partner", "clients"],
    queryFn: () => partner.listClients(),
    enabled,
  });
}

export function useCreatePartnerClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePartnerClientRequest) => partner.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "profile"] });
    },
  });
}

export function useRefreshPartnerInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => partner.refreshInvitation(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "profile"] });
    },
  });
}

export function usePartnerInvitation(token?: string, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["partner", "invitation", token],
    queryFn: () => partner.getInvitation(token!),
    enabled: enabled && !!token,
    retry: false,
  });
}

export function useClaimPartnerInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => partner.claimInvitation(token),
    onSuccess: (_, token) => {
      queryClient.invalidateQueries({ queryKey: ["partner", "invitation", token] });
      queryClient.invalidateQueries({ queryKey: ["partner", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "profile"] });
    },
  });
}

export function usePartnerReferral(
  code?: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery<PartnerReferralDetails>({
    queryKey: ["partner", "referral", code],
    queryFn: () => partner.getReferral(code!),
    enabled: enabled && !!code,
    retry: false,
  });
}

export function useTrackPartnerReferralVisit() {
  return useMutation({
    mutationFn: ({
      code,
      data,
    }: {
      code: string;
      data?: CreatePartnerReferralVisitRequest;
    }) => partner.trackReferralVisit(code, data),
  });
}

export function useClaimPartnerReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      code,
      data,
    }: {
      code: string;
      data?: ClaimPartnerReferralRequest;
    }) => partner.claimReferral(code, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["partner", "referral", variables.code],
      });
      queryClient.invalidateQueries({ queryKey: ["partner", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "profile"] });
    },
  });
}

export function usePartnerSales({ enabled = true }: PartnerQueryOptions = {}) {
  return useQuery({
    queryKey: ["partner", "sales"],
    queryFn: () => partner.listSales(),
    enabled,
  });
}

export function usePartnerPayouts({ enabled = true }: PartnerQueryOptions = {}) {
  return useQuery({
    queryKey: ["partner", "payouts"],
    queryFn: () => partner.listPayouts(),
    enabled,
  });
}
