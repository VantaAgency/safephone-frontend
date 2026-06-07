"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moderation } from "../endpoints";
import type { Device } from "../types";

// Covered devices an admin/employee can review for fraud (active + suspended).
export function useModerationDevices({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery<Device[]>({
    queryKey: ["moderation-devices"],
    queryFn: () => moderation.devices({ limit: 50 }),
    enabled,
  });
}

export function useSuspendDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moderation.suspend(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["moderation-devices"] }),
  });
}

export function useReactivateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moderation.reactivate(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["moderation-devices"] }),
  });
}
