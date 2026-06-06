import { test, expect } from "@playwright/test";

/**
 * The compact plan cards must list every standard service — including
 * hardware-failure and battery-damage support — in each market's language.
 */
test("SN plan cards list hardware-failure + battery-damage support (FR)", async ({ page }) => {
  await page.goto("/sn/forfaits");
  await expect(page).toHaveURL(/\/sn\/forfaits/);
  await expect(page.getByText(/Support panne matérielle/).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Support batterie endommagée/).first()).toBeVisible();
});

test("US plan cards list hardware-failure + battery-damage support (EN)", async ({ page }) => {
  await page.goto("/us/pricing");
  await expect(page).toHaveURL(/\/us\/pricing/);
  await expect(page.getByText(/Hardware failure support/i).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Battery damage support/i).first()).toBeVisible();
});
