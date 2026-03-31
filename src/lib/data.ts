// ── Static Config (no backend equivalents) ──

export const REPAIR_TYPES = [
  {
    id: "screen",
    labelFr: "Remplacement écran",
    labelEn: "Screen replacement",
    icon: "screen",
    time: "1–2h",
    priceFr: "À partir de 15 000 XOF",
    priceEn: "From 15,000 XOF",
  },
  {
    id: "battery",
    labelFr: "Remplacement batterie",
    labelEn: "Battery replacement",
    icon: "battery",
    time: "30–60 min",
    priceFr: "À partir de 8 000 XOF",
    priceEn: "From 8,000 XOF",
  },
  {
    id: "charging",
    labelFr: "Port de charge",
    labelEn: "Charging port",
    icon: "charging",
    time: "1h",
    priceFr: "À partir de 5 000 XOF",
    priceEn: "From 5,000 XOF",
  },
  {
    id: "camera",
    labelFr: "Réparation caméra",
    labelEn: "Camera repair",
    icon: "camera",
    time: "1–2h",
    priceFr: "À partir de 10 000 XOF",
    priceEn: "From 10,000 XOF",
  },
  {
    id: "water",
    labelFr: "Dégâts des eaux",
    labelEn: "Water damage",
    icon: "water",
    time: "2–24h",
    priceFr: "Diagnostic gratuit",
    priceEn: "Free diagnostic",
  },
  {
    id: "software",
    labelFr: "Problème logiciel",
    labelEn: "Software issue",
    icon: "software",
    time: "1h",
    priceFr: "À partir de 3 000 XOF",
    priceEn: "From 3,000 XOF",
  },
];

export const REPAIR_LOCATIONS = [
  {
    id: "colobane",
    name: "MobiTech Colobane",
    address: "Colobane, Dakar",
    hours: "8h–19h",
    distance: "Disponible",
  },
  {
    id: "sham",
    name: "MobiTech SHAM",
    address: "SHAM, Dakar",
    hours: "8h–19h",
    distance: "Disponible",
  },
  {
    id: "ouest-foire",
    name: "MobiTech Ouest Foire",
    address: "Ouest Foire, Dakar",
    hours: "8h–19h",
    distance: "Disponible",
  },
  {
    id: "keur-massar",
    name: "MobiTech Keur Massar",
    address: "Keur Massar, Dakar",
    hours: "8h–19h",
    distance: "Disponible",
  },
  {
    id: "thies",
    name: "MobiTech Thiès",
    address: "Thiès",
    hours: "8h–19h",
    distance: "Disponible",
  },
  {
    id: "pikine",
    name: "MobiTech Pikine",
    address: "Pikine, Dakar",
    hours: "8h–19h",
    distance: "Disponible",
  },
  {
    id: "kaolack",
    name: "MobiTech Kaolack",
    address: "Kaolack",
    hours: "8h–19h",
    distance: "Disponible",
  },
];

export const DEVICE_BRANDS = [
  { id: "iphone", labelFr: "iPhone", labelEn: "iPhone" },
  { id: "samsung", labelFr: "Samsung", labelEn: "Samsung" },
  { id: "tecno", labelFr: "Tecno / Infinix", labelEn: "Tecno / Infinix" },
  { id: "itel", labelFr: "Itel / Wiko", labelEn: "Itel / Wiko" },
  { id: "huawei", labelFr: "Huawei / Honor", labelEn: "Huawei / Honor" },
  { id: "other", labelFr: "Autre marque", labelEn: "Other brand" },
];

export const DEVICE_BRAND_PREVIEW = {
  iphone: { labelFr: "Apple", labelEn: "Apple" },
  samsung: { labelFr: "Samsung", labelEn: "Samsung" },
  tecno: { labelFr: "Tecno", labelEn: "Tecno" },
  itel: { labelFr: "Itel", labelEn: "Itel" },
  huawei: { labelFr: "Huawei", labelEn: "Huawei" },
  other: { labelFr: "Téléphone", labelEn: "Phone" },
} as const;

export const DEVICE_MODEL_SUGGESTIONS = {
  iphone: [
    "iPhone 13",
    "iPhone 13 mini",
    "iPhone 13 Pro",
    "iPhone 13 Pro Max",
    "iPhone 14",
    "iPhone 14 Plus",
    "iPhone 14 Pro",
    "iPhone 15",
    "iPhone 15 Pro",
    "iPhone 15 Pro Max",
  ],
  samsung: [
    "Galaxy A13",
    "Galaxy A14",
    "Galaxy A24",
    "Galaxy A34",
    "Galaxy A54",
    "Galaxy S22",
    "Galaxy S23",
    "Galaxy S24",
    "Galaxy Z Flip 5",
  ],
  tecno: [
    "Spark 10",
    "Spark 20",
    "Camon 20",
    "Camon 30",
    "Phantom V Fold",
    "Infinix Hot 40i",
    "Infinix Note 30",
    "Infinix Note 40",
  ],
  itel: ["Itel A70", "Itel P55", "Itel S23", "Wiko T10", "Wiko Y62"],
  huawei: [
    "Huawei nova 11i",
    "Huawei Y9a",
    "Honor X7a",
    "Honor 90 Lite",
    "Honor X8b",
  ],
  other: [],
} as const;

export const PAYMENT_METHODS = [
  { id: "wave", label: "Wave", color: "#1B95C8" },
  { id: "orange", label: "Orange Money", color: "#F77F00" },
  { id: "free", label: "Free Money", color: "#003087" },
  {
    id: "stripe",
    labelFr: "Carte bancaire",
    labelEn: "Bank card",
    color: "#635BFF",
  },
];

export const TESTIMONIALS = [
  {
    name: "Aminata Diallo",
    role: { fr: "Étudiante, Dakar", en: "Student, Dakar" },
    text: {
      fr: "Mon écran s'est cassé en tombant du car rapide. SafePhone a tout pris en charge en 48h. Je recommande à tout le monde !",
      en: "My screen cracked falling from the bus. SafePhone handled everything in 48h. I recommend it to everyone!",
    },
    plan: "Écran+",
  },
  {
    name: "Ousmane Ndiaye",
    role: {
      fr: "Commerçant, Parcelles Assainies",
      en: "Merchant, Parcelles Assainies",
    },
    text: {
      fr: "J'ai perdu mon Samsung au marché. Avec la formule Haute, j'ai eu un téléphone de remplacement le lendemain. Excellent service.",
      en: "I lost my Samsung at the market. With the Premium plan, I had a replacement phone the next day. Excellent service.",
    },
    plan: "Haute",
  },
  {
    name: "Fatou Sow",
    role: { fr: "Infirmière, Guédiawaye", en: "Nurse, Guédiawaye" },
    text: {
      fr: "Le paiement avec Wave est trop facile. Chaque mois c'est automatique. Et quand mon téléphone a eu un problème, MobiTech l'a réparé vite.",
      en: "Paying with Wave is so easy. Every month it's automatic. And when my phone had an issue, MobiTech fixed it fast.",
    },
    plan: "Plus",
  },
];

// ── Helpers ──

export function formatXOF(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} XOF`;
}
