import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_MARKET,
  MARKET_COOKIE,
  isMarketCode,
  type MarketCode,
} from "@/lib/markets/config";

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

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = getSessionToken(request);

  // ─── Admin API: 401 on missing session ──────────────────────────────────
  if (ADMIN_API_ROUTES.some((r) => pathname.startsWith(r)) && !sessionToken) {
    return NextResponse.json(
      { error: { message: "Authentication required" } },
      { status: 401 },
    );
  }

  // ─── Protected routes: redirect to home with auth modal ─────────────────
  const isProtected =
    PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) ||
    ADMIN_ROUTES.some((r) => pathname.startsWith(r)) ||
    EMPLOYEE_ROUTES.some((r) => pathname.startsWith(r)) ||
    PARTNER_ROUTES.some((r) => pathname.startsWith(r)) ||
    COMMERCIAL_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !sessionToken) {
    const url = new URL("/", request.url);
    url.searchParams.set("auth", "sign-in");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ─── Market resolution: forward x-pathname for RSC headers() ────────────
  // Without this, server-side resolveMarket() can't see the URL prefix and
  // falls back to the cookie/default market — causing /us to render with
  // SN content and lang="fr".
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const next = () => NextResponse.next({ request: { headers: requestHeaders } });

  // Pass through canonical market routes.
  if (
    pathname === "/sn" ||
    pathname.startsWith("/sn/") ||
    pathname === "/us" ||
    pathname.startsWith("/us/") ||
    pathname === "/select-country"
  ) {
    return next();
  }

  // Bare root → detection-based redirect.
  if (pathname === "/") {
    const market = resolveMarketFromRequest(request) ?? DEFAULT_MARKET;
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
    const target = redirect[market];
    return NextResponse.redirect(new URL(`${target}${search}`, request.url), 307);
  }

  return next();
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
