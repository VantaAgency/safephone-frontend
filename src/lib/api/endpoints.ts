import { api } from "./client";
import type {
  AdminClaimParams,
  Claim,
  CreateClaimRequest,
  CreateDeviceRequest,
  CreatePaymentRequest,
  CreateSubscriptionRequest,
  Device,
  PaginationParams,
  Payment,
  Plan,
  Subscription,
  UpdateClaimStatusRequest,
  UpdateDeviceRequest,
} from "./types";

export const plans = {
  list: () => api.get<Plan[]>("/plans"),
};

export const devices = {
  create: (data: CreateDeviceRequest) => api.post<Device>("/devices", data),
  list: (params?: PaginationParams) =>
    api.get<Device[]>("/devices", params as Record<string, string | number>),
  get: (id: string) => api.get<Device>(`/devices/${id}`),
  update: (id: string, data: UpdateDeviceRequest) =>
    api.put<Device>(`/devices/${id}`, data),
  delete: (id: string) => api.delete<{ status: string }>(`/devices/${id}`),
};

export const subscriptions = {
  create: (data: CreateSubscriptionRequest) =>
    api.post<Subscription>("/subscriptions", data),
  list: (params?: PaginationParams) =>
    api.get<Subscription[]>(
      "/subscriptions",
      params as Record<string, string | number>
    ),
  get: (id: string) => api.get<Subscription>(`/subscriptions/${id}`),
  cancel: (id: string) =>
    api.post<Subscription>(`/subscriptions/${id}/cancel`),
};

export const claims = {
  create: (data: CreateClaimRequest) => api.post<Claim>("/claims", data),
  list: (params?: PaginationParams) =>
    api.get<Claim[]>("/claims", params as Record<string, string | number>),
  get: (id: string) => api.get<Claim>(`/claims/${id}`),
  adminList: (params?: AdminClaimParams) =>
    api.get<Claim[]>(
      "/admin/claims",
      params as Record<string, string | number>
    ),
  adminUpdateStatus: (id: string, data: UpdateClaimStatusRequest) =>
    api.put<Claim>(`/admin/claims/${id}/status`, data),
};

export const payments = {
  create: (data: CreatePaymentRequest) =>
    api.post<Payment>("/payments", data),
  list: (params?: PaginationParams) =>
    api.get<Payment[]>("/payments", params as Record<string, string | number>),
  get: (id: string) => api.get<Payment>(`/payments/${id}`),
};
