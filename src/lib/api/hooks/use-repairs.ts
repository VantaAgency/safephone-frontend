"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { repairs } from "../endpoints";
import type {
  PaginationParams,
  AdminRepairParams,
  CreateRepairRequest,
  LookupRepairRequest,
  RepairRequest,
  UpdateRepairRequestAmount,
  UpdateRepairRequestStatus,
} from "../types";

export function useCreateRepairRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRepairRequest) => repairs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "admin"] });
    },
  });
}

export function useLookupRepairRequest() {
  return useMutation({
    mutationFn: (data: LookupRepairRequest) => repairs.lookup(data),
  });
}

export function useMyRepairRequests(
  { enabled = true, pagination }: { enabled?: boolean; pagination?: PaginationParams } = {},
) {
  return useQuery<RepairRequest[]>({
    queryKey: ["repair-requests", "mine", pagination],
    queryFn: () => repairs.mine(pagination),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminRepairRequests(
  params?: AdminRepairParams,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery<RepairRequest[]>({
    queryKey: ["repair-requests", "admin", params],
    queryFn: () => repairs.adminList(params),
    enabled,
  });
}

export function useAdminRepairRequest(
  id: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery<RepairRequest>({
    queryKey: ["repair-requests", "admin", "detail", id],
    queryFn: () => repairs.adminGet(id),
    enabled: enabled && !!id,
  });
}

export function useAcceptRepairRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repairs.adminAccept(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "admin"] });
      queryClient.invalidateQueries({
        queryKey: ["repair-requests", "admin", "detail", id],
      });
    },
  });
}

export function useRejectRepairRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repairs.adminReject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "admin"] });
      queryClient.invalidateQueries({
        queryKey: ["repair-requests", "admin", "detail", id],
      });
    },
  });
}

export function useUpdateRepairRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRepairRequestStatus;
    }) => repairs.adminUpdateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "admin"] });
      queryClient.invalidateQueries({
        queryKey: ["repair-requests", "admin", "detail", id],
      });
    },
  });
}

export function useUpdateRepairRequestAmount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRepairRequestAmount;
    }) => repairs.adminUpdateAmount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "admin"] });
      queryClient.invalidateQueries({
        queryKey: ["repair-requests", "admin", "detail", id],
      });
    },
  });
}
