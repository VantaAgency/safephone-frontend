import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * E2E coverage for the admin market filter dropdown (All / SN / US):
 *   - The "Marché" filter is visible on a market-aware tab (Payments).
 *   - Selecting a market pushes ?market=<code> to the URL (bookmarkable).
 *   - Clearing it back to "Tous les marchés" removes the param.
 *
 * Backend honours ?market= on /admin/payments|claims|repairs; this test
 * proves the UI wiring + URL persistence end to end in a real browser.
 */

const ADMIN_PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";
const BACKEND_DIR = path.resolve(__dirname, "../../safePhone-Backend");

function uniqueAdminEmail() {
  return `admin+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

test.describe("Admin market filter", () => {
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

    // Promote to admin in both the legacy users table and Better Auth "user".
    const sql = `UPDATE users SET role = 'admin', updated_at = now() WHERE email = '${adminEmail}' AND deleted_at IS NULL; UPDATE "user" SET role = 'admin', "updatedAt" = now() WHERE email = '${adminEmail}';`;
    execFileSync(
      "docker",
      ["compose", "-f", path.join(BACKEND_DIR, "docker-compose.yml"), "exec", "-T",
        "postgres", "psql", "-U", "safephone", "-d", "safephone", "-c", sql],
      { stdio: "pipe" },
    );
  });

  test("market filter persists to ?market= URL param", async ({ page, request, context }) => {
    test.setTimeout(60_000);

    // Sign in AFTER the role bump so the session JWT carries role=admin.
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

    // Go to a market-aware tab (Payments) where the filter is mounted.
    await page.getByRole("button", { name: /paiements|payments/i }).first().click();

    // The market filter dropdown — a <select> that offers an "US" option.
    const marketSelect = page.locator('select:has(option[value="US"])');
    await expect(marketSelect).toBeVisible({ timeout: 10_000 });

    // Select US → URL gains ?market=US.
    await marketSelect.selectOption("US");
    await expect(page).toHaveURL(/[?&]market=US/, { timeout: 5_000 });

    // Select SN → URL switches to ?market=SN.
    await marketSelect.selectOption("SN");
    await expect(page).toHaveURL(/[?&]market=SN/, { timeout: 5_000 });

    // Back to "all" → the param is removed.
    await marketSelect.selectOption("");
    await expect(page).not.toHaveURL(/market=/, { timeout: 5_000 });
  });
});
