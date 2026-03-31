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
export type UserRole = "admin" | "employee" | "member" | "partner" | "viewer";
export type PartnerApplicationStatus = "pending" | "approved" | "rejected";
export type PartnerAttributionSource =
  | "manual_invitation"
  | "partner_referral_link";
export type PartnerReferralMedium = "qr" | "share" | "unknown";
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
export type DashboardCoverageStatus =
  | "active"
  | "awaiting_payment"
  | "pending_activation"
  | "pending"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded"
  | "suspended";
export type OperationalEntityType =
  | "client"
  | "subscription"
  | "claim"
  | "repair";
export type FollowUpStatus =
  | "to_contact"
  | "contacted"
  | "awaiting_response"
  | "resolved";
export type PaymentFollowUpContext = "first_payment" | "renewal";
export type EmployeeAccountStatus = "active" | "inactive" | "suspended";
export type AdminEmployeeSort = "recent_activity" | "joined";

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

export interface MemberDashboardDeviceSummary {
  device: Device;
  coverage_status: DashboardCoverageStatus;
  subscription?: Subscription;
  payment?: Payment;
}

export interface MemberDashboardActiveSubscription {
  subscription: Subscription;
  device?: Device;
}

export interface MemberDashboardSummary {
  active_subscriptions_count: number;
  devices_count: number;
  claims_count: number;
  payments_count: number;
  pending_activation_devices: Device[];
  recent_devices: MemberDashboardDeviceSummary[];
  recent_claims: Claim[];
  recent_payments: Payment[];
  active_subscriptions: MemberDashboardActiveSubscription[];
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
  referral_code: string;
  commission_percentage: number;
  status: string;
  total_clients: number;
  active_clients: number;
  plans_purchased: number;
  total_commission_earned_xof: number;
  total_commission_owed_xof: number;
  total_commission_paid_xof: number;
}

export interface PartnerReferralDetails {
  partner_id: string;
  partner_store_name: string;
  partner_city: string;
  referral_code: string;
  referral_link?: string;
  status: string;
}

export interface PartnerReferralVisitResult {
  referral?: PartnerReferralDetails;
  visitor_token: string;
  source_medium: PartnerReferralMedium;
  visited_at: string;
}

export interface PartnerReferralMetrics {
  total_visits: number;
  qr_visits: number;
  share_visits: number;
  total_signups: number;
  payment_pending_count: number;
  active_clients: number;
  conversion_rate: number;
}

export interface PartnerPlanBreakdown {
  plan_id?: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  count: number;
}

export interface PartnerDashboardOverview {
  profile?: PartnerProfile;
  referral_link: string;
  referral_metrics?: PartnerReferralMetrics;
  plan_breakdown: PartnerPlanBreakdown[];
  recent_clients: PartnerClient[];
}

export interface OperationalFollowUp {
  id: string;
  org_id: string;
  entity_type: OperationalEntityType;
  entity_id: string;
  reason?: string;
  status: FollowUpStatus;
  next_action?: string;
  last_contact_at?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OperationalNote {
  id: string;
  org_id: string;
  entity_type: OperationalEntityType;
  entity_id: string;
  body: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export interface EmployeeOverviewMetrics {
  unpaid_subscriptions_count: number;
  pending_payments_count: number;
  failed_payments_count: number;
  clients_needing_follow_up_count: number;
  pending_claims_count: number;
  repairs_in_progress_count: number;
  overdue_repairs_count: number;
  pending_activation_count: number;
  missing_imei_count: number;
  urgent_tasks_count: number;
}

export interface EmployeeClientListItem {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  device_count: number;
  active_subscription_count: number;
  missing_imei_count: number;
  pending_claims_count: number;
  open_repairs_count: number;
  latest_coverage_status: DashboardCoverageStatus;
  partner_store_name?: string;
  requires_attention: boolean;
  follow_up?: OperationalFollowUp;
}

export interface EmployeeClientDeviceCoverage {
  device: Device;
  coverage_status: DashboardCoverageStatus;
  subscription?: Subscription;
  payment?: Payment;
  plan_name_fr?: string;
  plan_name_en?: string;
  partner_store_name?: string;
}

export interface EmployeePaymentFollowUpItem {
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  device: Device;
  subscription?: Subscription;
  payment?: Payment;
  coverage_status: DashboardCoverageStatus;
  plan_name_fr?: string;
  plan_name_en?: string;
  payment_context: PaymentFollowUpContext;
  requires_attention: boolean;
  attention_reason: string;
  partner_store_name?: string;
  follow_up?: OperationalFollowUp;
}

export interface EmployeeClaimDetail {
  claim: Claim;
  client_name: string;
  client_email: string;
  client_phone?: string;
  device_brand: string;
  device_model: string;
  device_type: DeviceType;
  subscription_status: SubscriptionStatus;
  coverage_status: DashboardCoverageStatus;
  plan_name_fr?: string;
  plan_name_en?: string;
  partner_store_name?: string;
  follow_up?: OperationalFollowUp;
  notes: OperationalNote[];
}

export interface EmployeeRepairDetail {
  repair: RepairRequest;
  client_id?: string;
  client_email?: string;
  partner_store_name?: string;
  follow_up?: OperationalFollowUp;
  notes: OperationalNote[];
}

export interface EmployeeTaskItem {
  id: string;
  entity_type: OperationalEntityType;
  entity_id: string;
  title: string;
  description: string;
  reason: string;
  priority: "high" | "medium" | "low";
  client_name: string;
  client_email?: string;
  client_phone?: string;
  partner_store_name?: string;
  status: string;
  follow_up_status?: FollowUpStatus;
  next_action?: string;
  last_contact_at?: string;
  updated_at: string;
}

export interface EmployeeClientDetail {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  partner_store_name?: string;
  devices: EmployeeClientDeviceCoverage[];
  payment_follow_ups: EmployeePaymentFollowUpItem[];
  claims: EmployeeClaimDetail[];
  repairs: EmployeeRepairDetail[];
  follow_up?: OperationalFollowUp;
  notes: OperationalNote[];
}

export interface EmployeeDashboardOverview {
  metrics: EmployeeOverviewMetrics;
  payment_follow_ups: EmployeePaymentFollowUpItem[];
  pending_claims: EmployeeClaimDetail[];
  active_repairs: EmployeeRepairDetail[];
  urgent_tasks: EmployeeTaskItem[];
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
  attribution_source: PartnerAttributionSource;
  referral_code?: string;
  referral_medium: PartnerReferralMedium;
  attributed_at?: string;
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
  referral_code: string;
  commission_percentage: number;
  clients_count: number;
  active_clients: number;
  referral_visits: number;
  qr_referral_visits: number;
  referral_signups: number;
  referral_activations: number;
  referral_conversion_rate: number;
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

export interface AdminPartnerReferral {
  partner_client_id: string;
  client_user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  attribution_source: PartnerAttributionSource;
  referral_code?: string;
  referral_medium: PartnerReferralMedium;
  attributed_at?: string;
  plan_id?: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  client_status: PartnerClientStatus;
  subscription_status?: SubscriptionStatus;
  payment_status?: PaymentStatus;
  has_generated_commission: boolean;
  commission_amount_xof?: number;
  commission_status?: string;
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

export interface CreatePartnerReferralVisitRequest {
  visitor_token?: string;
  source_medium?: PartnerReferralMedium;
}

export interface ClaimPartnerReferralRequest {
  source_medium?: PartnerReferralMedium;
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

export interface EmployeeUpdateClaimStatusRequest {
  status: "review";
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

export interface RenewSubscriptionPaymentRequest {
  subscription_id: string;
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

export interface UpsertOperationalFollowUpRequest {
  entity_type: OperationalEntityType;
  entity_id: string;
  reason?: string;
  status: FollowUpStatus;
  next_action?: string;
  last_contact_at?: string;
}

export interface CreateOperationalNoteRequest {
  entity_type: OperationalEntityType;
  entity_id: string;
  body: string;
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

export interface AdminDashboardOverview {
  stats: AdminStats;
  recent_claims: Claim[];
  recent_repairs: RepairRequest[];
}

export interface AdminCustomerSubscription {
  id: string;
  plan_id: string;
  plan_name_fr?: string;
  plan_name_en?: string;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "annual";
  device_id: string;
  device_brand?: string;
  device_model?: string;
  device_type?: DeviceType;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminCustomer {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
  partner_store_name?: string;
  partner_referral_code?: string;
  partner_attribution_source?: PartnerAttributionSource;
  partner_attributed_at?: string;
  device_count: number;
  active_subscription_count: number;
  total_subscription_count: number;
  subscriptions: AdminCustomerSubscription[];
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

export interface AdminEmployeeWorkloadSummary {
  clients_followed_count: number;
  active_claims_count: number;
  active_repairs_count: number;
  open_follow_ups_count: number;
  last_activity_at?: string;
  last_login_at?: string;
}

export interface AdminEmployeeListItem {
  id: string;
  better_auth_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: EmployeeAccountStatus;
  suspended_reason?: string;
  joined_at: string;
  workload: AdminEmployeeWorkloadSummary;
}

export interface AdminEmployeeActivityItem {
  kind: string;
  entity_type: OperationalEntityType;
  entity_id: string;
  description: string;
  occurred_at: string;
}

export interface AdminEmployeeDetail {
  id: string;
  better_auth_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: EmployeeAccountStatus;
  suspended_reason?: string;
  created_at: string;
  updated_at: string;
  workspace_access: boolean;
  permission_summary: string[];
  workload: AdminEmployeeWorkloadSummary;
  recent_activity: AdminEmployeeActivityItem[];
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

export interface AdminEmployeeParams extends PaginationParams {
  search?: string;
  status?: EmployeeAccountStatus;
  sort?: AdminEmployeeSort;
}

export interface EmployeeClientParams extends PaginationParams {
  search?: string;
}

export interface EmployeePaymentFollowUpParams extends PaginationParams {
  search?: string;
}

export interface EmployeeClaimParams extends PaginationParams {
  status?: ClaimStatus;
  search?: string;
}

export interface EmployeeRepairParams extends PaginationParams {
  status?: RepairRequestStatus;
  search?: string;
}

export type EmployeeTaskParams = PaginationParams;

export interface CreateEmployeeRequest {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  status: EmployeeAccountStatus;
  suspended_reason?: string;
}

export interface UpdateEmployeeProfileRequest {
  full_name: string;
  email: string;
  phone?: string;
}

export interface ResetEmployeePasswordRequest {
  password: string;
}

export interface UpdateEmployeeStatusRequest {
  status: EmployeeAccountStatus;
  suspended_reason?: string;
}
