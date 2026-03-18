import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/tableau-de-bord",
  "/sinistres",
  "/paiement",
];

const ADMIN_ROUTES = ["/admin"];
const PARTNER_ROUTES = ["/espace-partenaire"];

async function getSessionRole(request: NextRequest): Promise<string | null> {
  try {
    const res = await fetch(new URL("/api/auth/get-session", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.user?.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isPartner = PARTNER_ROUTES.some((r) => pathname.startsWith(r));

  // Not authenticated → redirect to homepage with auth modal + redirect param
  if ((isProtected || isAdmin || isPartner) && !sessionToken) {
    const url = new URL("/", request.url);
    url.searchParams.set("auth", "sign-in");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Role checks for privileged routes
  if (isAdmin || isPartner) {
    const role = await getSessionRole(request);

    if (isAdmin && role !== "admin") {
      const url = new URL("/tableau-de-bord", request.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    if (isPartner && role !== "partner" && role !== "admin") {
      const url = new URL("/tableau-de-bord", request.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
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
