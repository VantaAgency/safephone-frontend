// Types mirroring safephone-backend/internal/domain/models.go

// --- Enums ---

export type DeviceStatus = "pending" | "active" | "expired" | "suspended";
export type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired";
export type ClaimType = "screen" | "water" | "theft" | "breakdown";
export type ClaimStatus = "pending" | "review" | "approved" | "rejected" | "settled";
export type PaymentMethod = "wave" | "orange_money" | "free_money" | "card";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PlanTier = "entry" | "mid" | "mid-high" | "premium" | "household";
export type UserRole = "admin" | "member" | "viewer";

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
  subscription_id: string;
  amount_xof: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  provider_ref?: string;
  idempotency_key?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// --- Request types ---

export interface CreateDeviceRequest {
  brand: string;
  model: string;
  imei: string;
}

export interface UpdateDeviceRequest {
  brand: string;
  model: string;
  status: DeviceStatus;
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
  subscription_id: string;
  payment_method: PaymentMethod;
  idempotency_key?: string;
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

// --- Pagination params ---

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface AdminClaimParams extends PaginationParams {
  status?: ClaimStatus;
}
