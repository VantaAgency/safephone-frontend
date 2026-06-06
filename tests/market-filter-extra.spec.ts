import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Extends the admin market filter to the Customers and Verifications tabs:
 * the "Marché" dropdown now appears there too, and the ?market= selection
 * persists across tab switches.
 */

const ADMIN_PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";
const BACKEND_DIR = path.resolve(__dirname, "../../safePhone-Backend");

function uniqueAdminEmail() {
  return `admin+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

test.describe("Admin market filter — customers + verifications", () => {
  let adminEmail: string;

  test.beforeAll(async ({ request }) => {
    adminEmail = uniqueAdminEmail();
    const signUp = await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
      headers: { Origin: BASE_URL, "Content-Type": "application/json" },
      data: { email: adminEmail, password: ADMIN_PASSWORD, name: "E2E Admin" },
    });
    if (!signUp.ok()) {
      throw new Error(`sign-up failed (${signUp.status()}): ${await signUp.text().catch(() => "")}`);
    }
    const sql = `UPDATE users SET role = 'admin', updated_at = now() WHERE email = '${adminEmail}' AND deleted_at IS NULL; UPDATE "user" SET role = 'admin', "updatedAt" = now() WHERE email = '${adminEmail}';`;
    execFileSync(
      "docker",
      ["compose", "-f", path.join(BACKEND_DIR, "docker-compose.yml"), "exec", "-T",
        "postgres", "psql", "-U", "safephone", "-d", "safephone", "-c", sql],
      { stdio: "pipe" },
    );
  });

  test("filter is present on Customers and Verifications tabs and persists", async ({ page, request, context }) => {
    test.setTimeout(60_000);

    const signIn = await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
      headers: { Origin: BASE_URL, "Content-Type": "application/json" },
      data: { email: adminEmail, password: ADMIN_PASSWORD },
    });
    if (!signIn.ok()) {
      throw new Error(`sign-in failed (${signIn.status()}): ${await signIn.text().catch(() => "")}`);
    }
    await context.addCookies((await request.storageState()).cookies);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/);

    const marketSelect = page.locator('select:has(option[value="US"])');

    // Customers tab — filter is now mounted here too.
    await page.getByRole("button", { name: /^clients$|^customers$/i }).first().click();
    await expect(marketSelect).toBeVisible({ timeout: 10_000 });
    await marketSelect.selectOption("US");
    await expect(page).toHaveURL(/[?&]market=US/, { timeout: 5_000 });

    // Switch to Verifications — the dropdown stays and the selection persists.
    await page.getByRole("button", { name: /v[ée]rifications/i }).first().click();
    await expect(marketSelect).toBeVisible({ timeout: 10_000 });
    await expect(marketSelect).toHaveValue("US");
    await expect(page).toHaveURL(/[?&]market=US/);
  });
});
