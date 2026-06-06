import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * E2E coverage for per-market revenue stat cards on the admin overview:
 * the single XOF-only "Monthly revenue" card was split into two cards —
 * "Revenus SN" (FCFA) and "Revenus US" ($) — so currencies are never
 * summed. Both are always shown, even when a market has no revenue yet.
 */

const ADMIN_PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";
const BACKEND_DIR = path.resolve(__dirname, "../../safePhone-Backend");

function uniqueAdminEmail() {
  return `admin+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

test.describe("Admin per-market stats", () => {
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

  test("overview shows separate SN and US revenue cards", async ({ page, request, context }) => {
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

    // Both market revenue cards are present (overview is the default tab).
    await expect(page.getByText(/Revenus SN|Revenue SN/).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Revenus US|Revenue US/).first()).toBeVisible({ timeout: 10_000 });

    // The SN card renders FCFA and the US card renders a $ amount — the two
    // currencies coexist without being summed.
    await expect(page.getByText(/🇸🇳/).first()).toBeVisible();
    await expect(page.getByText(/🇺🇸\s*\$/).first()).toBeVisible();
  });
});
