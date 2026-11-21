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
  geoMarket,
  isUnder,
  marketForHost,
  stripUSPrefix,
  addUSPrefix,
  isSharedPath,
} from "@/lib/markets/domains";

// ─── Auth route protection (was in src/middleware.ts) ──────────────────────
const PROTECTED_ROUTES = [
  "/tableau-de-bord",
  "/sinistres",
  "/paiement",
  "/sn/sinistres",
  "/sn/paiement",
  // US dashboard + post-checkout flows
  "/us/dashboard",
  "/us/claims",
  "/us/checkout/success",
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
  if (ADMIN_API_ROUTES.some((r) => isUnder(checkPath, r)) && !sessionToken) {
    return NextResponse.json(
      { error: { message: "Authentication required" } },
      { status: 401 },
    );
  }

  // Protected routes: redirect to home with the auth modal.
  const isProtected =
    PROTECTED_ROUTES.some((r) => isUnder(checkPath, r)) ||
    ADMIN_ROUTES.some((r) => isUnder(checkPath, r)) ||
    EMPLOYEE_ROUTES.some((r) => isUnder(checkPath, r)) ||
    PARTNER_ROUTES.some((r) => isUnder(checkPath, r)) ||
    COMMERCIAL_ROUTES.some((r) => isUnder(checkPath, r));
  if (isProtected && !sessionToken) {
    const home = marketForHost(request.headers.get("host")) === "SN" || isUnder(checkPath, "/sn") ? "/sn" : "/";
    const url = new URL(home, request.url);
    url.searchParams.set("auth", "sign-in");
    url.searchParams.set("redirect", redirectPath + request.nextUrl.search);
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
  const domainMarket = marketForHost(
    request.headers.get("host") ?? request.headers.get("x-forwarded-host"),
  );
  if (isUnder(pathname, "/api") || isUnder(pathname, "/health")) {
    if (domainMarket === "SN" && (isUnder(pathname, "/api/v1/payments/stripe") || isUnder(pathname, "/api/v1/us/devices"))) {
      return NextResponse.json({ error: { message: "This endpoint belongs to SafePhone US" } }, { status: 404 });
    }
    if (domainMarket === "US" && (
      (request.method === "POST" && ["/api/v1/payments", "/api/v1/payments/renew-subscription"].includes(pathname)) ||
      /^\/api\/v1\/payments\/[^/]+\/(checkout|resume)$/.test(pathname)
    )) {
      return NextResponse.json({ error: { message: "This endpoint belongs to SafePhone Sénégal" } }, { status: 404 });
    }
    return authGate(request, pathname) ?? passThrough(request, pathname);
  }

  const detected = geoMarket(request.headers);
  if (!domainMarket && process.env.VERCEL_ENV !== "production") {
    return proxyPreview(request, pathname, search);
  }

  if (!domainMarket) {
    const target = detected ?? DEFAULT_MARKET;
    if (isUnder(pathname, "/p")) {
      return marketRedirect(target, pathname + search);
    }
    return marketRedirect(target);
  }

  const isSenegal = domainMarket === "SN";
  const home = isSenegal ? "/sn" : "/";
  // Stripe sessions issued before the domains were separated used this URL.
  const stripeSession = request.nextUrl.searchParams.get("session_id");
  if (isSenegal && pathname === "/us/checkout/success" && stripeSession &&
    /^cs_(live|test)_[a-zA-Z0-9]+$/.test(stripeSession)) {
    return marketRedirect("US", `/checkout/success?session_id=${encodeURIComponent(stripeSession)}`);
  }

  const wrongMarketPath = isSenegal
    ? ["/us", "/checkout", "/register-device", "/pricing", "/signup", "/login", "/dashboard", "/repair", "/claims", "/partners", "/how-it-works", "/repair-protection-terms", "/privacy", "/terms"]
    : ["/sn", "/paiement", "/forfaits", "/sinistres", "/reparations", "/partenaires"];

  if (wrongMarketPath.some((prefix) => isUnder(pathname, prefix)) || isUnder(pathname, "/select-country")) {
    return NextResponse.redirect(new URL(home, request.url), 307);
  }

  // Payment returns and their sign-in steps must stay on the original domain.
  const checkoutPath = isSenegal
    ? ["/paiement", "/sn/paiement", "/inscription", "/sn/inscription"]
    : ["/checkout", "/us/checkout", "/register-device", "/us/register-device", "/signup", "/us/signup", "/login", "/us/login"];
  const isCheckout = checkoutPath.some((prefix) => isUnder(pathname, prefix));
  const isAuth = ((pathname === home || pathname === "/") && request.nextUrl.searchParams.has("auth")) ||
    ["/connexion", "/inscription-compte", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe"].includes(pathname);
  if (detected && detected !== domainMarket && !isCheckout && !isAuth &&
    !getSessionToken(request) && !isUnder(pathname, "/p")) {
    return marketRedirect(detected);
  }

  if (isSenegal) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL(`/sn${search}`, request.url), 307);
    }
    const target = BARE_PATH_REDIRECTS[pathname.replace(/\/$/, "")]?.SN;
    if (target) {
      return NextResponse.redirect(new URL(target + search, request.url), 307);
    }
    return authGate(request, pathname) ?? passThrough(request, pathname);
  }

  if (isUnder(pathname, "/us")) {
    return NextResponse.redirect(new URL(stripUSPrefix(pathname) + search, request.url), 307);
  }
  if (isSharedPath(pathname)) {
    return authGate(request, pathname) ?? passThrough(request, pathname);
  }
  const internal = addUSPrefix(pathname);
  return authGate(request, internal, pathname) ?? rewriteTo(request, internal, search);
}

function marketRedirect(market: MarketCode, path?: string) {
  const origin = market === "SN" ? SN_ORIGIN : US_ORIGIN;
  const response = NextResponse.redirect(new URL(origin + (path ?? (market === "SN" ? "/sn" : "/"))), 307);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function proxyPreview(request: NextRequest, pathname: string, search: string) {
  // Existing DEXPAY sessions can return to the old bare paths.
  if (isUnder(pathname, "/paiement")) {
    return NextResponse.redirect(new URL(`/sn${pathname}${search}`, request.url), 307);
  }

  const gated = authGate(request, pathname);
  if (gated) return gated;
  const cookie = request.cookies.get(MARKET_COOKIE)?.value;
  const market = isMarketCode(cookie) ? cookie : geoMarket(request.headers) ?? DEFAULT_MARKET;
  const target = pathname === "/" ? `/${market.toLowerCase()}`
    : BARE_PATH_REDIRECTS[pathname.replace(/\/$/, "")]?.[market];
  return target
    ? NextResponse.redirect(new URL(target + search, request.url), 307)
    : passThrough(request, pathname);
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
  "/paiement":         { SN: "/sn/paiement",         US: "/sn/paiement" },
  "/paiement/succes":  { SN: "/sn/paiement/succes",  US: "/sn/paiement/succes" },
  "/paiement/echec":   { SN: "/sn/paiement/echec",   US: "/sn/paiement/echec" },
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
