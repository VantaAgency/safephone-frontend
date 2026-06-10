import { test, expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Partner referral → client acquisition: a new customer arrives via a partner's
 * link (/p/<code>), is attributed to the partner, subscribes & pays, and then
 * shows up as a CLIENT in the partner's espace-partenaire (the commission is
 * created on the first successful payment).
 *
 * Partner: partner-flow@safephone.test (active, referral_code LP6MRG9G).
 * Backend in mock payment mode (SN plus claimable immediately).
 *
 *   SLOW_MO=1500 npx playwright test partner-commission --headed
 */

const BASE = "http://localhost:3001";
const PARTNER_EMAIL = "partner-flow@safephone.test";
const PARTNER_CODE = "LP6MRG9G";
const PASSWORD = "TestPassword123!";
const ts = Date.now();
const customerEmail = `refcust+${ts}@safephone.test`;
const customerName = `Ref Customer ${ts}`;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const MP4 = Buffer.from([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
  0x00, 0x00, 0x00, 0x00, 0x6d, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6f, 0x6d,
]);
const uploadedLink = /view uploaded file|voir le fichier/i;
const continueBtn = /^Continuer$|^Continue$/i;

async function uploadMedia(scope: Page | ReturnType<Page["locator"]>) {
  const inputs = scope.locator('input[type="file"]');
  await inputs.first().waitFor({ state: "attached", timeout: 10_000 });
  const photos = Math.max(1, (await inputs.count()) - 1);
  for (let i = 0; i < photos; i++) {
    await inputs.nth(i).setInputFiles({ name: `p${i}.png`, mimeType: "image/png", buffer: PNG });
    await scope.getByRole("link", { name: uploadedLink }).nth(i).waitFor({ state: "visible", timeout: 20_000 });
  }
  await inputs.nth(photos).setInputFiles({ name: "v.mp4", mimeType: "video/mp4", buffer: MP4 });
  await scope.getByRole("link", { name: uploadedLink }).nth(photos).waitFor({ state: "visible", timeout: 20_000 });
}

async function bearer(ctx: BrowserContext): Promise<string> {
  return (await (await ctx.request.get(`${BASE}/api/auth/token`)).json()).token as string;
}

test("a partner-referred customer subscribes and appears in the partner's clients", async ({ page, context, browser }) => {
  test.setTimeout(240_000);
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await context.request.post(`${BASE}/api/auth/sign-up/email`, { headers, data: { email: customerEmail, password: PASSWORD, name: customerName } });
  await context.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email: customerEmail, password: PASSWORD } });
  await context.addCookies((await context.request.storageState()).cookies);
  await context.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);

  // ── Customer arrives via the partner's link, then the referral is claimed
  // (attribution must be set before the first payment). ────────────────────
  await page.goto(`/p/${PARTNER_CODE}`).catch(() => {});
  const claim = await context.request.post(`${BASE}/api/v1/partner-referrals/${PARTNER_CODE}/claim`, {
    headers: { Origin: BASE, Authorization: `Bearer ${await bearer(context)}`, "Content-Type": "application/json" },
    data: { source_medium: "share" },
  });
  expect(claim.ok()).toBeTruthy();

  // ── Customer subscribes & pays (mock) → first successful payment ─────────
  await page.goto("/sn/paiement?plan=plus&device_type=smartphone&brand=iphone");
  await page.getByRole("button", { name: "iPhone", exact: true }).first().click();
  await page.getByPlaceholder(/iPhone 13|Galaxy A54/i).fill("iPhone 15 Pro");
  await page.getByRole("button", { name: continueBtn }).first().click();
  await uploadMedia(page);
  await page.getByRole("button", { name: continueBtn }).first().click();
  await page.getByRole("button", { name: /Payer|^Pay/i }).first().click();
  await expect(page.getByRole("button", { name: /tableau de bord|dashboard/i }).first()).toBeVisible({ timeout: 30_000 });

  // ── Partner sees the new customer in their espace-partenaire ─────────────
  const partnerCtx = await browser.newContext();
  await partnerCtx.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email: PARTNER_EMAIL, password: PASSWORD } });
  await partnerCtx.addCookies((await partnerCtx.request.storageState()).cookies);
  await partnerCtx.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);
  const partner = await partnerCtx.newPage();
  await partner.goto("/espace-partenaire");
  await expect(partner.getByText(customerName).first()).toBeVisible({ timeout: 20_000 });
  await partnerCtx.close();
  console.log(`\n  ✅ Partner ${PARTNER_CODE} acquired client ${customerName} via referral link\n`);
});
