import { api } from "./client";
import type {
  AdminClaimParams,
  AdminCustomer,
  AdminPartner,
  AdminPartnerApplication,
  AdminPartnerApplicationParams,
  AdminPayment,
  AdminStats,
  Claim,
  ContactMessage,
  CreateClaimRequest,
  CreateContactRequest,
  CreateDeviceRequest,
  CreatePartnerApplicationRequest,
  CreatePartnerClientRequest,
  CheckoutResult,
  CreatePaymentRequest,
  CreateRepairBookingRequest,
  CreateSubscriptionRequest,
  Device,
  PaginationParams,
  PartnerApplication,
  PartnerClient,
  PartnerPayout,
  PartnerProfile,
  PartnerSale,
  Payment,
  Plan,
  RepairBooking,
  ReviewPartnerApplicationRequest,
  Subscription,
  UpdateClaimStatusRequest,
  UpdateDeviceRequest,
  UpdatePartnerClientStatusRequest,
  UpdateProfileRequest,
  User,
} from "./types";

export const users = {
  updateProfile: (data: UpdateProfileRequest) => api.patch<User>("/users/me", data),
};

export const contact = {
  submit: (data: CreateContactRequest) => api.post<ContactMessage>("/contact", data),
};

export const partnerApplications = {
  submit: (data: CreatePartnerApplicationRequest) =>
    api.post<PartnerApplication>("/partner-applications", data),
  mine: () => api.get<PartnerApplication>("/partner-applications/mine"),
};

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

export const admin = {
  stats: () => api.get<AdminStats>("/admin/stats"),
  customers: (params?: PaginationParams & { search?: string }) =>
    api.get<AdminCustomer[]>("/admin/customers", params as Record<string, string | number>),
  payments: (params?: PaginationParams) =>
    api.get<AdminPayment[]>("/admin/payments", params as Record<string, string | number>),
  partners: (params?: PaginationParams) =>
    api.get<AdminPartner[]>("/admin/partners", params as Record<string, string | number>),
  partnerApplications: (params?: AdminPartnerApplicationParams) =>
    api.get<AdminPartnerApplication[]>("/admin/partner-applications", params as Record<string, string | number>),
  reviewPartnerApplication: (id: string, data: ReviewPartnerApplicationRequest) =>
    api.put<PartnerApplication>(`/admin/partner-applications/${id}/review`, data),
};

export const repairs = {
  createBooking: (data: CreateRepairBookingRequest) =>
    api.post<RepairBooking>("/repairs", data),
};

export const partner = {
  getProfile: () => api.get<PartnerProfile>("/partner/profile"),
  listClients: (params?: PaginationParams) =>
    api.get<PartnerClient[]>("/partner/clients", params as Record<string, string | number>),
  createClient: (data: CreatePartnerClientRequest) =>
    api.post<PartnerClient>("/partner/clients", data),
  updateClientStatus: (clientId: string, data: UpdatePartnerClientStatusRequest) =>
    api.patch<{ status: string }>(`/partner-clients/${clientId}/status`, data),
  listSales: (params?: PaginationParams) =>
    api.get<PartnerSale[]>("/partner/sales", params as Record<string, string | number>),
  listPayouts: (params?: PaginationParams) =>
    api.get<PartnerPayout[]>("/partner/payouts", params as Record<string, string | number>),
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
    api.post<CheckoutResult>("/payments", data),
  list: (params?: PaginationParams) =>
    api.get<Payment[]>("/payments", params as Record<string, string | number>),
  get: (id: string) => api.get<Payment>(`/payments/${id}`),
};
