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

// ── Partner Pipeline (kept for partner dashboard, no backend yet) ──

export type ClientStatus = "invited" | "plan_purchased" | "device_registered" | "active";

export interface PartnerClient {
  id: string;
  name: string;
  phone: string;
  invitedAt: string;
  status: ClientStatus;
  planId?: string;
  lastActivity: string;
}

export const MOCK_PARTNER_CLIENTS: PartnerClient[] = [
  { id: "PC-001", name: "Amadou Diallo", phone: "+221 77 234 56 78", invitedAt: "10 Mar 2025", status: "active", planId: "ecranplus", lastActivity: "il y a 2 jours" },
  { id: "PC-002", name: "Fatou Mbaye", phone: "+221 76 345 67 89", invitedAt: "08 Mar 2025", status: "device_registered", planId: "essentiel", lastActivity: "il y a 3 jours" },
  { id: "PC-003", name: "Moussa Sarr", phone: "+221 78 456 78 90", invitedAt: "06 Mar 2025", status: "plan_purchased", planId: "plus", lastActivity: "il y a 5 jours" },
  { id: "PC-004", name: "Aissatou Fall", phone: "+221 77 567 89 01", invitedAt: "04 Mar 2025", status: "invited", lastActivity: "il y a 7 jours" },
];

// ── Admin Partners (kept for admin dashboard, no backend yet) ──

export interface AdminPartner {
  id: string;
  storeName: string;
  ownerName: string;
  city: string;
  clientsCount: number;
  activeClients: number;
  commissionThisMonth: number;
  status: "active" | "inactive";
  joinedAt: string;
}

export const MOCK_ADMIN_PARTNERS: AdminPartner[] = [
  { id: "PRT-001", storeName: "Boutique Diallo Mobile", ownerName: "Ousmane Diallo", city: "Dakar — Parcelles Assainies", clientsCount: 48, activeClients: 45, commissionThisMonth: 42600, status: "active", joinedAt: "Jan 2025" },
  { id: "PRT-002", storeName: "TechCenter Plateau", ownerName: "Mamadou Faye", city: "Dakar — Plateau", clientsCount: 31, activeClients: 28, commissionThisMonth: 24800, status: "active", joinedAt: "Jan 2025" },
  { id: "PRT-003", storeName: "Galaxy Phone Almadies", ownerName: "Ibrahima Ndiaye", city: "Dakar — Almadies", clientsCount: 19, activeClients: 17, commissionThisMonth: 15200, status: "active", joinedAt: "Fév 2025" },
  { id: "PRT-004", storeName: "Phone World Thiès", ownerName: "Aïcha Seck", city: "Thiès", clientsCount: 12, activeClients: 10, commissionThisMonth: 9600, status: "active", joinedAt: "Fév 2025" },
  { id: "PRT-005", storeName: "InfoTech Kaolack", ownerName: "Boubacar Diouf", city: "Kaolack", clientsCount: 7, activeClients: 5, commissionThisMonth: 4200, status: "active", joinedAt: "Mar 2025" },
  { id: "PRT-006", storeName: "Mobile Corner Rufisque", ownerName: "Fatimata Ba", city: "Rufisque", clientsCount: 3, activeClients: 0, commissionThisMonth: 0, status: "inactive", joinedAt: "Mar 2025" },
];

// ── Helpers ──

export function formatXOF(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} XOF`;
}
