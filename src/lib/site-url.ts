const DEFAULT_SITE_URL = "https://www.safephone.sn";

export function getConfiguredSiteURL() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "";

  return raw.trim().replace(/\/+$/, "");
}

export function getSiteURL() {
  const raw = getConfiguredSiteURL() || DEFAULT_SITE_URL;

  return raw.trim().replace(/\/+$/, "") || DEFAULT_SITE_URL;
}
