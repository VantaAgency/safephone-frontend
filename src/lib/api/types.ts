// Types mirroring safephone-backend/internal/domain/models.go

// --- Enums ---

export type DeviceStatus = "pending" | "active" | "expired" | "suspended";
export type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired";
export type ClaimType = "screen" | "water" | "theft" | "breakdown";
export type ClaimStatus = "pending" | "review" | "approved" | "rejected" | "settled";
export type PaymentMethod = string;
export type PaymentProvider = string;
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled" | "expired" | "refunded";
export type PlanTier = "entry" | "mid" | "mid-high" | "premium" | "household";
export type UserRole = "admin" | "member" | "partner" | "viewer";
export type PartnerApplicationStatus = "pending" | "approved" | "rejected";
export type PartnerClientStatus = "draft" | "invited" | "account_created" | "payment_pending" | "active" | "expired" | "cancelled" | "failed";

// --- Domain models ---

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  better_auth_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Plan {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  price_monthly: number;
  price_annual: number;
  tier: PlanTier;
  device_range_fr?: string;
  device_range_en?: string;
  features_fr: string[];
  features_en: string[];
  not_covered_fr: string[];
  not_covered_en: string[];
  service_time: string;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  org_id: string;
  user_id: string;
  brand: string;
  model: string;
  imei: string;
  status: DeviceStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  user_id: string;
  device_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "annual";
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  org_id: string;
  user_id: string;
  device_id: string;
  subscription_id: string;
  claim_type: ClaimType;
  description?: string;
  status: ClaimStatus;
  amount_xof?: number;
  filed_at: string;
  reviewed_at?: string;
  settled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  org_id: string;
  user_id: string;
  plan_id: string;
  subscription_id: string;
  amount_xof: number;
  currency: string;
  provider: PaymentProvider;
  payment_method?: PaymentMethod;
  status: PaymentStatus;
  provider_ref?: string;
  payment_url?: string;
  idempotency_key?: string;
  paid_at?: string;
  failed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// --- Request types ---

export interface UpdateProfileRequest {
  phone: string;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}

export interface CreatePartnerApplicationRequest {
  store_name: string;
  full_name: string;
  phone: string;
  city: string;
}

export interface PartnerApplication {
  id: string;
  org_id: string;
  user_id: string;
  store_name: string;
  full_name: string;
  phone: string;
  city: string;
  status: PartnerApplicationStatus;
  reviewed_by?: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface AdminPartnerApplication {
  id: string;
  org_id: string;
  user_id: string;
  store_name: string;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  status: PartnerApplicationStatus;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface ReviewPartnerApplicationRequest {
  decision: "approved" | "rejected";
  rejection_reason?: string;
}

export interface AdminPartnerApplicationParams extends PaginationParams {
  status?: PartnerApplicationStatus;
}

export interface PartnerProfile {
  id: string;
  store_name: string;
  city: string;
  commission_rate: number;
  status: string;
  total_clients: number;
  active_clients: number;
  plans_purchased: number;
  month_commission_xof: number;
}

export interface PartnerClient {
  id: string;
  org_id: string;
  partner_id: string;
  linked_user_id?: string;
  client_name: string;
  client_phone?: string;
  plan_id?: string;
  status: PartnerClientStatus;
  invitation_url?: string;
  invitation_expires_at?: string;
  invitation_claimed_at?: string;
  invited_at: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerInvitation {
  client_id: string;
  partner_id: string;
  partner_store_name: string;
  partner_city: string;
  client_name: string;
  client_phone?: string;
  plan_id?: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  status: PartnerClientStatus;
  invitation_url?: string;
  invitation_expires_at?: string;
  invitation_claimed_at?: string;
  linked_user_id?: string;
}

export interface PartnerSale {
  id: string;
  customer_name: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  amount_xof: number;
  commission_xof: number;
  date: string;
}

export interface PartnerPayout {
  id: string;
  amount_xof: number;
  payout_method: string;
  status: string;
  paid_at: string;
}

export interface AdminPartner {
  id: string;
  store_name: string;
  owner_name: string;
  city: string;
  clients_count: number;
  active_clients: number;
  commission_this_month: number;
  status: string;
  joined_at: string;
}

export interface RepairBooking {
  id: string;
  reference: string;
  device_type: string;
  repair_type: string;
  location_id: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  created_at: string;
}

export interface CreateRepairBookingRequest {
  device_type: string;
  repair_type: string;
  location_id: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_phone: string;
}

export interface CreatePartnerClientRequest {
  client_name: string;
  client_phone?: string;
  plan_id?: string;
}

export interface UpdatePartnerClientStatusRequest {
  status: string;
  plan_id?: string;
}

export interface CreateDeviceRequest {
  brand: string;
  model: string;
  imei: string;
}

export interface UpdateDeviceRequest {
  brand: string;
  model: string;
  imei?: string;
}

export interface CreateSubscriptionRequest {
  device_id: string;
  plan_id: string;
  billing_cycle: "monthly" | "annual";
}

export interface CreateClaimRequest {
  device_id: string;
  subscription_id: string;
  claim_type: ClaimType;
  description?: string;
}

export interface UpdateClaimStatusRequest {
  status: "review" | "approved" | "rejected" | "settled";
  amount_xof?: number;
}

export interface CreatePaymentRequest {
  brand: string;
  model: string;
  imei: string;
  plan_id: string;
  billing_cycle: "monthly" | "annual";
  idempotency_key?: string;
}

export interface CheckoutResult {
  payment: Payment;
  device: Device;
  subscription: Subscription;
  payment_url?: string;
}

// --- Response envelope ---

export interface ApiMeta {
  request_id: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  request_id: string;
  fields?: Record<string, string>;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

// --- Admin types ---

export interface AdminStats {
  active_subscribers: number;
  monthly_revenue_xof: number;
  open_claims: number;
  revenue_by_provider: Record<string, number>;
  total_customers: number;
  total_devices: number;
}

export interface AdminCustomer {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  device_count: number;
  subscription_status?: string;
}

export interface AdminPayment {
  id: string;
  customer_name: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  amount_xof: number;
  provider: PaymentProvider;
  payment_method?: PaymentMethod;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
}

// --- Pagination params ---

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface AdminClaimParams extends PaginationParams {
  status?: ClaimStatus;
}
