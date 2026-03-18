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
  { id: "plateau", name: "MobiTech Plateau", address: "Av. Léopold Sédar Senghor, Dakar Plateau", hours: "8h–20h", distance: "0.8 km" },
  { id: "almadies", name: "MobiTech Almadies", address: "Route des Almadies, Centre Commercial", hours: "9h–21h", distance: "4.2 km" },
  { id: "parcelles", name: "MobiTech Parcelles Assainies", address: "Unité 17, Parcelles Assainies", hours: "8h–19h", distance: "6.1 km" },
  { id: "guediawaye", name: "MobiTech Guédiawaye", address: "Marché HLM, Guédiawaye", hours: "8h–19h", distance: "8.4 km" },
];

export const DEVICE_BRANDS = [
  { id: "iphone", labelFr: "iPhone", labelEn: "iPhone" },
  { id: "samsung", labelFr: "Samsung", labelEn: "Samsung" },
  { id: "tecno", labelFr: "Tecno / Infinix", labelEn: "Tecno / Infinix" },
  { id: "itel", labelFr: "Itel / Wiko", labelEn: "Itel / Wiko" },
  { id: "huawei", labelFr: "Huawei / Honor", labelEn: "Huawei / Honor" },
  { id: "other", labelFr: "Autre marque", labelEn: "Other brand" },
];

export const PAYMENT_METHODS = [
  { id: "wave", label: "Wave", color: "#1B95C8" },
  { id: "orange", label: "Orange Money", color: "#F77F00" },
  { id: "free", label: "Free Money", color: "#003087" },
  { id: "stripe", labelFr: "Carte bancaire", labelEn: "Bank card", color: "#635BFF" },
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
    role: { fr: "Commerçant, Parcelles Assainies", en: "Merchant, Parcelles Assainies" },
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
