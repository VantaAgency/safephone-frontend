import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSiteURL } from "@/lib/site-url";
import { hostKind, US_ORIGIN } from "@/lib/markets/domains";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const kind = hostKind(
    headerStore.get("host") ?? headerStore.get("x-forwarded-host"),
  );
  const base = kind === "us" ? US_ORIGIN : getSiteURL();

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
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
