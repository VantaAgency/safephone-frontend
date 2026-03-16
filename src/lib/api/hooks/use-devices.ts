"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devices } from "../endpoints";
import type {
  CreateDeviceRequest,
  Device,
  UpdateDeviceRequest,
} from "../types";

export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: () => devices.list(),
  });
}

export function useDevice(id: string) {
  return useQuery<Device>({
    queryKey: ["devices", id],
    queryFn: () => devices.get(id),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeviceRequest) => devices.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeviceRequest }) =>
      devices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => devices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}
