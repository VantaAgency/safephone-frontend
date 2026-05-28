import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";

export const metadata: Metadata = {
  title: "SafePhone — La protection smartphone de confiance au Sénégal",
  description:
    "Protégez votre smartphone contre la casse. Abonnement mensuel, déclaration en ligne, réparation gratuite chez MobiTech.",
  alternates: { canonical: "/sn" },
  openGraph: {
    title: "SafePhone — La protection smartphone de confiance au Sénégal",
    description:
      "Protégez votre smartphone contre la casse. Abonnement mensuel, déclaration en ligne, réparation gratuite chez MobiTech.",
    siteName: "SafePhone",
    locale: "fr_SN",
    type: "website",
  },
};

export default HomePage;
