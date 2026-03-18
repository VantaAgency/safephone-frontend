"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partner } from "../endpoints";
import type { CreatePartnerClientRequest, UpdatePartnerClientStatusRequest } from "../types";

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

export function useUpdatePartnerClientStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: UpdatePartnerClientStatusRequest }) =>
      partner.updateClientStatus(clientId, data),
    onSuccess: () => {
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
