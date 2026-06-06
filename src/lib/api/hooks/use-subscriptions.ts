"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptions } from "../endpoints";
import type {
  AddSubscriptionDeviceRequest,
  CreateSubscriptionRequest,
  Device,
  Subscription,
} from "../types";

export function useSubscriptions({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<Subscription[]>({
    queryKey: ["subscriptions"],
    queryFn: () => subscriptions.list(),
    enabled,
  });
}

// Devices attached to a subscription — used to compute remaining device slots.
export function useSubscriptionDevices(
  id?: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery<Device[]>({
    queryKey: ["subscription-devices", id],
    queryFn: () => subscriptions.devices(id!),
    enabled: enabled && !!id,
  });
}

export function useAddDeviceToSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddSubscriptionDeviceRequest }) =>
      subscriptions.addDevice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-devices", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) =>
      subscriptions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptions.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}
