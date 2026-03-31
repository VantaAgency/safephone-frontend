import { getConfiguredSiteURL, getSiteURL } from "@/lib/site-url";

export const PARTNER_REFERRAL_CODE_COOKIE = "safephone_partner_referral_code";
export const PARTNER_REFERRAL_VISITOR_COOKIE =
  "safephone_partner_referral_visitor";
export const PARTNER_REFERRAL_SOURCE_COOKIE =
  "safephone_partner_referral_source";
export const PARTNER_REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type PartnerReferralSourceMedium = "qr" | "share" | "unknown";

const LOCAL_REFERRAL_HOSTS = new Set(["0.0.0.0", "127.0.0.1", "localhost"]);

export function normalizePartnerReferralSourceMedium(
  value?: string | null,
): PartnerReferralSourceMedium {
  switch ((value ?? "").trim().toLowerCase()) {
    case "qr":
      return "qr";
    case "share":
      return "share";
    default:
      return "unknown";
  }
}

function isLocalReferralHost(hostname?: string | null) {
  return LOCAL_REFERRAL_HOSTS.has((hostname ?? "").trim().toLowerCase());
}

function getPreferredPublicOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    const currentOrigin = window.location.origin;

    try {
      const currentURL = new URL(currentOrigin);
      if (!isLocalReferralHost(currentURL.hostname)) {
        return currentURL.origin;
      }
    } catch {
      // Ignore malformed current origin and fall through to configured values.
    }
  }

  const configuredSiteURL = getConfiguredSiteURL();
  if (configuredSiteURL) {
    try {
      return new URL(configuredSiteURL).origin;
    } catch {
      // Ignore malformed configured values and fall back to the broader default.
    }
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  try {
    return new URL(getSiteURL()).origin;
  } catch {
    return "";
  }
}

export function normalizePartnerReferralLink(baseLink: string) {
  const normalizedBaseLink = baseLink.trim();
  if (!normalizedBaseLink) return "";

  const preferredOrigin = getPreferredPublicOrigin();
  const fallbackOrigin = preferredOrigin || "http://localhost:3000";

  let url: URL;
  try {
    url = new URL(normalizedBaseLink);
  } catch {
    try {
      const pathname = normalizedBaseLink.startsWith("/")
        ? normalizedBaseLink
        : `/${normalizedBaseLink.replace(/^\/+/, "")}`;
      url = new URL(pathname, fallbackOrigin);
    } catch {
      return normalizedBaseLink;
    }
  }

  if (isLocalReferralHost(url.hostname) && preferredOrigin) {
    try {
      const publicURL = new URL(preferredOrigin);
      url.protocol = publicURL.protocol;
      url.host = publicURL.host;
    } catch {
      // Keep the original URL when the preferred origin cannot be parsed.
    }
  }

  return url.toString();
}

export function buildTrackedPartnerReferralLink(
  baseLink: string,
  sourceMedium: PartnerReferralSourceMedium,
) {
  const normalizedBaseLink = normalizePartnerReferralLink(baseLink);
  if (!normalizedBaseLink) return "";

  const url = new URL(normalizedBaseLink);
  if (sourceMedium === "unknown") {
    url.searchParams.delete("src");
  } else {
    url.searchParams.set("src", sourceMedium);
  }
  return url.toString();
}

export function appendPartnerReferralParams(
  params: URLSearchParams,
  partnerCode?: string | null,
  sourceMedium?: string | null,
) {
  const normalizedPartnerCode = (partnerCode ?? "").trim();
  const normalizedSource = normalizePartnerReferralSourceMedium(sourceMedium);

  if (normalizedPartnerCode) {
    params.set("partner", normalizedPartnerCode);
  }
  if (normalizedSource !== "unknown") {
    params.set("src", normalizedSource);
  }

  return params;
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!cookie) return "";
  return decodeURIComponent(cookie.slice(prefix.length));
}

function writeCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;

  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export function readPartnerReferralCookies() {
  return {
    code: readCookie(PARTNER_REFERRAL_CODE_COOKIE),
    visitorToken: readCookie(PARTNER_REFERRAL_VISITOR_COOKIE),
    sourceMedium: normalizePartnerReferralSourceMedium(
      readCookie(PARTNER_REFERRAL_SOURCE_COOKIE),
    ),
  };
}

export function writePartnerReferralCookies({
  code,
  visitorToken,
  sourceMedium,
}: {
  code: string;
  visitorToken?: string;
  sourceMedium?: string | null;
}) {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedSource = normalizePartnerReferralSourceMedium(sourceMedium);

  if (!normalizedCode) return;

  writeCookie(
    PARTNER_REFERRAL_CODE_COOKIE,
    normalizedCode,
    PARTNER_REFERRAL_COOKIE_MAX_AGE,
  );

  if (visitorToken?.trim()) {
    writeCookie(
      PARTNER_REFERRAL_VISITOR_COOKIE,
      visitorToken.trim(),
      PARTNER_REFERRAL_COOKIE_MAX_AGE,
    );
  }

  writeCookie(
    PARTNER_REFERRAL_SOURCE_COOKIE,
    normalizedSource,
    PARTNER_REFERRAL_COOKIE_MAX_AGE,
  );
}

export function clearPartnerReferralCookies() {
  writeCookie(PARTNER_REFERRAL_CODE_COOKIE, "", 0);
  writeCookie(PARTNER_REFERRAL_VISITOR_COOKIE, "", 0);
  writeCookie(PARTNER_REFERRAL_SOURCE_COOKIE, "", 0);
}
