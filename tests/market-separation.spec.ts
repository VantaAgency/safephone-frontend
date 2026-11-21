import { test, expect } from "@playwright/test";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import { POST as changeMarket } from "../src/app/api/market/route";

function request(url: string, country: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("host", new URL(url).host);
  headers.set("x-vercel-ip-country", country);
  headers.set("cookie", "sp_market=US");
  return new NextRequest(url, { method: init.method, body: init.body, headers });
}

test("a visitor is redirected by country and cannot switch markets on a dedicated domain", async () => {
  const fromSenegal = proxy(request("https://www.safephone.us/pricing", "SN"));
  expect(fromSenegal.headers.get("location")).toBe("https://www.safephone.sn/sn");
  expect(fromSenegal.headers.get("cache-control")).toContain("no-store");

  expect(proxy(request("https://www.safephone.sn/", "US")).headers.get("location"))
    .toBe("https://www.safephone.us/");
  expect(proxy(request("https://www.safephone.sn/", "FR")).headers.get("location"))
    .toBe("https://www.safephone.sn/sn");
  expect(proxy(request("https://www.safephone.sn/us/pricing", "SN")).headers.get("location"))
    .toBe("https://www.safephone.sn/sn");
  expect(proxy(request("https://www.safephone.us/sn/forfaits", "US")).headers.get("location"))
    .toBe("https://www.safephone.us/");

  const response = await changeMarket(request("https://www.safephone.sn/api/market", "SN", {
    method: "POST", body: JSON.stringify({ market: "US" }),
  }));
  expect(response.status).toBe(403);
  expect(response.headers.has("set-cookie")).toBe(false);
});

test("gateway returns retain the market and their payment identifiers", () => {
  for (const path of ["succes", "echec"]) {
    const search = "?payment_id=123&reference=safephone-test";
    const oldReturn = proxy(request(`https://www.safephone.sn/paiement/${path}${search}`, "US"));
    expect(oldReturn.headers.get("location"))
      .toBe(`https://www.safephone.sn/sn/paiement/${path}${search}`);

    const login = proxy(request(`https://www.safephone.sn/sn/paiement/${path}${search}`, "US"));
    const loginURL = new URL(login.headers.get("location")!);
    expect(loginURL.origin).toBe("https://www.safephone.sn");
    expect(loginURL.searchParams.get("redirect")).toBe(`/sn/paiement/${path}${search}`);
  }

  const search = "?session_id=cs_test_payment";
  const login = proxy(request(`https://www.safephone.us/checkout/success${search}`, "SN"));
  const loginURL = new URL(login.headers.get("location")!);
  expect(loginURL.origin).toBe("https://www.safephone.us");
  expect(loginURL.searchParams.get("redirect")).toBe(`/checkout/success${search}`);

  const oldStripeReturn = proxy(request(`https://www.safephone.sn/us/checkout/success${search}`, "SN"));
  expect(oldStripeReturn.headers.get("location")).toBe(`https://www.safephone.us/checkout/success${search}`);

  const cancel = proxy(request("https://www.safephone.us/checkout/cancel", "SN"));
  expect(cancel.headers.get("x-middleware-rewrite"))
    .toBe("https://www.safephone.us/us/checkout/cancel");
});

test("payment API routes reject the other website and leave webhooks reachable", () => {
  expect(proxy(request("https://www.safephone.sn/api/v1/payments/stripe/checkout", "SN", { method: "POST" })).status).toBe(404);
  expect(proxy(request("https://www.safephone.us/api/v1/payments", "US", { method: "POST" })).status).toBe(404);
  for (const provider of ["dexpay", "stripe"]) {
    const response = proxy(request(`https://www.safephone.sn/api/v1/webhooks/${provider}`, "US", { method: "POST" }));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  }
});
