import type { Metadata } from "next";
import PaymentPage from "@/components/pages/PaymentPage";

// SN-only payment flow — US uses Stripe Checkout directly (no /us/paiement
// equivalent route). Proxy.ts in Phase 9 will redirect US visitors hitting
// /paiement to /us/pricing.
export const metadata: Metadata = {
  title: "Paiement · SafePhone",
  description: "Finalisez votre abonnement SafePhone via Wave, Orange Money ou Free Money.",
};

export default PaymentPage;
