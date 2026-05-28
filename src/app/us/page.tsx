import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";

export const metadata: Metadata = {
  title: "SafePhone — Affordable phone repair protection",
  description:
    "SafePhone helps you prepare for expensive phone repair surprises with simple monthly plans, clear claim rules, and guided repair support.",
  alternates: { canonical: "/us" },
  openGraph: {
    title: "SafePhone — Affordable phone repair protection",
    description:
      "SafePhone helps you prepare for expensive phone repair surprises with simple monthly plans, clear claim rules, and guided repair support.",
    siteName: "SafePhone",
    locale: "en_US",
    type: "website",
  },
};

export default HomePage;
