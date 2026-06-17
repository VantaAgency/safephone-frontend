/**
 * Multi-domain routing config. In production each market has its own
 * dedicated domain:
 *
 *   - safephone.us  → United States market, served at the ROOT. The internal
 *                     `/us` route prefix is hidden: `/pricing` is rewritten to
 *                     `/us/pricing`, and any `/us/*` URL 301-redirects to its
 *                     clean (de-prefixed) form.
 *   - safephone.sn  → Senegal market, served under `/sn` (plus the bare public
 *                     routes). `/us/*` on this host 301-redirects to the US
 *                     domain so US content lives in exactly one place.
 *
 * Any OTHER host (localhost, *.vercel.app preview URLs, unknown) is treated as
 * a "legacy" multi-market host that serves BOTH markets via the `/sn` and
 * `/us` path prefixes — so local dev and preview deployments keep working with
 * no cross-domain redirects.
 *
 * Host lists and canonical origins are overridable via env so a staging domain
 * can adopt the US behaviour without a code change.
 */

function parseHosts(raw: string | undefined, fallback: string[]): string[] {
  if (!raw) return fallback;
  const parsed = raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length ? parsed : fallback;
}

function trimOrigin(raw: string | undefined, fallback: string): string {
  return (raw?.trim() || fallback).replace(/\/+$/, "");
}

/** Hostnames that serve the United States market at the root. */
export const US_HOSTS = parseHosts(process.env.NEXT_PUBLIC_US_HOSTS, [
  "safephone.us",
  "www.safephone.us",
]);

/** Hostnames that serve the Senegal market (and redirect `/us/*` away). */
export const SN_HOSTS = parseHosts(process.env.NEXT_PUBLIC_SN_HOSTS, [
  "safephone.sn",
  "www.safephone.sn",
]);

/** Canonical absolute origins used when redirecting across domains. */
export const US_ORIGIN = trimOrigin(
  process.env.NEXT_PUBLIC_US_ORIGIN,
  "https://safephone.us",
);
export const SN_ORIGIN = trimOrigin(
  process.env.NEXT_PUBLIC_SN_ORIGIN,
  "https://www.safephone.sn",
);

export type HostKind = "us" | "sn" | "legacy";

/** Normalise a Host / X-Forwarded-Host header to a bare lowercase hostname. */
export function normalizeHost(host: string | null | undefined): string {
  if (!host) return "";
  // Host header may carry a port ("example.com:3000") or multiple forwarded
  // values ("a.com, b.com") — take the first, drop the port.
  return host.split(",")[0].split(":")[0].trim().toLowerCase();
}

/** Classify a request host into its market-routing behaviour. */
export function hostKind(host: string | null | undefined): HostKind {
  const h = normalizeHost(host);
  if (US_HOSTS.includes(h)) return "us";
  if (SN_HOSTS.includes(h)) return "sn";
  return "legacy";
}

/** Clean (de-prefixed) path for a US URL: `/us/pricing` → `/pricing`, `/us` → `/`. */
export function stripUSPrefix(pathname: string): string {
  if (pathname === "/us") return "/";
  if (pathname.startsWith("/us/")) return pathname.slice("/us".length) || "/";
  return pathname;
}

/** Internal `/us`-prefixed path for a clean US URL: `/pricing` → `/us/pricing`, `/` → `/us`. */
export function addUSPrefix(pathname: string): string {
  if (pathname === "/") return "/us";
  return `/us${pathname}`;
}

/**
 * Shared (non-market) top-level routes that live OUTSIDE the `/sn` and `/us`
 * trees: shared auth, role dashboards, partner-ref redirects, and the API. On
 * the dedicated US domain these pass through untouched (no `/us` rewrite);
 * everything else is a US market page served at a clean URL.
 */
export const SHARED_PREFIXES = [
  "/api",
  "/admin",
  "/espace-employe",
  "/espace-partenaire",
  "/espace-commercial",
  "/tableau-de-bord",
  "/connexion",
  "/inscription-compte",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/acces-refuse",
  "/select-country",
  "/p",
];

export function isSharedPath(pathname: string): boolean {
  return SHARED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
