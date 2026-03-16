import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/tableau-de-bord",
  "/espace-partenaire",
  "/sinistres",
  "/paiement",
];

const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Better Auth session cookie
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if ((isProtected || isAdmin) && !sessionToken) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tableau-de-bord/:path*",
    "/espace-partenaire/:path*",
    "/admin/:path*",
    "/sinistres/:path*",
    "/paiement/:path*",
  ],
};
