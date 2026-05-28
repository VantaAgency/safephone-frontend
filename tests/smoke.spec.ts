import { test, expect } from "@playwright/test";

test.describe("Smoke — public pages", () => {
  test("SN home loads with French navbar + footer", async ({ page }) => {
    await page.goto("/sn");
    await expect(page).toHaveURL(/\/sn(\/)?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    // Navbar visible — country switcher shows SN flag
    const countryButton = page.getByRole("button", { name: /change country/i });
    await expect(countryButton).toBeVisible();
    await expect(countryButton).toContainText("SN");
    // Footer exists
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("US home loads with English navbar + footer", async ({ page }) => {
    await page.goto("/us");
    await expect(page).toHaveURL(/\/us(\/)?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const countryButton = page.getByRole("button", { name: /change country/i });
    await expect(countryButton).toBeVisible();
    await expect(countryButton).toContainText("US");
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("Country switcher toggles SN → US and persists via cookie", async ({
    page,
  }) => {
    await page.goto("/sn");
    await page.getByRole("button", { name: /change country/i }).click();
    const usOption = page.getByRole("menuitemradio", {
      name: /united states/i,
    });
    await expect(usOption).toBeVisible();
    await usOption.click();
    await page.waitForURL(/\/us(\/|$)/, { timeout: 10_000 });
    // Reload — cookie should keep us in US
    await page.reload();
    await expect(page).toHaveURL(/\/us(\/|$)/);
  });

  test("SN plans page renders pricing in FCFA", async ({ page }) => {
    await page.goto("/sn/forfaits");
    await expect(page).toHaveURL(/\/sn\/forfaits/);
    // Wait for at least one FCFA price token
    await expect(page.getByText(/FCFA/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("US pricing page renders USD prices", async ({ page }) => {
    await page.goto("/us/pricing");
    await expect(page).toHaveURL(/\/us\/pricing/);
    // Wait for at least one $ price token
    await expect(page.getByText(/\$\d+/).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("US marketing pages are reachable", async ({ page }) => {
    for (const path of [
      "/us/how-it-works",
      "/us/terms",
      "/us/privacy",
      "/us/repair-protection-terms",
    ]) {
      const res = await page.goto(path);
      expect(res?.status(), `expected 200 for ${path}`).toBeLessThan(400);
      // Should NOT show Next.js 404 page
      await expect(
        page.getByRole("heading", { name: /404|not found/i }),
      ).toHaveCount(0);
    }
  });

  test("Bare path /forfaits canonicalizes to /sn/forfaits (or /us/pricing per market)", async ({
    page,
  }) => {
    await page.goto("/forfaits");
    // Should land on either /sn/forfaits or /us/pricing — never stay bare
    await expect(page).toHaveURL(/\/(sn\/forfaits|us\/pricing)/, {
      timeout: 5_000,
    });
  });
});
