"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptions } from "../endpoints";
import type { CreateSubscriptionRequest, Subscription } from "../types";

export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: ["subscriptions"],
    queryFn: () => subscriptions.list(),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) =>
      subscriptions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptions.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}
