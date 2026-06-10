import { test, expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Employee operational follow-up: a member with a device awaiting activation
 * surfaces in the employee's "Paiements / Suivi" list; the employee opens the
 * item, sets a follow-up status + reason, and saves it.
 *
 * Employee: emp-flow-employee@safephone.test. Backend in mock payment mode.
 *
 *   SLOW_MO=1500 npx playwright test employee-payment-followup --headed
 */

const BASE = "http://localhost:3001";
const PASSWORD = "TestPassword123!";
const ts = Date.now();
const memberEmail = `followup+${ts}@safephone.test`;
const memberName = `FollowUp Member ${ts}`;

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

async function signInContext(ctx: BrowserContext, email: string) {
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await ctx.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email, password: PASSWORD } });
  await ctx.addCookies((await ctx.request.storageState()).cookies);
  await ctx.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);
}

test("an employee records a payment follow-up on a client", async ({ page, context, browser }) => {
  test.setTimeout(180_000);
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await context.request.post(`${BASE}/api/auth/sign-up/email`, { headers, data: { email: memberEmail, password: PASSWORD, name: memberName } });
  await context.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email: memberEmail, password: PASSWORD } });
  await context.addCookies((await context.request.storageState()).cookies);
  await context.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);

  // ── Member subscribes (device stays pending = awaiting activation) ───────
  await page.goto("/sn/paiement?plan=plus&device_type=smartphone&brand=iphone");
  await page.getByRole("button", { name: "iPhone", exact: true }).first().click();
  await page.getByPlaceholder(/iPhone 13|Galaxy A54/i).fill("iPhone 15 Pro");
  await page.getByRole("button", { name: continueBtn }).first().click();
  await uploadMedia(page);
  await page.getByRole("button", { name: continueBtn }).first().click();
  await page.getByRole("button", { name: /Payer|^Pay/i }).first().click();
  await expect(page.getByRole("button", { name: /tableau de bord|dashboard/i }).first()).toBeVisible({ timeout: 30_000 });

  // ── Employee opens the follow-up list and records a follow-up ────────────
  const empCtx = await browser.newContext();
  await signInContext(empCtx, "emp-flow-employee@safephone.test");
  const emp = await empCtx.newPage();
  await emp.goto("/espace-employe");
  await emp.getByRole("button", { name: /Paiements \/ Suivi|Payments \/ Tracking|Payments/i }).first().click();

  // Open this client's item, then set a follow-up status + reason and save.
  await emp.getByText(memberName).first().click();
  await emp.locator("select").last().selectOption({ index: 1 });
  await emp.getByPlaceholder(/paiement échoué|failed payment/i).fill("Relance activation — appareil en attente. Test e2e.");
  await emp.getByRole("button", { name: /Enregistrer le suivi|Save follow-up/i }).click();
  await emp.waitForTimeout(1500);

  // Authoritative: the client's follow-up now has a status.
  const res = await empCtx.request.get(`${BASE}/api/v1/employee/payment-follow-ups`, {
    headers: { Authorization: `Bearer ${await bearer(empCtx)}` },
  });
  const items = (await res.json()).data as Array<{ client_email: string; follow_up?: { status?: string } }>;
  const mine = items.find((i) => i.client_email === memberEmail);
  expect(mine?.follow_up?.status).toBeTruthy();
  await empCtx.close();
  console.log(`\n  ✅ Employee recorded a follow-up (${mine?.follow_up?.status}) for ${memberEmail}\n`);
});
