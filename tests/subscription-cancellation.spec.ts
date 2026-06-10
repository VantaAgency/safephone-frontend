import { test, expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Subscription cancellation — newly wired into the member dashboard: a member
 * with an active subscription clicks "Résilier l'abonnement", confirms, and the
 * subscription is cancelled (POST /subscriptions/{id}/cancel).
 *
 * Backend in mock payment mode (SN sub active immediately).
 *
 *   SLOW_MO=1500 npx playwright test subscription-cancellation --headed
 */

const BASE = "http://localhost:3001";
const PASSWORD = "TestPassword123!";
const memberEmail = `canceltest+${Date.now()}@safephone.test`;

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

async function uploadMedia(scope: Page) {
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

test("a member cancels an active subscription from the dashboard", async ({ page, context }) => {
  test.setTimeout(180_000);
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await context.request.post(`${BASE}/api/auth/sign-up/email`, { headers, data: { email: memberEmail, password: PASSWORD, name: "Cancel Member" } });
  await context.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email: memberEmail, password: PASSWORD } });
  await context.addCookies((await context.request.storageState()).cookies);
  await context.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);

  // ── Subscribe (mock pay) → active subscription ───────────────────────────
  await page.goto("/sn/paiement?plan=plus&device_type=smartphone&brand=iphone");
  await page.getByRole("button", { name: "iPhone", exact: true }).first().click();
  await page.getByPlaceholder(/iPhone 13|Galaxy A54/i).fill("iPhone 15 Pro");
  await page.getByRole("button", { name: continueBtn }).first().click();
  await uploadMedia(page);
  await page.getByRole("button", { name: continueBtn }).first().click();
  await page.getByRole("button", { name: /Payer|^Pay/i }).first().click();
  await expect(page.getByRole("button", { name: /tableau de bord|dashboard/i }).first()).toBeVisible({ timeout: 30_000 });

  // ── Cancel it from the dashboard (two-step confirm) ──────────────────────
  await page.goto("/tableau-de-bord");
  await page.getByRole("button", { name: /Résilier l'abonnement|Cancel subscription/i }).first().click();
  await page.getByRole("button", { name: /Oui, résilier|Yes, cancel/i }).first().click();

  // The cancel link disappears once the sub leaves the active list.
  await expect(page.getByRole("button", { name: /Résilier l'abonnement|Cancel subscription/i })).toHaveCount(0, { timeout: 20_000 });

  // Authoritative: the subscription is cancelled.
  const res = await context.request.get(`${BASE}/api/v1/subscriptions`, { headers: { Authorization: `Bearer ${await bearer(context)}` } });
  const subs = (await res.json()).data as Array<{ status: string }>;
  expect(subs.some((s) => s.status === "cancelled")).toBeTruthy();
  console.log(`\n  ✅ Member ${memberEmail} cancelled their subscription\n`);
});
