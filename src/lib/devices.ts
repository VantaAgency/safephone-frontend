import type { Device, DeviceMetadata, DeviceType, Plan } from "@/lib/api/types";

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
    descriptionFr: "Portable ou fixe couvert par votre formule.",
    descriptionEn: "Laptop or desktop covered by your plan.",
  },
  {
    id: "game_console",
    labelFr: "Console de jeux",
    labelEn: "Game console",
    descriptionFr: "Console declaree, aucun IMEI requis.",
    descriptionEn: "Declared console, no IMEI required.",
  },
];

// Popular "brand + model" suggestions per non-smartphone category. Used by the
// single combined device-name combobox; the user can always type their own.
export const DEVICE_SUGGESTIONS: Partial<Record<DeviceType, string[]>> = {
  tablet: [
    "Apple iPad",
    "Apple iPad Air",
    "Apple iPad Pro",
    "Apple iPad mini",
    "Samsung Galaxy Tab S9",
    "Samsung Galaxy Tab A9",
    "Lenovo Tab",
    "Xiaomi Pad 6",
    "Huawei MatePad",
  ],
  tv: [
    "Samsung QLED",
    "Samsung Crystal UHD",
    "LG OLED",
    "LG NanoCell",
    "Sony Bravia",
    "TCL",
    "Hisense",
    "Philips",
  ],
  computer: [
    "Apple MacBook Air",
    "Apple MacBook Pro",
    "Dell XPS",
    "Dell Inspiron",
    "HP Pavilion",
    "HP Spectre",
    "Lenovo ThinkPad",
    "Lenovo IdeaPad",
    "Asus ZenBook",
    "Acer Aspire",
  ],
  game_console: [
    "Sony PlayStation 5",
    "Sony PlayStation 4",
    "Microsoft Xbox Series X",
    "Microsoft Xbox Series S",
    "Microsoft Xbox One",
    "Nintendo Switch",
    "Nintendo Switch OLED",
    "Steam Deck",
  ],
};

// Verification proof requested at the payment step, tailored to the device.
// Smartphones/tablets show a front (screen) + back photo; TVs, computers and
// consoles just need a single photo of the device powered on. The video always
// shows the device powered on.
export function deviceVerificationSpec(
  deviceType: DeviceType | string | undefined,
): {
  photos: Array<{ labelFr: string; labelEn: string }>;
  photoHintFr: string;
  photoHintEn: string;
  videoHintFr: string;
  videoHintEn: string;
} {
  const fmt = "JPG / PNG / WEBP / HEIC";
  const vid = "MP4 / MOV / WEBM";
  if (deviceType === "smartphone" || deviceType === "tablet") {
    return {
      photos: [
        { labelFr: "Avant (écran)", labelEn: "Front (screen)" },
        { labelFr: "Arrière", labelEn: "Back" },
      ],
      photoHintFr: `Une photo de l'avant (écran) et une de l'arrière. ${fmt}, jusqu'à 12 Mo par photo.`,
      photoHintEn: `One photo of the front (screen) and one of the back. ${fmt}, up to 12 MB each.`,
      videoHintFr: `Un court clip montrant l'appareil allumé. ${vid}, jusqu'à 75 Mo.`,
      videoHintEn: `A short clip showing the device powered on. ${vid}, up to 75 MB.`,
    };
  }
  const isTv = deviceType === "tv";
  const subjectFr = isTv ? "le téléviseur" : "l'appareil";
  const subjectEn = isTv ? "the TV" : "the device";
  return {
    photos: [
      isTv
        ? { labelFr: "Téléviseur allumé", labelEn: "TV powered on" }
        : { labelFr: "Appareil allumé", labelEn: "Device powered on" },
    ],
    photoHintFr: `Une photo de ${subjectFr} allumé. ${fmt}, jusqu'à 12 Mo.`,
    photoHintEn: `One photo of ${subjectEn} powered on. ${fmt}, up to 12 MB.`,
    videoHintFr: `Un court clip montrant ${subjectFr} allumé. ${vid}, jusqu'à 75 Mo.`,
    videoHintEn: `A short clip showing ${subjectEn} powered on. ${vid}, up to 75 MB.`,
  };
}

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

// Device types a plan covers (cap > 0), in display order. home_electronics
// has no cap column, so it's only offered on the Total plan.
export function coveredDeviceTypes(
  plan: Plan | null | undefined,
): DeviceType[] {
  if (!plan) return ["smartphone"];
  const covered: DeviceType[] = [];
  if (plan.max_smartphones > 0) covered.push("smartphone");
  if (plan.max_tablets > 0) covered.push("tablet");
  if (plan.max_computers > 0) covered.push("computer");
  if (plan.max_game_consoles > 0) covered.push("game_console");
  if (plan.max_tvs > 0) covered.push("tv");
  return covered.length > 0 ? covered : ["smartphone"];
}

// True when the plan covers more than just a smartphone — i.e. the user
// should get to pick which kind of device to register.
export function planCoversMultipleDeviceTypes(
  plan: Plan | null | undefined,
): boolean {
  return coveredDeviceTypes(plan).length > 1;
}

// Per-type coverage counts for display, only for the types the plan covers.
export function planDeviceCoverageItems(
  plan: Plan | null | undefined,
  lang: "fr" | "en",
): Array<{ type: DeviceType; label: string; count: number }> {
  if (!plan) return [];
  const rows: Array<{ type: DeviceType; count: number; fr: string; en: string }> = [
    { type: "smartphone", count: plan.max_smartphones, fr: "smartphones", en: "phones" },
    { type: "tablet", count: plan.max_tablets, fr: "tablettes", en: "tablets" },
    { type: "computer", count: plan.max_computers, fr: "ordinateurs", en: "computers" },
    { type: "game_console", count: plan.max_game_consoles, fr: "consoles", en: "consoles" },
    { type: "tv", count: plan.max_tvs, fr: "TV", en: "TVs" },
  ];
  return rows
    .filter((r) => r.count > 0)
    .map((r) => ({
      type: r.type,
      count: r.count,
      label: lang === "fr" ? r.fr : r.en,
    }));
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
