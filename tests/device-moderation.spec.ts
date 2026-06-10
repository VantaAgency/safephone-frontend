import { test, expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Device moderation — an EMPLOYEE (or admin) reviews covered devices and
 * suspends a fraudulent one (reversibly), then reactivates it.
 *
 * A member subscribes (mock pay) and the device is approved so it's active and
 * appears in the moderation queue; the device gets a unique model so its row is
 * easy to target. Employee: emp-flow-employee@safephone.test (active profile).
 *
 *   SLOW_MO=1500 npx playwright test device-moderation --headed
 */

const BASE = "http://localhost:3001";
const EMP_EMAIL = "emp-flow-employee@safephone.test";
const PASSWORD = "TestPassword123!";
const ts = Date.now();
const memberEmail = `modtest+${ts}@safephone.test`;
const deviceModel = `iPhone E2E ${ts}`;

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

test("an employee suspends a fraudulent device then reactivates it", async ({ page, context, browser }) => {
  test.setTimeout(240_000);
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await context.request.post(`${BASE}/api/auth/sign-up/email`, { headers, data: { email: memberEmail, password: PASSWORD, name: "Mod Member" } });
  await context.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email: memberEmail, password: PASSWORD } });
  await context.addCookies((await context.request.storageState()).cookies);
  await context.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);

  // ── Member subscribes (unique device model) ──────────────────────────────
  await page.goto("/sn/paiement?plan=plus&device_type=smartphone&brand=iphone");
  await page.getByRole("button", { name: "iPhone", exact: true }).first().click();
  await page.getByPlaceholder(/iPhone 13|Galaxy A54/i).fill(deviceModel);
  await page.getByRole("button", { name: continueBtn }).first().click();
  await uploadMedia(page);
  await page.getByRole("button", { name: continueBtn }).first().click();
  await page.getByRole("button", { name: /Payer|^Pay/i }).first().click();
  await expect(page.getByRole("button", { name: /tableau de bord|dashboard/i }).first()).toBeVisible({ timeout: 30_000 });

  // ── Approve the device so it's active and in the moderation queue ────────
  const devRes = await context.request.get(`${BASE}/api/v1/devices`, { headers: { Authorization: `Bearer ${await bearer(context)}` } });
  const deviceId = (await devRes.json()).data[0].id as string;
  const adminCtx = await browser.newContext();
  await adminCtx.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email: "emp-flow-admin@safephone.test", password: PASSWORD } });
  await adminCtx.request.post(`${BASE}/api/v1/admin/verifications/${deviceId}/approve`, { headers: { Origin: BASE, Authorization: `Bearer ${await bearer(adminCtx)}` } });
  await adminCtx.close();

  // ── Employee opens the moderation tab and suspends the device ────────────
  const empCtx = await browser.newContext();
  await empCtx.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email: EMP_EMAIL, password: PASSWORD } });
  await empCtx.addCookies((await empCtx.request.storageState()).cookies);
  await empCtx.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);
  const emp = await empCtx.newPage();
  await emp.goto("/espace-employe");
  await emp.getByRole("button", { name: /^Modération$|^Moderation$/i }).first().click();

  // Scope to this device's card (unique model) and suspend it.
  const card = emp.locator("div")
    .filter({ has: emp.getByText(deviceModel) })
    .filter({ has: emp.getByRole("button", { name: /Suspendre|Réactiver|Suspend|Reactivate/i }) })
    .last();
  await card.getByRole("button", { name: /Suspendre|Suspend/i }).click();
  await expect(card.getByText(/Suspendu|Suspended/i).first()).toBeVisible({ timeout: 15_000 });

  // ── Reactivate it ────────────────────────────────────────────────────────
  await card.getByRole("button", { name: /Réactiver|Reactivate/i }).click();
  await expect(card.getByRole("button", { name: /Suspendre|Suspend/i })).toBeVisible({ timeout: 15_000 });
  await empCtx.close();

  // Authoritative: device is back to active.
  const finalRes = await context.request.get(`${BASE}/api/v1/devices`, { headers: { Authorization: `Bearer ${await bearer(context)}` } });
  const dev = (await finalRes.json()).data.find((d: { id: string }) => d.id === deviceId);
  expect(dev.status).toBe("active");
  console.log(`\n  ✅ Employee suspended then reactivated device ${deviceModel} (final status=${dev.status})\n`);
});
