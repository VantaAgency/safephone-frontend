import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_MARKET,
  MARKET_COOKIE,
  isMarketCode,
  type MarketCode,
} from "@/lib/markets/config";
import {
  US_ORIGIN,
  SN_ORIGIN,
  hostKind,
  stripUSPrefix,
  addUSPrefix,
  isSharedPath,
} from "@/lib/markets/domains";

// ─── Auth route protection (was in src/middleware.ts) ──────────────────────
const PROTECTED_ROUTES = [
  "/tableau-de-bord",
  "/sinistres",
  "/paiement",
  // US dashboard + post-checkout flows
  "/us/dashboard",
  "/us/register-device",
];
const ADMIN_ROUTES = ["/admin"];
const EMPLOYEE_ROUTES = ["/espace-employe"];
const PARTNER_ROUTES = ["/espace-partenaire"];
const COMMERCIAL_ROUTES = ["/espace-commercial"];
const ADMIN_API_ROUTES = ["/api/admin"];

function getSessionToken(request: NextRequest) {
  return (
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("__Host-better-auth.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value
  );
}

function resolveMarketFromRequest(request: NextRequest): MarketCode | null {
  const manual = request.cookies.get(MARKET_COOKIE)?.value;
  if (isMarketCode(manual)) return manual;

  const geo =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry");
  if (!geo) return null;
  const upper = geo.toUpperCase();
  return isMarketCode(upper) ? upper : null;
}

/**
 * Auth gate shared by every host. `checkPath` is the effective internal route
 * used to decide protection (e.g. `/us/dashboard` even when the browser shows
 * `/dashboard` on the US domain); `redirectPath` is the URL the user sees, fed
 * back into the sign-in modal so login returns them where they were.
 * Returns a response to short-circuit on, or null to continue.
 */
function authGate(
  request: NextRequest,
  checkPath: string,
  redirectPath: string = checkPath,
): NextResponse | null {
  const sessionToken = getSessionToken(request);

  // Admin API: 401 on missing session.
  if (ADMIN_API_ROUTES.some((r) => checkPath.startsWith(r)) && !sessionToken) {
    return NextResponse.json(
      { error: { message: "Authentication required" } },
      { status: 401 },
    );
  }

  // Protected routes: redirect to home with the auth modal.
  const isProtected =
    PROTECTED_ROUTES.some((r) => checkPath.startsWith(r)) ||
    ADMIN_ROUTES.some((r) => checkPath.startsWith(r)) ||
    EMPLOYEE_ROUTES.some((r) => checkPath.startsWith(r)) ||
    PARTNER_ROUTES.some((r) => checkPath.startsWith(r)) ||
    COMMERCIAL_ROUTES.some((r) => checkPath.startsWith(r));
  if (isProtected && !sessionToken) {
    const url = new URL("/", request.url);
    url.searchParams.set("auth", "sign-in");
    url.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(url);
  }

  return null;
}

/** Pass the request through, forwarding `x-pathname` so RSC `resolveMarket()`
 * can read the (effective) URL prefix. */
function passThrough(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

/** Rewrite to an internal path (URL stays as the browser sees it) while
 * forwarding `x-pathname` = the internal path for market resolution. */
function rewriteTo(request: NextRequest, internalPath: string, search: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", internalPath);
  return NextResponse.rewrite(
    new URL(`${internalPath}${search}`, request.url),
    { request: { headers: requestHeaders } },
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const kind = hostKind(
    request.headers.get("host") ?? request.headers.get("x-forwarded-host"),
  );

  // ── Dedicated US domain: serve the US market at the root ─────────────────
  if (kind === "us") {
    return proxyUSHost(request, pathname, search);
  }

  // ── Dedicated SN domain: the old `/us/*` path now lives on the US domain ─
  if (kind === "sn" && (pathname === "/us" || pathname.startsWith("/us/"))) {
    return NextResponse.redirect(
      `${US_ORIGIN}${stripUSPrefix(pathname)}${search}`,
      301,
    );
  }

  // ── Legacy / SN multi-market behaviour ───────────────────────────────────
  return proxyMultiMarket(request, pathname, search, kind);
}

/** safephone.us — US served clean at the root; /us/* canonicalised; /sn/* sent home. */
function proxyUSHost(request: NextRequest, pathname: string, search: string) {
  // SN content doesn't belong on the US domain → send it to the SN site.
  if (pathname === "/sn" || pathname.startsWith("/sn/")) {
    return NextResponse.redirect(`${SN_ORIGIN}${pathname}${search}`, 301);
  }

  // Canonicalise any `/us` or `/us/*` to its clean form so the app's own
  // `/us/...` links and old bookmarks settle on the prefix-less URL.
  if (pathname === "/us" || pathname.startsWith("/us/")) {
    return NextResponse.redirect(
      new URL(`${stripUSPrefix(pathname)}${search}`, request.url),
      301,
    );
  }

  // Shared routes (auth, dashboards, partner-ref, API) pass through as-is.
  if (isSharedPath(pathname)) {
    const gated = authGate(request, pathname);
    if (gated) return gated;
    return passThrough(request, pathname);
  }

  // Everything else is a US market page → rewrite to the internal `/us` path.
  const internal = addUSPrefix(pathname);
  const gated = authGate(request, internal, pathname);
  if (gated) return gated;
  return rewriteTo(request, internal, search);
}

/** localhost / preview / safephone.sn — both markets via `/sn` and `/us` prefixes. */
function proxyMultiMarket(
  request: NextRequest,
  pathname: string,
  search: string,
  kind: "sn" | "legacy",
) {
  const gated = authGate(request, pathname);
  if (gated) return gated;

  // Pass through canonical market routes.
  if (
    pathname === "/sn" ||
    pathname.startsWith("/sn/") ||
    pathname === "/us" ||
    pathname.startsWith("/us/") ||
    pathname === "/select-country"
  ) {
    return passThrough(request, pathname);
  }

  // Bare root → detection-based redirect.
  if (pathname === "/") {
    const market = resolveMarketFromRequest(request) ?? DEFAULT_MARKET;
    // On the SN prod host, a US visitor belongs on the US domain.
    if (market === "US" && kind === "sn") {
      return NextResponse.redirect(`${US_ORIGIN}/${search}`, 307);
    }
    const target = `/${market.toLowerCase()}`;
    return NextResponse.redirect(new URL(`${target}${search}`, request.url));
  }

  // Bare-path canonicalisation (e.g. /forfaits → /sn/forfaits or /us/pricing).
  // Physical routes under app/(public)/ for these paths exist — Next would
  // serve them directly without this redirect. The (public) tree is kept
  // around for backwards-compat URLs; the canonical user-facing entry is
  // always under /sn or /us.
  const barePath = pathname.replace(/\/$/, "") || "/";
  const redirect = BARE_PATH_REDIRECTS[barePath];
  if (redirect) {
    const market = resolveMarketFromRequest(request) ?? DEFAULT_MARKET;
    // On the SN prod host, the US equivalent lives on the US domain.
    if (market === "US" && kind === "sn") {
      return NextResponse.redirect(
        `${US_ORIGIN}${stripUSPrefix(redirect.US)}${search}`,
        307,
      );
    }
    const target = redirect[market];
    return NextResponse.redirect(new URL(`${target}${search}`, request.url), 307);
  }

  return passThrough(request, pathname);
}

// Bare-path → per-market target map. Keep this in sync with routes.ts.
// Paths intentionally absent (and therefore pass through):
//   /connexion, /inscription-compte, /mot-de-passe-oublie,
//   /reinitialiser-mot-de-passe — shared auth
//   /tableau-de-bord, /admin, /espace-*               — shared dashboards
//   /p/[code]                                          — shared partner refs
const BARE_PATH_REDIRECTS: Record<string, Record<MarketCode, string>> = {
  "/forfaits":         { SN: "/sn/forfaits",         US: "/us/pricing" },
  "/inscription":      { SN: "/sn/inscription",      US: "/us/signup" },
  "/paiement":         { SN: "/sn/paiement",         US: "/us/pricing" },
  "/paiement/succes":  { SN: "/sn/paiement/succes",  US: "/us/checkout/success" },
  "/paiement/echec":   { SN: "/sn/paiement/echec",   US: "/us/checkout/cancel" },
  "/sinistres":        { SN: "/sn/sinistres",        US: "/us/claims" },
  "/reparations":      { SN: "/sn/reparations",      US: "/us/repair" },
  "/partenaires":      { SN: "/sn/partenaires",      US: "/us/partners" },
  "/contact":          { SN: "/sn/contact",          US: "/us/contact" },
};

export const config = {
  matcher: [
    // Skip Next internals and any file with an extension. /api routes are
    // included intentionally — the admin-API auth check above requires
    // them to flow through the proxy.
    "/((?!_next/static|_next/image|.*\\..*).*)",
  ],
};
