import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/tableau-de-bord",
  "/sinistres",
  "/paiement",
];

const ADMIN_ROUTES = ["/admin"];
const EMPLOYEE_ROUTES = ["/espace-employe"];
const PARTNER_ROUTES = ["/espace-partenaire"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("__Host-better-auth.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isEmployee = EMPLOYEE_ROUTES.some((r) => pathname.startsWith(r));
  const isPartner = PARTNER_ROUTES.some((r) => pathname.startsWith(r));

  // Not authenticated → redirect to homepage with auth modal + redirect param
  if ((isProtected || isAdmin || isEmployee || isPartner) && !sessionToken) {
    const url = new URL("/", request.url);
    url.searchParams.set("auth", "sign-in");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tableau-de-bord/:path*",
    "/espace-employe/:path*",
    "/espace-partenaire/:path*",
    "/admin/:path*",
    "/sinistres/:path*",
    "/paiement/:path*",
  ],
};
