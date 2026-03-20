import type { Device, DeviceMetadata, DeviceType } from "@/lib/api/types";

export const TOTAL_PLAN_SLUG = "totale";

export const DEVICE_TYPE_OPTIONS: Array<{
  id: DeviceType;
  labelFr: string;
  labelEn: string;
  descriptionFr: string;
  descriptionEn: string;
}> = [
  {
    id: "smartphone",
    labelFr: "Smartphone",
    labelEn: "Smartphone",
    descriptionFr: "Telephone principal avec IMEI a ajouter apres paiement.",
    descriptionEn: "Primary phone with IMEI added after payment.",
  },
  {
    id: "tablet",
    labelFr: "Tablette",
    labelEn: "Tablet",
    descriptionFr: "Tablette declaree dans la Formule Totale.",
    descriptionEn: "Tablet declared under the Total plan.",
  },
  {
    id: "tv",
    labelFr: "TV",
    labelEn: "TV",
    descriptionFr: "Televiseur declare avec details de modele.",
    descriptionEn: "Declared television with model details.",
  },
  {
    id: "computer",
    labelFr: "Ordinateur",
    labelEn: "Computer",
    descriptionFr: "Portable ou fixe couvert par la Formule Totale.",
    descriptionEn: "Laptop or desktop covered by the Total plan.",
  },
  {
    id: "home_electronics",
    labelFr: "Electronique domestique",
    labelEn: "Home electronics",
    descriptionFr: "Equipement menager ou electronique declare.",
    descriptionEn: "Declared domestic or home electronic equipment.",
  },
];

export const COMPUTER_CATEGORY_OPTIONS = [
  { id: "laptop", labelFr: "Portable", labelEn: "Laptop" },
  { id: "desktop", labelFr: "Bureau", labelEn: "Desktop" },
  { id: "other", labelFr: "Autre", labelEn: "Other" },
] as const;

export function isTotalPlanSlug(slug?: string | null): boolean {
  return (slug ?? "").trim().toLowerCase() === TOTAL_PLAN_SLUG;
}

export function getDeviceTypeLabel(
  deviceType: DeviceType | string | undefined,
  lang: "fr" | "en",
): string {
  const option = DEVICE_TYPE_OPTIONS.find((item) => item.id === deviceType);
  if (!option) {
    return lang === "fr" ? "Appareil" : "Device";
  }
  return lang === "fr" ? option.labelFr : option.labelEn;
}

export function deviceRequiresImei(
  deviceType: DeviceType | string | undefined,
): boolean {
  return (deviceType ?? "smartphone") === "smartphone";
}

export function formatDeviceDisplayName(
  device: Pick<Device, "device_type" | "brand" | "model" | "metadata">,
  lang: "fr" | "en",
): string {
  const brand = device.brand?.trim() ?? "";
  const model = device.model?.trim() ?? "";
  const subtype = device.metadata?.product_subtype?.trim() ?? "";

  if (device.device_type === "home_electronics") {
    const parts = [brand, subtype, model].filter(Boolean);
    return (
      parts.join(" ") ||
      (lang === "fr" ? "Appareil declare" : "Declared device")
    );
  }

  if (!brand) return model || getDeviceTypeLabel(device.device_type, lang);
  if (!model) return brand;

  const normalizedBrand = brand.toLowerCase();
  const normalizedModel = model.toLowerCase();
  if (
    normalizedModel === normalizedBrand ||
    normalizedModel.startsWith(`${normalizedBrand} `)
  ) {
    return model;
  }

  return `${brand} ${model}`;
}

export function getDeviceMetadataSummary(
  metadata: DeviceMetadata | undefined,
  deviceType: DeviceType | string | undefined,
  lang: "fr" | "en",
): string {
  if (!metadata) return "";

  if (deviceType === "computer" && metadata.computer_category) {
    const matched = COMPUTER_CATEGORY_OPTIONS.find(
      (item) => item.id === metadata.computer_category,
    );
    return matched
      ? lang === "fr"
        ? matched.labelFr
        : matched.labelEn
      : metadata.computer_category;
  }

  if (deviceType === "tv" && metadata.screen_size) {
    return lang === "fr"
      ? `Ecran ${metadata.screen_size}`
      : `${metadata.screen_size} screen`;
  }

  if (deviceType === "home_electronics" && metadata.product_subtype) {
    return metadata.product_subtype;
  }

  if (metadata.serial_number) {
    return lang === "fr"
      ? `Serie ${metadata.serial_number}`
      : `Serial ${metadata.serial_number}`;
  }

  return "";
}

export function getDeviceIdentifierSummary(
  device: Pick<Device, "device_type" | "imei" | "metadata">,
  lang: "fr" | "en",
): string {
  if (deviceRequiresImei(device.device_type)) {
    return device.imei
      ? `IMEI: ${device.imei}`
      : lang === "fr"
        ? "IMEI non renseigne"
        : "IMEI not provided";
  }

  if (device.metadata?.serial_number) {
    return lang === "fr"
      ? `Numero de serie: ${device.metadata.serial_number}`
      : `Serial number: ${device.metadata.serial_number}`;
  }

  return "";
}
