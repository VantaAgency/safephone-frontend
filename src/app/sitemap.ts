import type { MetadataRoute } from "next";
import { getSiteURL } from "@/lib/site-url";

const PUBLIC_ROUTES = [
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

export default function sitemap(): MetadataRoute.Sitemap {
  const siteURL = getSiteURL();
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${siteURL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
