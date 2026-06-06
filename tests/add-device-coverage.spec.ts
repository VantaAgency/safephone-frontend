import { test, expect, type APIRequestContext, type BrowserContext } from "@playwright/test";

/**
 * The add-device flow (/sn/inscription) must (B) show each plan's device
 * coverage and (A) let the user pick the device type a multi-device plan
 * covers — including a game console — instead of forcing a smartphone.
 *
 *   SLOW_MO=900 npx playwright test add-device-coverage --headed
 */

const PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";

function uniqueEmail() {
  return `member+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

async function registerAndSignIn(request: APIRequestContext, context: BrowserContext, email: string) {
  const up = await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
    headers: { Origin: BASE_URL, "Content-Type": "application/json" },
    data: { email, password: PASSWORD, name: "E2E Member" },
  });
  if (!up.ok()) throw new Error(`sign-up failed (${up.status()})`);
  const si = await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers: { Origin: BASE_URL, "Content-Type": "application/json" },
    data: { email, password: PASSWORD },
  });
  if (!si.ok()) throw new Error(`sign-in failed (${si.status()})`);
  await context.addCookies((await request.storageState()).cookies);
}

test("add-device flow shows plan coverage and lets you pick a non-phone device", async ({ page, request, context }) => {
  test.setTimeout(90_000);
  await registerAndSignIn(request, context, uniqueEmail());

  await page.goto("/sn/inscription");

  // B — each plan shows its device coverage; a multi-device plan lists consoles.
  await expect(page.getByText(/Couvre\s*:/).first()).toBeVisible({ timeout: 15_000 });
  const consolePlan = page.getByRole("button").filter({ hasText: /consoles/ }).first();
  await expect(consolePlan).toBeVisible({ timeout: 15_000 });

  // Pick that multi-device plan and advance to the device step.
  await consolePlan.click();
  await page.getByRole("button", { name: /continuer/i }).first().click();

  // A — the device-type step offers multiple types (not phone-only), including
  // a game console.
  await expect(page.getByText(/Console de jeux/).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/^Tablette$/).first()).toBeVisible();
});
