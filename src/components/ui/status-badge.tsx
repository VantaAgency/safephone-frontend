import { cn } from "@/lib/utils";

type BadgeVariant =
  | "awaiting_payment"
  | "pending"
  | "accepted"
  | "pending_activation"
  | "review"
  | "approved"
  | "scheduled"
  | "in_progress"
  | "settled"
  | "completed"
  | "active"
  | "expired"
  | "failed"
  | "rejected"
  | "suspended"
  | "refunded"
  | "cancelled"
  | "info"
  | "draft"
  | "invited"
  | "account_created"
  | "payment_pending";

const variantStyles: Record<BadgeVariant, string> = {
  awaiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  pending_activation: "bg-blue-50 text-blue-700 border-blue-200",
  review: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-violet-50 text-violet-700 border-violet-200",
  settled: "bg-slate-100 text-slate-600 border-slate-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-red-50 text-red-600 border-red-200",
  failed: "bg-red-50 text-red-600 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  suspended: "bg-orange-50 text-orange-600 border-orange-200",
  refunded: "bg-purple-50 text-purple-600 border-purple-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  invited: "bg-sky-50 text-sky-700 border-sky-200",
  account_created: "bg-blue-50 text-blue-700 border-blue-200",
  payment_pending: "bg-violet-50 text-violet-700 border-violet-200",
};

const dotColors: Record<BadgeVariant, string> = {
  awaiting_payment: "bg-amber-500",
  pending: "bg-amber-500",
  accepted: "bg-blue-500",
  pending_activation: "bg-blue-500",
  review: "bg-blue-500",
  approved: "bg-emerald-500",
  scheduled: "bg-sky-500",
  in_progress: "bg-violet-500",
  settled: "bg-slate-400",
  completed: "bg-emerald-500",
  active: "bg-emerald-500",
  expired: "bg-red-500",
  failed: "bg-red-500",
  info: "bg-blue-500",
  rejected: "bg-red-500",
  suspended: "bg-orange-500",
  refunded: "bg-purple-500",
  cancelled: "bg-slate-400",
  draft: "bg-slate-400",
  invited: "bg-sky-500",
  account_created: "bg-blue-500",
  payment_pending: "bg-violet-500",
};

interface StatusBadgeProps {
  status: BadgeVariant;
  label: string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ status, label, className, dot = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[status] ?? variantStyles.info,
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[status] ?? dotColors.info)} />
      )}
      {label}
    </span>
  );
}
