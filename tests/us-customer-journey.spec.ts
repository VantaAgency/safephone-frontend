import { test, expect, type BrowserContext, type Page } from "./fixtures";

/**
 * Full US customer journey:
 *   signup → choose the "Plus" plan (us_plus: 2 phones + 1 tablet + 1 console)
 *   → Stripe checkout (4242) → register the 1st device → an admin approves the
 *   verification (so the sub flips pending_verification → active) → the
 *   customer adds the remaining devices their plan allows (2nd phone, tablet,
 *   console).
 *
 * Requires `stripe listen --forward-to .../api/v1/webhooks/stripe` running and
 * an admin account (emp-flow-admin@safephone.test, signed up + promoted).
 *
 *   SLOW_MO=1500 npx playwright test us-customer-journey --headed
 */

const BASE = "http://localhost:3001";
const ADMIN_EMAIL = "emp-flow-admin@safephone.test";
const ADMIN_PASSWORD = "TestPassword123!";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const MP4 = Buffer.from([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
  0x00, 0x00, 0x00, 0x00, 0x6d, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6f, 0x6d,
]);

const uploadedLink = /view uploaded file|voir le fichier/i;

// Upload the required photos + 1 video into the file inputs of `scope`. The
// photo-slot count varies by device type (e.g. smartphone & tablet need 2:
// front + back; a console needs 1), so derive it: the video is always the last
// file input, so photos = (#inputs − 1).
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

async function fillStripeCard(page: Page, email: string, name: string) {
  const emailField = page.getByRole("textbox", { name: /email/i });
  if (await emailField.isVisible().catch(() => false)) await emailField.fill(email);
  await page.getByRole("textbox", { name: /card number/i }).fill("4242 4242 4242 4242");
  await page.getByRole("textbox", { name: /expiration|expiry/i }).fill("12 / 30");
  await page.getByRole("textbox", { name: /cvc|security code/i }).fill("123");
  const nameField = page.getByRole("textbox", { name: /name on card|cardholder/i });
  if (await nameField.isVisible().catch(() => false)) await nameField.fill(name);
  const zip = page.getByRole("textbox", { name: /zip|postal/i });
  if (await zip.isVisible().catch(() => false)) await zip.fill("94103");
  await page.getByRole("button", { name: /subscribe|pay|start|confirm/i }).first().click();
}

// A short-lived Better Auth JWT for the given context's session (the backend
// /api/v1 routes authenticate via Bearer, not the cookie).
async function bearer(ctx: BrowserContext): Promise<string> {
  const res = await ctx.request.get(`${BASE}/api/auth/token`);
  const body = await res.json();
  return body.token as string;
}

test("US customer: signup → us_plus → pay → register + add all covered devices", async ({
  page,
  user,
  context,
  browser,
}) => {
  test.setTimeout(420_000);

  // ── See the plans, then choose "Plus" (us_plus) ──────────────────────────
  await page.goto("/us/pricing");
  await expect(page.getByText(/\$\d+/).first()).toBeVisible();
  await page.waitForTimeout(2000);
  await page.goto("/us/signup?plan=us_plus");

  // ── Stripe checkout ──────────────────────────────────────────────────────
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
  await fillStripeCard(page, user.email, user.name);
  await page.waitForURL(/\/us\/checkout\/success/, { timeout: 60_000 });

  // ── Register the first device (smartphone) ───────────────────────────────
  await page.goto("/us/register-device");
  await page.getByRole("button", { name: /smartphone/i }).first().click();
  await page.getByRole("button", { name: /apple|samsung|google/i }).first().click();
  await page.locator("#model").fill("iPhone 15 Pro");
  await uploadMedia(page);

  for (let attempt = 0; attempt < 6; attempt++) {
    await page.getByRole("button", { name: /finish registration/i }).click();
    const reached = await page.waitForURL(/\/us\/dashboard/, { timeout: 15_000 }).then(() => true).catch(() => false);
    if (reached) break;
    await page.waitForTimeout(5000);
  }
  await expect(page).toHaveURL(/\/us\/dashboard/);

  // ── Admin approves the verification → sub becomes active ─────────────────
  const custToken = await bearer(context);
  const devRes = await page.request.get(`${BASE}/api/v1/devices`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const deviceId = (await devRes.json()).data[0].id as string;

  const adminCtx = await browser.newContext();
  await adminCtx.request.post(`${BASE}/api/auth/sign-in/email`, {
    headers: { Origin: BASE, "Content-Type": "application/json" },
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const adminToken = await bearer(adminCtx);
  const approve = await adminCtx.request.post(
    `${BASE}/api/v1/admin/verifications/${deviceId}/approve`,
    { headers: { Origin: BASE, Authorization: `Bearer ${adminToken}` } },
  );
  expect(approve.ok()).toBeTruthy();
  await adminCtx.close();

  // ── Back to the customer: dashboard now lets them add covered devices ────
  await page.reload();
  const addBtn = page.getByRole("button", { name: /Add a device|Ajouter un appareil/i }).first();
  await expect(addBtn).toBeVisible({ timeout: 20_000 });

  async function addDevice(typeRegex: RegExp, isPhone: boolean, brand: string, model: string) {
    await addBtn.click();
    const modal = page.locator("div.fixed.inset-0");
    await expect(modal.getByRole("heading", { name: /Add a device|Ajouter un appareil/i })).toBeVisible({ timeout: 15_000 });
    await modal.getByRole("button", { name: typeRegex }).first().click();
    if (isPhone) await modal.getByPlaceholder(/Apple, Samsung/i).fill(brand);
    await modal.getByPlaceholder(/iPhone 15|PlayStation|MacBook/i).fill(model);
    // Dismiss the model combobox dropdown so it doesn't overlay the upload slots.
    await modal.getByText(/Device type|Type d'appareil/i).click();
    await uploadMedia(modal);
    await modal.getByRole("button", { name: /^Add device$|^Ajouter l.appareil$/i }).click();
    await expect(modal).toHaveCount(0, { timeout: 20_000 });
    await page.waitForTimeout(1500);
  }

  // The plan allows 2 phones / 1 tablet / 1 console; the 1st phone is in, so
  // add the rest of the coverage.
  await addDevice(/Tablet/i, false, "", "iPad Air");
  await addDevice(/console/i, false, "", "PlayStation 5");
  await addDevice(/Smartphone/i, true, "Samsung", "Galaxy S24");

  // ── Verify all 4 covered devices now exist ───────────────────────────────
  const finalRes = await page.request.get(`${BASE}/api/v1/devices`, {
    headers: { Authorization: `Bearer ${await bearer(context)}` },
  });
  const devices = (await finalRes.json()).data as Array<{ device_type: string }>;
  expect(devices.length).toBe(4);
  const types = devices.map((d) => d.device_type).sort();
  expect(types).toEqual(["game_console", "smartphone", "smartphone", "tablet"]);
  console.log(`\n  ✅ US customer ${user.email}: us_plus, 4 covered devices added\n`);
});
