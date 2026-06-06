import { test, expect, type APIRequestContext, type BrowserContext } from "@playwright/test";

/**
 * The verification step adapts to the device type. A TV needs just one photo
 * (TV powered on) + a video — not the smartphone front/back pair.
 *
 *   SLOW_MO=800 npx playwright test verification-per-device --headed
 */

const PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";

function uniqueEmail() {
  return `member+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

async function signIn(request: APIRequestContext, context: BrowserContext, email: string) {
  await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
    headers: { Origin: BASE_URL, "Content-Type": "application/json" },
    data: { email, password: PASSWORD, name: "E2E Member" },
  });
  await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers: { Origin: BASE_URL, "Content-Type": "application/json" },
    data: { email, password: PASSWORD },
  });
  await context.addCookies((await request.storageState()).cookies);
}

test("TV verification asks for one 'TV powered on' photo, not front/back", async ({ page, request, context }) => {
  test.setTimeout(90_000);
  await signIn(request, context, uniqueEmail());

  await page.goto("/sn/paiement?plan=totale&annual=false&device_type=tv");

  // Device step: name the TV, then continue to verification.
  const combo = page.getByRole("combobox").first();
  await combo.click();
  await combo.fill("LG OLED");
  await page.getByRole("button", { name: /^continuer$|^continue$/i }).first().click();

  // Verification step is tailored to a TV.
  await expect(page.getByText(/Téléviseur allumé|TV powered on/).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/\(1 obligatoire\)|\(1 required\)/).first()).toBeVisible();
  // The smartphone front/back labels are gone for a TV.
  await expect(page.getByText(/Avant \(écran\)|Arrière/)).toHaveCount(0);
});
