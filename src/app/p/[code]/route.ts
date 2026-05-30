import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, PartnerReferralVisitResult } from "@/lib/api/types";
import {
  PARTNER_REFERRAL_CODE_COOKIE,
  PARTNER_REFERRAL_COOKIE_MAX_AGE,
  PARTNER_REFERRAL_SOURCE_COOKIE,
  PARTNER_REFERRAL_VISITOR_COOKIE,
  normalizePartnerReferralSourceMedium,
} from "@/lib/partner-referrals";

// Build the public-facing base URL for the redirect. `request.url` echoes
// Next.js's bind host (e.g. `http://0.0.0.0:3001` when `next dev -H
// 0.0.0.0` is used), so when someone follows a ngrok-tunneled link
// `https://....ngrok-free.dev/p/CODE` they would be sent to 0.0.0.0:3001
// — unreachable on their machine. Trust X-Forwarded-Host / Host before
// falling back to the runtime env, then to request.url as a last resort.
function publicBaseURL(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const proto = forwardedProto?.split(",")[0]?.trim() || "https";
    return `${proto}://${forwardedHost.split(",")[0].trim()}`;
  }
  const host = request.headers.get("host");
  if (host && !/^0\.0\.0\.0\b/.test(host)) {
    const proto =
      request.nextUrl.protocol.replace(":", "") || "http";
    return `${proto}://${host}`;
  }
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "";
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const normalizedCode = code.trim().toUpperCase();
  const sourceMedium = normalizePartnerReferralSourceMedium(
    request.nextUrl.searchParams.get("src"),
  );
  const redirectURL = new URL("/inscription", publicBaseURL(request));

  if (normalizedCode) {
    redirectURL.searchParams.set("partner", normalizedCode);
  }
  if (sourceMedium !== "unknown") {
    redirectURL.searchParams.set("src", sourceMedium);
  }

  if (!normalizedCode) {
    return NextResponse.redirect(redirectURL);
  }

  const visitorToken =
    request.cookies.get(PARTNER_REFERRAL_VISITOR_COOKIE)?.value ?? "";

  try {
    const response = await fetch(
      new URL(
        `/api/v1/partner-referrals/${encodeURIComponent(normalizedCode)}/visits`,
        request.url,
      ),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_token: visitorToken || undefined,
          source_medium: sourceMedium,
        }),
        cache: "no-store",
      },
    );

    const redirectResponse = NextResponse.redirect(redirectURL);
    if (!response.ok) {
      redirectResponse.cookies.delete(PARTNER_REFERRAL_CODE_COOKIE);
      redirectResponse.cookies.delete(PARTNER_REFERRAL_VISITOR_COOKIE);
      redirectResponse.cookies.delete(PARTNER_REFERRAL_SOURCE_COOKIE);
      return redirectResponse;
    }

    const payload = (await response.json()) as ApiResponse<PartnerReferralVisitResult>;
    const visit = payload.data;

    if (visit.referral?.referral_code) {
      redirectResponse.cookies.set(PARTNER_REFERRAL_CODE_COOKIE, visit.referral.referral_code, {
        path: "/",
        sameSite: "lax",
        maxAge: PARTNER_REFERRAL_COOKIE_MAX_AGE,
        secure: request.nextUrl.protocol === "https:",
      });
    }
    if (visit.visitor_token) {
      redirectResponse.cookies.set(
        PARTNER_REFERRAL_VISITOR_COOKIE,
        visit.visitor_token,
        {
          path: "/",
          sameSite: "lax",
          maxAge: PARTNER_REFERRAL_COOKIE_MAX_AGE,
          secure: request.nextUrl.protocol === "https:",
        },
      );
    }
    redirectResponse.cookies.set(
      PARTNER_REFERRAL_SOURCE_COOKIE,
      visit.source_medium,
      {
        path: "/",
        sameSite: "lax",
        maxAge: PARTNER_REFERRAL_COOKIE_MAX_AGE,
        secure: request.nextUrl.protocol === "https:",
      },
    );
    return redirectResponse;
  } catch {
    return NextResponse.redirect(redirectURL);
  }
}
