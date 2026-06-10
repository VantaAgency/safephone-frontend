import { test, expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Claim (sinistre) flow — the core insurance payoff + employee operational work:
 *   a member with an active covered device files a claim → an EMPLOYEE picks it
 *   up in their espace and moves it to "review".
 *
 * Setup needs an immediately-claimable device, so the SN "plus" plan's
 * claim_waiting_period_days is temporarily set to 0 (restored after), and the
 * backend runs in mock payment mode. Employee: emp-flow-employee@safephone.test.
 *
 *   SLOW_MO=1500 npx playwright test claim-flow --headed
 */

const BASE = "http://localhost:3001";
const EMP_EMAIL = "emp-flow-employee@safephone.test";
const PASSWORD = "TestPassword123!";
const memberEmail = `claimer+${Date.now()}@safephone.test`;

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
  const res = await ctx.request.get(`${BASE}/api/auth/token`);
  return (await res.json()).token as string;
}

async function signUp(request: BrowserContext["request"], email: string) {
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await request.post(`${BASE}/api/auth/sign-up/email`, { headers, data: { email, password: PASSWORD, name: "Claimer" } });
  await request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email, password: PASSWORD } });
}

async function signInContext(ctx: BrowserContext, email: string) {
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await ctx.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email, password: PASSWORD } });
  await ctx.addCookies((await ctx.request.storageState()).cookies);
  await ctx.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);
}

test("member files a claim; an employee moves it to review", async ({ page, context, browser }) => {
  test.setTimeout(240_000);
  await signUp(context.request, memberEmail);
  await context.addCookies((await context.request.storageState()).cookies);
  await context.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);

  // ── Member subscribes (mock pay) so they have an active covered device ───
  await page.goto("/sn/paiement?plan=plus&device_type=smartphone&brand=iphone");
  await page.getByRole("button", { name: "iPhone", exact: true }).first().click();
  await page.getByPlaceholder(/iPhone 13|Galaxy A54/i).fill("iPhone 15 Pro");
  await page.getByRole("button", { name: continueBtn }).first().click();
  await uploadMedia(page);
  await page.getByRole("button", { name: continueBtn }).first().click();
  await page.getByRole("button", { name: /Payer|^Pay/i }).first().click();
  await expect(page.getByRole("button", { name: /tableau de bord|dashboard/i }).first()).toBeVisible({ timeout: 30_000 });

  // ── The primary device starts `pending`; an admin approves the verification
  // so it becomes active and claim-eligible. ──────────────────────────────
  const memberToken = await bearer(context);
  const devRes = await context.request.get(`${BASE}/api/v1/devices`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  const deviceId = (await devRes.json()).data[0].id as string;
  const adminCtx = await browser.newContext();
  await adminCtx.request.post(`${BASE}/api/auth/sign-in/email`, {
    headers: { Origin: BASE, "Content-Type": "application/json" },
    data: { email: "emp-flow-admin@safephone.test", password: PASSWORD },
  });
  const adminToken = await bearer(adminCtx);
  const approve = await adminCtx.request.post(
    `${BASE}/api/v1/admin/verifications/${deviceId}/approve`,
    { headers: { Origin: BASE, Authorization: `Bearer ${adminToken}` } },
  );
  expect(approve.ok()).toBeTruthy();
  await adminCtx.close();

  // ── Member files a claim on that device ──────────────────────────────────
  await page.goto("/sn/sinistres");
  await page.getByRole("button", { name: /Signaler un incident|Report an incident/i }).first().click();
  await page.locator("select").first().selectOption({ index: 1 });
  await page.locator("div.grid.grid-cols-2 button").first().click(); // first claim type
  await page.getByPlaceholder(/Décrivez les circonstances|Describe the circumstances/i)
    .fill("Écran fissuré après une chute. Test e2e.");
  await page.getByRole("button", { name: /Déclarer|Soumettre|Envoyer|Submit/i }).last().click();
  await expect(page.getByText(/Sinistre déclaré avec succès|Claim submitted successfully/i)).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(1500);

  // ── Employee picks up the claim and moves it to review ───────────────────
  const empCtx = await browser.newContext();
  await signInContext(empCtx, EMP_EMAIL);
  const emp = await empCtx.newPage();
  await emp.goto("/espace-employe");
  await emp.getByRole("button", { name: /^Sinistres$|^Claims$/i }).first().click();

  // Click the (first) claim in the list, then move it to review in the detail.
  await emp.locator("button").filter({ hasText: /iPhone 15 Pro|Écran|fissuré|Smartphone/i }).first().click();
  await emp.getByRole("button", { name: /Mettre en revue|Move to review/i }).first().click();
  // The "Mettre en revue" button only shows for pending claims — it disappears
  // once the claim advances.
  await expect(emp.getByRole("button", { name: /Mettre en revue|Move to review/i })).toHaveCount(0, { timeout: 15_000 });
  await empCtx.close();

  // Authoritative check: the member's own claim is now in "review".
  const claimsRes = await context.request.get(`${BASE}/api/v1/claims`, {
    headers: { Authorization: `Bearer ${await bearer(context)}` },
  });
  const claim = (await claimsRes.json()).data[0];
  expect(claim.status).toBe("review");
  console.log(`\n  ✅ Claim filed by ${memberEmail}, moved to review by the employee (status=${claim.status})\n`);
});
