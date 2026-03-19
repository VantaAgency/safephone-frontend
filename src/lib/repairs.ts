import type {
  RepairRequest,
  RepairRequestStatus,
} from "@/lib/api/types";
import type { Lang } from "@/lib/i18n";
import { DEVICE_BRANDS, REPAIR_LOCATIONS, REPAIR_TYPES } from "@/lib/data";

export const REPAIR_PROGRESS_FLOW: RepairRequestStatus[] = [
  "pending",
  "accepted",
  "scheduled",
  "in_progress",
  "completed",
];

export const ADMIN_REPAIR_TRANSITIONS: Record<
  RepairRequestStatus,
  RepairRequestStatus[]
> = {
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["scheduled", "in_progress", "cancelled"],
  rejected: [],
  scheduled: ["in_progress", "completed", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function getRepairStatusLabel(
  status: RepairRequestStatus,
  lang: Lang,
): string {
  const labels: Record<RepairRequestStatus, { fr: string; en: string }> = {
    pending: { fr: "En attente", en: "Pending" },
    accepted: { fr: "Acceptée", en: "Accepted" },
    rejected: { fr: "Refusée", en: "Rejected" },
    scheduled: { fr: "Planifiée", en: "Scheduled" },
    in_progress: { fr: "En cours", en: "In progress" },
    completed: { fr: "Terminée", en: "Completed" },
    cancelled: { fr: "Annulée", en: "Cancelled" },
  };

  return labels[status]?.[lang] ?? status;
}

export function getRepairBrandLabel(brand: string, lang: Lang): string {
  const match = DEVICE_BRANDS.find((item) => item.id === brand);
  if (!match) return brand;
  return lang === "fr" ? match.labelFr : match.labelEn;
}

export function getRepairTypeLabel(repairType: string, lang: Lang): string {
  const match = REPAIR_TYPES.find((item) => item.id === repairType);
  if (!match) return repairType;
  return lang === "fr" ? match.labelFr : match.labelEn;
}

export function getRepairCenterName(centerId?: string | null): string | null {
  if (!centerId) return null;
  return REPAIR_LOCATIONS.find((item) => item.id === centerId)?.name ?? centerId;
}

export function getRepairServiceLabel(
  repair: Pick<RepairRequest, "service_mode" | "center_id">,
  lang: Lang,
): string {
  if (repair.service_mode === "home") {
    return lang === "fr" ? "Service à domicile" : "Home service";
  }
  return (
    getRepairCenterName(repair.center_id) ??
    (lang === "fr" ? "Centre MobiTech" : "MobiTech center")
  );
}

export function formatRepairDeviceLabel(
  repair: Pick<RepairRequest, "device_brand" | "device_model">,
  lang: Lang,
): string {
  return `${getRepairBrandLabel(repair.device_brand, lang)} ${repair.device_model}`.trim();
}

export function formatRepairPreferredSlot(
  repair: Pick<RepairRequest, "preferred_date" | "preferred_time">,
): string {
  return `${repair.preferred_date} — ${repair.preferred_time}`;
}

export function formatRepairScheduledSlot(
  repair: Pick<RepairRequest, "scheduled_date" | "scheduled_time">,
): string | null {
  if (!repair.scheduled_date || !repair.scheduled_time) return null;
  return `${repair.scheduled_date} — ${repair.scheduled_time}`;
}

export function getRepairProgressIndex(status: RepairRequestStatus): number {
  return REPAIR_PROGRESS_FLOW.indexOf(status);
}
