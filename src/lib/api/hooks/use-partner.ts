"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partner } from "../endpoints";
import type { CreatePartnerClientRequest } from "../types";

export function usePartnerProfile() {
  return useQuery({
    queryKey: ["partner", "profile"],
    queryFn: () => partner.getProfile(),
  });
}

export function usePartnerClients() {
  return useQuery({
    queryKey: ["partner", "clients"],
    queryFn: () => partner.listClients(),
  });
}

export function useCreatePartnerClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePartnerClientRequest) => partner.createClient(data),
    onSuccess: () => {
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
      queryClient.invalidateQueries({ queryKey: ["partner", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "profile"] });
    },
  });
}

export function usePartnerSales() {
  return useQuery({
    queryKey: ["partner", "sales"],
    queryFn: () => partner.listSales(),
  });
}

export function usePartnerPayouts() {
  return useQuery({
    queryKey: ["partner", "payouts"],
    queryFn: () => partner.listPayouts(),
  });
}
