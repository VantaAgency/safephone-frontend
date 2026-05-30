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
// 0.0.0.0` is used), so following a ngrok-tunneled link without consulting
// forwarded headers would 307 to 0.0.0.0:3001 — unreachable on the
// visitor's machine.
//
// Trusting X-Forwarded-Host blindly is a classic open-redirect / phishing
// vector: anyone POSTing to /p/CODE with `X-Forwarded-Host: evil.com`
// would receive a 307 to evil.com. We mitigate by allowlisting
// forwarded values against a comma-separated set sourced from the same
// TRUSTED_ORIGINS env Better Auth already enforces, plus the canonical
// NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL.
function buildAllowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const add = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    try {
      hosts.add(new URL(value).host.toLowerCase());
    } catch {
      // Treat as a bare host:port literal.
      hosts.add(value.toLowerCase());
    }
  };

  (process.env.TRUSTED_ORIGINS ?? "").split(",").forEach(add);
  add(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  add(process.env.NEXT_PUBLIC_APP_URL ?? "");
  return hosts;
}

function configuredFallback(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ""
  ).replace(/\/+$/, "");
}

function publicBaseURL(request: NextRequest): string {
  const allowed = buildAllowedHosts();
  const tryForwarded = () => {
    const raw = request.headers.get("x-forwarded-host");
    if (!raw) return null;
    const host = raw.split(",")[0].trim().toLowerCase();
    if (!host || !allowed.has(host)) return null;
    const proto =
      (request.headers.get("x-forwarded-proto") ?? "").split(",")[0]?.trim() ||
      "https";
    return `${proto}://${host}`;
  };

  const fromForwarded = tryForwarded();
  if (fromForwarded) return fromForwarded;

  // Fall back to the actual Host header only when it's already in the
  // allowlist (covers the localhost:3001 dev case). Never trust a Host
  // that didn't make the explicit list.
  const host = request.headers.get("host")?.toLowerCase();
  if (host && allowed.has(host)) {
    const proto = request.nextUrl.protocol.replace(":", "") || "http";
    return `${proto}://${host}`;
  }

  const configured = configuredFallback();
  if (configured) return configured;

  // Last-ditch: request.url's origin. May still be the bind host but at
  // this point the deploy is mis-configured (no TRUSTED_ORIGINS, no
  // NEXT_PUBLIC_SITE_URL), so a broken redirect is the lesser evil
  // compared to silently honoring an attacker-supplied host.
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
