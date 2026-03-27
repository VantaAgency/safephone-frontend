import type { MetadataRoute } from "next";
import { getSiteURL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteURL = getSiteURL();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/espace-employe",
        "/espace-partenaire",
        "/tableau-de-bord",
        "/api/",
      ],
    },
    sitemap: `${siteURL}/sitemap.xml`,
    host: siteURL,
  };
}
