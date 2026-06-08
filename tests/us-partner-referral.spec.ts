import {
  test,
  expect,
  type APIRequestContext,
  type BrowserContext,
} from "@playwright/test";

/**
 * Scanning a partner QR in the US market must attribute the signup to the
 * partner. The QR redirects /p/<code> -> /us/signup -> /us/pricing; the US flow
 * had no referral claim step (only the SN InscriptionPage did), so the
 * attribution was silently lost. usePartnerReferralClaim, mounted on the US
 * plans + signup pages, now fires the claim once the visitor is authenticated.
 *
 *   SLOW_MO=600 npx playwright test us-partner-referral --headed
 */

const PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";
const PARTNER_CODE = "JA9ZVUST"; // existing partner in the test org

function uniqueEmail() {
  return `usref+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

async function registerAndSignIn(
  request: APIRequestContext,
  context: BrowserContext,
  email: string,
) {
  const headers = { Origin: BASE_URL, "Content-Type": "application/json" };
  const up = await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
    headers,
    data: { email, password: PASSWORD, name: "US Ref" },
  });
  if (!up.ok()) throw new Error(`sign-up failed (${up.status()})`);
  const si = await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers,
    data: { email, password: PASSWORD },
  });
  if (!si.ok()) throw new Error(`sign-in failed (${si.status()})`);
  await context.addCookies((await request.storageState()).cookies);
}

test("US partner QR attributes the authenticated visitor to the partner", async ({
  page,
  request,
  context,
}) => {
  test.setTimeout(90_000);
  await registerAndSignIn(request, context, uniqueEmail());

  // Force the US market so /p redirects through the US flow.
  await context.addCookies([
    { name: "sp_market", value: "US", domain: "localhost", path: "/" },
  ]);

  // The fix: the claim POST must fire from the US flow.
  const claimResponse = page.waitForResponse(
    (r) =>
      r.url().includes(`/partner-referrals/${PARTNER_CODE}/claim`) &&
      r.request().method() === "POST",
    { timeout: 30_000 },
  );

  await page.goto(`/p/${PARTNER_CODE}?src=qr`);

  // Lands somewhere under /us/ (signup -> pricing).
  await page.waitForURL(/\/us\//, { timeout: 20_000 });

  const resp = await claimResponse;
  expect(resp.status()).toBeLessThan(300);

  // The US flow now also shows the "signing up with <partner>" banner.
  await expect(
    page
      .getByText(/You are signing up with|Vous êtes accompagné par/)
      .first(),
  ).toBeVisible({ timeout: 15_000 });
});
