import { test, expect, type APIRequestContext, type BrowserContext } from "@playwright/test";

/**
 * For non-smartphone devices the payment step shows ONE combined
 * "brand + model" combobox (popular suggestions + free typing), not two
 * separate Brand/Model inputs.
 *
 *   SLOW_MO=800 npx playwright test device-combined-field --headed
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

test("non-smartphone device uses a single combined brand+model combobox", async ({ page, request, context }) => {
  test.setTimeout(90_000);
  await signIn(request, context, uniqueEmail());

  // Totale plan (covers consoles), declaring a game console (no IMEI).
  await page.goto("/sn/paiement?plan=totale&annual=false&device_type=game_console");

  // The single combined field is present…
  await expect(
    page.getByText(/Appareil \(marque et modèle\)|Device \(brand and model\)/).first(),
  ).toBeVisible({ timeout: 15_000 });

  // …and the old two-field Brand/Model layout is gone.
  await expect(page.getByPlaceholder(/Marque de l'appareil|Device brand/)).toHaveCount(0);
  await expect(page.getByPlaceholder(/Modele commercial|Commercial model/)).toHaveCount(0);

  // Typing surfaces a curated suggestion for the category.
  const combo = page.getByRole("combobox").first();
  await combo.click();
  await combo.fill("Play");
  await expect(page.getByRole("option", { name: /PlayStation 5/ }).first()).toBeVisible({ timeout: 10_000 });
});
