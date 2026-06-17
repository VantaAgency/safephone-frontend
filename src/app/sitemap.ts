import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSiteURL } from "@/lib/site-url";
import { hostKind, US_ORIGIN } from "@/lib/markets/domains";

// Senegal market (safephone.sn / legacy hosts). Bare public routes that the
// proxy canonicalises to /sn/*.
const SN_ROUTES = [
  "",
  "/forfaits",
  "/partenaires",
  "/contact",
  "/inscription",
  "/paiement",
  "/reparations",
  "/sinistres",
  "/connexion",
  "/inscription-compte",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
];

// United States market (safephone.us) — clean, prefix-less URLs.
const US_ROUTES = [
  "",
  "/pricing",
  "/claims",
  "/repair",
  "/partners",
  "/contact",
  "/how-it-works",
  "/signup",
  "/login",
  "/terms",
  "/privacy",
  "/repair-protection-terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const isUS =
    hostKind(headerStore.get("host") ?? headerStore.get("x-forwarded-host")) ===
    "us";

  const base = isUS ? US_ORIGIN : getSiteURL();
  const routes = isUS ? US_ROUTES : SN_ROUTES;
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
