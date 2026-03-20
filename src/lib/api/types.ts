// Types mirroring safephone-backend/internal/domain/models.go

// --- Enums ---

export type DeviceStatus = "pending" | "active" | "expired" | "suspended";
export type DeviceType =
  | "smartphone"
  | "tablet"
  | "tv"
  | "computer"
  | "home_electronics";
export type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired";
export type ClaimType = "screen" | "water" | "theft" | "breakdown";
export type ClaimStatus =
  | "pending"
  | "review"
  | "approved"
  | "rejected"
  | "settled";
export type PaymentMethod = string;
export type PaymentProvider = string;
export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";
export type PlanTier = "entry" | "mid" | "mid-high" | "premium" | "household";
export type UserRole = "admin" | "member" | "partner" | "viewer";
export type PartnerApplicationStatus = "pending" | "approved" | "rejected";
export type PartnerClientStatus =
  | "draft"
  | "invited"
  | "account_created"
  | "payment_pending"
  | "active"
  | "expired"
  | "cancelled"
  | "failed";
export type RepairRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
export type RepairServiceMode = "center" | "home";
export type RepairRequestSource = "public_visitor" | "safephone_user";

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
  device_type: DeviceType;
  brand: string;
  model: string;
  metadata: DeviceMetadata;
  imei: string;
  status: DeviceStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DeviceMetadata {
  serial_number?: string;
  screen_size?: string;
  computer_category?: string;
  product_subtype?: string;
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
  business_location: string;
}

export interface PartnerApplication {
  id: string;
  org_id: string;
  user_id: string;
  store_name: string;
  full_name: string;
  phone: string;
  city: string;
  business_location: string;
  status: PartnerApplicationStatus;
  commission_percentage?: number;
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
  business_location: string;
  status: PartnerApplicationStatus;
  commission_percentage?: number;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface ReviewPartnerApplicationRequest {
  decision: "approved" | "rejected";
  rejection_reason?: string;
  commission_percentage?: number;
}

export interface AdminPartnerApplicationParams extends PaginationParams {
  status?: PartnerApplicationStatus;
}

export interface PartnerProfile {
  id: string;
  store_name: string;
  city: string;
  business_location: string;
  commission_percentage: number;
  status: string;
  total_clients: number;
  active_clients: number;
  plans_purchased: number;
  total_commission_earned_xof: number;
  total_commission_owed_xof: number;
  total_commission_paid_xof: number;
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
  has_generated_commission: boolean;
  commission_amount_xof?: number;
  commission_status?: string;
  commission_percentage?: number;
  commission_created_at?: string;
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
  partner_client_id?: string;
  client_user_id?: string;
  payment_id?: string;
  plan_id?: string;
  customer_name: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  base_amount_xof: number;
  commission_percentage: number;
  commission_amount_xof: number;
  status: string;
  paid_at?: string;
  created_at: string;
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
  business_location: string;
  commission_percentage: number;
  clients_count: number;
  active_clients: number;
  total_commission_earned_xof: number;
  total_commission_owed_xof: number;
  total_commission_paid_xof: number;
  status: string;
  joined_at: string;
}

export interface AdminPartnerCommission {
  id: string;
  partner_client_id?: string;
  client_user_id?: string;
  payment_id?: string;
  plan_id?: string;
  customer_name: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  base_amount_xof: number;
  commission_percentage: number;
  commission_amount_xof: number;
  status: string;
  paid_at?: string;
  created_at: string;
}

export interface RepairRequest {
  id: string;
  reference: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  service_mode: RepairServiceMode;
  center_id?: string;
  preferred_date: string;
  preferred_time: string;
  scheduled_date?: string;
  scheduled_time?: string;
  customer_name: string;
  customer_phone: string;
  status: RepairRequestStatus;
  repair_amount_xof?: number;
  request_source: RepairRequestSource;
  created_at: string;
  updated_at: string;
}

export interface CreateRepairRequest {
  device_brand: string;
  device_model: string;
  repair_type: string;
  service_mode: RepairServiceMode;
  center_id?: string;
  preferred_date: string;
  preferred_time: string;
  customer_name: string;
  customer_phone: string;
}

export interface LookupRepairRequest {
  reference: string;
  customer_phone: string;
}

export interface UpdateRepairRequestStatus {
  status: Exclude<RepairRequestStatus, "pending">;
  scheduled_date?: string;
  scheduled_time?: string;
}

export interface UpdateRepairRequestAmount {
  repair_amount_xof: number;
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
  device_type?: DeviceType;
  brand: string;
  model: string;
  metadata?: DeviceMetadata;
  imei?: string;
}

export interface UpdateDeviceRequest {
  device_type?: DeviceType;
  brand: string;
  model: string;
  metadata?: DeviceMetadata;
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
  device_type?: DeviceType;
  brand: string;
  model: string;
  metadata?: DeviceMetadata;
  imei?: string;
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

export interface AdminRepairParams extends PaginationParams {
  status?: RepairRequestStatus;
  search?: string;
}
