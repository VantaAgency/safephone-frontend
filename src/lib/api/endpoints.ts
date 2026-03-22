import { api } from "./client";
import type {
  AdminClaimParams,
  CreateOperationalNoteRequest,
  AdminCustomer,
  AdminDashboardOverview,
  AdminPartner,
  AdminPartnerCommission,
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
  CreateRepairRequest,
  CreateSubscriptionRequest,
  Device,
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
  LookupRepairRequest,
  MemberDashboardSummary,
  OperationalEntityType,
  OperationalFollowUp,
  OperationalNote,
  PaginationParams,
  PartnerApplication,
  PartnerClient,
  PartnerDashboardOverview,
  PartnerInvitation,
  PartnerPayout,
  PartnerProfile,
  PartnerSale,
  Payment,
  Plan,
  RepairRequest,
  RenewSubscriptionPaymentRequest,
  ReviewPartnerApplicationRequest,
  Subscription,
  UpdateRepairRequestAmount,
  UpdateRepairRequestStatus,
  UpdateClaimStatusRequest,
  UpdateDeviceRequest,
  UpdateProfileRequest,
  UpsertOperationalFollowUpRequest,
  User,
} from "./types";

export const dashboard = {
  summary: () => api.get<MemberDashboardSummary>("/dashboard/summary"),
};

export const users = {
  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<User>("/users/me", data),
};

export const contact = {
  submit: (data: CreateContactRequest) =>
    api.post<ContactMessage>("/contact", data),
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
      params as Record<string, string | number>,
    ),
  get: (id: string) => api.get<Subscription>(`/subscriptions/${id}`),
  cancel: (id: string) => api.post<Subscription>(`/subscriptions/${id}/cancel`),
};

export const admin = {
  overview: () => api.get<AdminDashboardOverview>("/admin/overview"),
  stats: () => api.get<AdminStats>("/admin/stats"),
  customers: (params?: PaginationParams & { search?: string }) =>
    api.get<AdminCustomer[]>(
      "/admin/customers",
      params as Record<string, string | number>,
    ),
  payments: (params?: PaginationParams) =>
    api.get<AdminPayment[]>(
      "/admin/payments",
      params as Record<string, string | number>,
    ),
  partners: (params?: PaginationParams) =>
    api.get<AdminPartner[]>(
      "/admin/partners",
      params as Record<string, string | number>,
    ),
  partnerCommissions: (id: string, params?: PaginationParams) =>
    api.get<AdminPartnerCommission[]>(
      `/admin/partners/${id}/commissions`,
      params as Record<string, string | number>,
    ),
  partnerApplications: (params?: AdminPartnerApplicationParams) =>
    api.get<AdminPartnerApplication[]>(
      "/admin/partner-applications",
      params as Record<string, string | number>,
    ),
  reviewPartnerApplication: (
    id: string,
    data: ReviewPartnerApplicationRequest,
  ) =>
    api.put<PartnerApplication>(
      `/admin/partner-applications/${id}/review`,
      data,
    ),
};

export const repairs = {
  create: (data: CreateRepairRequest) =>
    api.post<RepairRequest>("/repairs", data),
  lookup: (data: LookupRepairRequest) =>
    api.post<RepairRequest>("/repairs/lookup", data),
  mine: (params?: PaginationParams) =>
    api.get<RepairRequest[]>(
      "/repairs/mine",
      params as Record<string, string | number>,
    ),
  adminList: (params?: PaginationParams & { status?: string; search?: string }) =>
    api.get<RepairRequest[]>(
      "/admin/repairs",
      params as Record<string, string | number>,
    ),
  adminGet: (id: string) => api.get<RepairRequest>(`/admin/repairs/${id}`),
  adminAccept: (id: string) =>
    api.post<RepairRequest>(`/admin/repairs/${id}/accept`),
  adminReject: (id: string) =>
    api.post<RepairRequest>(`/admin/repairs/${id}/reject`),
  adminUpdateStatus: (id: string, data: UpdateRepairRequestStatus) =>
    api.put<RepairRequest>(`/admin/repairs/${id}/status`, data),
  adminUpdateAmount: (id: string, data: UpdateRepairRequestAmount) =>
    api.put<RepairRequest>(`/admin/repairs/${id}/amount`, data),
};

export const partner = {
  overview: () => api.get<PartnerDashboardOverview>("/partner/overview"),
  getProfile: () => api.get<PartnerProfile>("/partner/profile"),
  listClients: (params?: PaginationParams) =>
    api.get<PartnerClient[]>(
      "/partner/clients",
      params as Record<string, string | number>,
    ),
  createClient: (data: CreatePartnerClientRequest) =>
    api.post<PartnerClient>("/partner/clients", data),
  refreshInvitation: (clientId: string) =>
    api.post<PartnerClient>(`/partner/clients/${clientId}/refresh-invitation`),
  getInvitation: (token: string) =>
    api.get<PartnerInvitation>(`/partner-invitations/${token}`),
  claimInvitation: (token: string) =>
    api.post<PartnerInvitation>(`/partner-invitations/${token}/claim`),
  listSales: (params?: PaginationParams) =>
    api.get<PartnerSale[]>(
      "/partner/sales",
      params as Record<string, string | number>,
    ),
  listPayouts: (params?: PaginationParams) =>
    api.get<PartnerPayout[]>(
      "/partner/payouts",
      params as Record<string, string | number>,
    ),
};

export const claims = {
  create: (data: CreateClaimRequest) => api.post<Claim>("/claims", data),
  list: (params?: PaginationParams) =>
    api.get<Claim[]>("/claims", params as Record<string, string | number>),
  get: (id: string) => api.get<Claim>(`/claims/${id}`),
  adminList: (params?: AdminClaimParams) =>
    api.get<Claim[]>(
      "/admin/claims",
      params as Record<string, string | number>,
    ),
  adminUpdateStatus: (id: string, data: UpdateClaimStatusRequest) =>
    api.put<Claim>(`/admin/claims/${id}/status`, data),
};

export const employee = {
  overview: () => api.get<EmployeeDashboardOverview>("/employee/overview"),
  clients: (params?: EmployeeClientParams) =>
    api.get<EmployeeClientListItem[]>(
      "/employee/clients",
      params as Record<string, string | number>,
    ),
  client: (id: string) => api.get<EmployeeClientDetail>(`/employee/clients/${id}`),
  paymentFollowUps: (params?: EmployeePaymentFollowUpParams) =>
    api.get<EmployeePaymentFollowUpItem[]>(
      "/employee/payment-follow-ups",
      params as Record<string, string | number>,
    ),
  claims: (params?: EmployeeClaimParams) =>
    api.get<EmployeeClaimDetail[]>(
      "/employee/claims",
      params as Record<string, string | number>,
    ),
  claim: (id: string) => api.get<EmployeeClaimDetail>(`/employee/claims/${id}`),
  updateClaimStatus: (id: string, data: EmployeeUpdateClaimStatusRequest) =>
    api.patch<Claim>(`/employee/claims/${id}/status`, data),
  repairs: (params?: EmployeeRepairParams) =>
    api.get<EmployeeRepairDetail[]>(
      "/employee/repairs",
      params as Record<string, string | number>,
    ),
  repair: (id: string) => api.get<EmployeeRepairDetail>(`/employee/repairs/${id}`),
  updateRepairStatus: (id: string, data: UpdateRepairRequestStatus) =>
    api.put<RepairRequest>(`/employee/repairs/${id}/status`, data),
  updateRepairAmount: (id: string, data: UpdateRepairRequestAmount) =>
    api.put<RepairRequest>(`/employee/repairs/${id}/amount`, data),
  tasks: (params?: EmployeeTaskParams) =>
    api.get<EmployeeTaskItem[]>(
      "/employee/tasks",
      params as Record<string, string | number>,
    ),
  followUp: (entityType: OperationalEntityType, entityId: string) =>
    api.get<OperationalFollowUp | null>("/employee/follow-ups", {
      entity_type: entityType,
      entity_id: entityId,
    }),
  upsertFollowUp: (data: UpsertOperationalFollowUpRequest) =>
    api.put<OperationalFollowUp>("/employee/follow-ups", data),
  notes: (entityType: OperationalEntityType, entityId: string, params?: PaginationParams) =>
    api.get<OperationalNote[]>("/employee/notes", {
      entity_type: entityType,
      entity_id: entityId,
      ...(params as Record<string, string | number | undefined>),
    }),
  createNote: (data: CreateOperationalNoteRequest) =>
    api.post<OperationalNote>("/employee/notes", data),
};

export const payments = {
  create: (data: CreatePaymentRequest) =>
    api.post<CheckoutResult>("/payments", data),
  renewSubscription: (data: RenewSubscriptionPaymentRequest) =>
    api.post<CheckoutResult>("/payments/renew-subscription", data),
  list: (params?: PaginationParams) =>
    api.get<Payment[]>("/payments", params as Record<string, string | number>),
  get: (id: string) => api.get<Payment>(`/payments/${id}`),
  checkout: (id: string) => api.get<CheckoutResult>(`/payments/${id}/checkout`),
  resume: (id: string) => api.post<CheckoutResult>(`/payments/${id}/resume`),
};
