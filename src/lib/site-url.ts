const DEFAULT_SITE_URL = "https://www.safephone.sn";

export function getSiteURL() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_SITE_URL;

  return raw.trim().replace(/\/+$/, "") || DEFAULT_SITE_URL;
}
