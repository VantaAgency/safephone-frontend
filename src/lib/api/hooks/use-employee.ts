"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { employee } from "../endpoints";
import type {
  CreateOperationalNoteRequest,
  EmployeeClaimDetail,
  EmployeeClaimParams,
  EmployeeClientDetail,
  EmployeeClientListItem,
  EmployeeClientParams,
  EmployeeDashboardOverview,
  EmployeePaymentFollowUpItem,
  EmployeePaymentFollowUpParams,
  EmployeeRepairDetail,
  EmployeeRepairParams,
  EmployeeTaskItem,
  EmployeeTaskParams,
  EmployeeUpdateClaimStatusRequest,
  OperationalEntityType,
  OperationalFollowUp,
  OperationalNote,
  UpdateRepairRequestAmount,
  UpdateRepairRequestStatus,
  UpsertOperationalFollowUpRequest,
} from "../types";

interface EmployeeQueryOptions {
  enabled?: boolean;
}

function invalidateEmployeeWorkspace(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["employee"] });
}

export function useEmployeeOverview({ enabled = true }: EmployeeQueryOptions = {}) {
  return useQuery<EmployeeDashboardOverview>({
    queryKey: ["employee", "overview"],
    queryFn: () => employee.overview(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEmployeeClients(
  params?: EmployeeClientParams,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<EmployeeClientListItem[]>({
    queryKey: ["employee", "clients", params],
    queryFn: () => employee.clients(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeClient(
  id?: string,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<EmployeeClientDetail>({
    queryKey: ["employee", "client", id],
    queryFn: () => employee.client(id!),
    enabled: enabled && !!id,
  });
}

export function useEmployeePaymentFollowUps(
  params?: EmployeePaymentFollowUpParams,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<EmployeePaymentFollowUpItem[]>({
    queryKey: ["employee", "payment-follow-ups", params],
    queryFn: () => employee.paymentFollowUps(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeClaims(
  params?: EmployeeClaimParams,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<EmployeeClaimDetail[]>({
    queryKey: ["employee", "claims", params],
    queryFn: () => employee.claims(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeClaim(
  id?: string,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<EmployeeClaimDetail>({
    queryKey: ["employee", "claim", id],
    queryFn: () => employee.claim(id!),
    enabled: enabled && !!id,
  });
}

export function useEmployeeUpdateClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: EmployeeUpdateClaimStatusRequest;
    }) => employee.updateClaimStatus(id, data),
    onSuccess: (_, { id }) => {
      invalidateEmployeeWorkspace(queryClient);
      queryClient.invalidateQueries({ queryKey: ["employee", "claim", id] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useEmployeeRepairs(
  params?: EmployeeRepairParams,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<EmployeeRepairDetail[]>({
    queryKey: ["employee", "repairs", params],
    queryFn: () => employee.repairs(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeRepair(
  id?: string,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<EmployeeRepairDetail>({
    queryKey: ["employee", "repair", id],
    queryFn: () => employee.repair(id!),
    enabled: enabled && !!id,
  });
}

export function useEmployeeUpdateRepairStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRepairRequestStatus;
    }) => employee.updateRepairStatus(id, data),
    onSuccess: (_, { id }) => {
      invalidateEmployeeWorkspace(queryClient);
      queryClient.invalidateQueries({ queryKey: ["employee", "repair", id] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "admin"] });
      queryClient.invalidateQueries({
        queryKey: ["repair-requests", "admin", "detail", id],
      });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "mine"] });
    },
  });
}

export function useEmployeeUpdateRepairAmount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRepairRequestAmount;
    }) => employee.updateRepairAmount(id, data),
    onSuccess: (_, { id }) => {
      invalidateEmployeeWorkspace(queryClient);
      queryClient.invalidateQueries({ queryKey: ["employee", "repair", id] });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "admin"] });
      queryClient.invalidateQueries({
        queryKey: ["repair-requests", "admin", "detail", id],
      });
      queryClient.invalidateQueries({ queryKey: ["repair-requests", "mine"] });
    },
  });
}

export function useEmployeeTasks(
  params?: EmployeeTaskParams,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<EmployeeTaskItem[]>({
    queryKey: ["employee", "tasks", params],
    queryFn: () => employee.tasks(params),
    enabled,
  });
}

export function useEmployeeFollowUp(
  entityType?: OperationalEntityType,
  entityId?: string,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<OperationalFollowUp | null>({
    queryKey: ["employee", "follow-up", entityType, entityId],
    queryFn: () => employee.followUp(entityType!, entityId!),
    enabled: enabled && !!entityType && !!entityId,
  });
}

export function useUpsertOperationalFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertOperationalFollowUpRequest) =>
      employee.upsertFollowUp(data),
    onSuccess: (followUp) => {
      invalidateEmployeeWorkspace(queryClient);
      queryClient.setQueryData(
        ["employee", "follow-up", followUp.entity_type, followUp.entity_id],
        followUp,
      );
    },
  });
}

export function useEmployeeNotes(
  entityType?: OperationalEntityType,
  entityId?: string,
  { enabled = true }: EmployeeQueryOptions = {},
) {
  return useQuery<OperationalNote[]>({
    queryKey: ["employee", "notes", entityType, entityId],
    queryFn: () => employee.notes(entityType!, entityId!),
    enabled: enabled && !!entityType && !!entityId,
  });
}

export function useCreateOperationalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOperationalNoteRequest) => employee.createNote(data),
    onSuccess: (note) => {
      invalidateEmployeeWorkspace(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["employee", "notes", note.entity_type, note.entity_id],
      });
    },
  });
}
