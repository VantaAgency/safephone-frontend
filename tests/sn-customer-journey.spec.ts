import { test, expect, type BrowserContext, type Page } from "./fixtures";

/**
 * Full SN customer journey:
 *   see the plans → take the "Plus" plan (2 phones + 1 tablet + 1 console) →
 *   pay (mock/dev mode, no DEXPAY redirect) → land on the dashboard → add the
 *   remaining devices the plan allows (tablet, console, 2nd phone).
 *
 * The fragile multi-step /sn/inscription form is skipped by going straight to
 * /sn/paiement with the plan/brand/device_type query params it would set.
 *
 * Requires the backend in MOCK payment mode (DEXPAY_* unset → "DEXPAY not
 * configured, using mock payment mode").
 *
 *   SLOW_MO=1500 npx playwright test sn-customer-journey --headed
 */

const BASE = "http://localhost:3001";

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

test("SN customer: take Plus plan → mock pay → add all covered devices", async ({
  page,
  user,
  context,
}) => {
  test.setTimeout(300_000);
  await context.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);

  // ── See the plans, then start the "Plus" subscription ────────────────────
  await page.goto("/sn/forfaits");
  await expect(page.getByText(/Couvre|FCFA|XOF/i).first()).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(2000);
  await page.goto("/sn/paiement?plan=plus&device_type=smartphone&brand=iphone");

  // ── Payment step 0: device — smartphone is pre-selected from the query;
  // pick the brand (activates the model field) then fill the model. ─────────
  await page.getByRole("button", { name: "iPhone", exact: true }).first().click();
  await page.getByPlaceholder(/iPhone 13|Galaxy A54/i).fill("iPhone 15 Pro");
  await page.getByRole("button", { name: continueBtn }).first().click();

  // ── Payment step 1: verification media ───────────────────────────────────
  await uploadMedia(page);
  await page.getByRole("button", { name: continueBtn }).first().click();

  // ── Payment step 2: pay (mock auto-completes) ────────────────────────────
  // Mock mode finalizes immediately and shows a success / "already finalized"
  // state with a dashboard CTA (no external redirect), instead of /paiement/succes.
  await page.getByRole("button", { name: /Payer|^Pay/i }).first().click();
  await expect(
    page.getByRole("button", { name: /tableau de bord|dashboard/i }).first(),
  ).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(1500);

  // ── Dashboard: add the remaining covered devices ─────────────────────────
  await page.goto("/tableau-de-bord");
  const addBtn = page.getByRole("button", { name: /Ajouter un appareil|Add a device/i }).first();
  await expect(addBtn).toBeVisible({ timeout: 20_000 });

  async function addDevice(typeRegex: RegExp, isPhone: boolean, brand: string, model: string) {
    await addBtn.click();
    const modal = page.locator("div.fixed.inset-0");
    await expect(modal.getByRole("heading", { name: /Ajouter un appareil|Add a device/i })).toBeVisible({ timeout: 15_000 });
    await modal.getByRole("button", { name: typeRegex }).first().click();
    if (isPhone) await modal.getByPlaceholder(/Apple, Samsung/i).fill(brand);
    await modal.getByPlaceholder(/iPhone 15|PlayStation|MacBook/i).fill(model);
    await modal.getByText(/Type d'appareil|Device type/i).click();
    await uploadMedia(modal);
    await modal.getByRole("button", { name: /^Ajouter l.appareil$|^Add device$/i }).click();
    await expect(modal).toHaveCount(0, { timeout: 20_000 });
    await page.waitForTimeout(1500);
  }

  await addDevice(/Tablette|Tablet/i, false, "", "iPad Air");
  await addDevice(/Console|console/i, false, "", "PlayStation 5");
  await addDevice(/Smartphone/i, true, "Samsung", "Galaxy S24");

  // ── Verify all 4 covered devices ─────────────────────────────────────────
  const finalRes = await page.request.get(`${BASE}/api/v1/devices`, {
    headers: { Authorization: `Bearer ${await bearer(context)}` },
  });
  const devices = (await finalRes.json()).data as Array<{ device_type: string }>;
  expect(devices.length).toBe(4);
  expect(devices.map((d) => d.device_type).sort()).toEqual([
    "game_console",
    "smartphone",
    "smartphone",
    "tablet",
  ]);
  console.log(`\n  ✅ SN customer ${user.email}: Plus plan, 4 covered devices added\n`);
});
