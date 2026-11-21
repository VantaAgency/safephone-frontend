import type { Metadata } from "next";
import USCheckoutSuccessPage from "@/components/pages/USCheckoutSuccessPage";

export const metadata: Metadata = {
  title: "Finish setting up your protection · SafePhone",
  description:
    "Register your device after Stripe confirms your payment.",
};

export default USCheckoutSuccessPage;
