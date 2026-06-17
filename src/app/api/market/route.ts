import { NextResponse, type NextRequest } from "next/server";
import { MARKET_COOKIE, isMarketCode } from "@/lib/markets/config";
import { US_ORIGIN, SN_ORIGIN, hostKind } from "@/lib/markets/domains";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const market = (body as { market?: unknown })?.market;
  if (typeof market !== "string" || !isMarketCode(market)) {
    return NextResponse.json({ error: "Unsupported market" }, { status: 400 });
  }

  // Where the chosen market lives, relative to the host the switcher was
  // clicked on. On a dedicated domain the other market is cross-origin, so we
  // return an absolute URL and the client does a full navigation.
  const kind = hostKind(
    request.headers.get("host") ?? request.headers.get("x-forwarded-host"),
  );
  let redirectTo: string;
  if (market === "US") {
    redirectTo =
      kind === "us" ? "/" : kind === "sn" ? `${US_ORIGIN}/` : "/us";
  } else {
    redirectTo =
      kind === "sn" ? "/sn" : kind === "us" ? `${SN_ORIGIN}/sn` : "/sn";
  }

  const response = NextResponse.json({
    market,
    redirectTo,
  });
  response.cookies.set(MARKET_COOKIE, market, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // Intentionally NOT httpOnly — the switcher reads the active market
    // client-side to render the current selection without a round-trip.
    httpOnly: false,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(MARKET_COOKIE);
  return response;
}
