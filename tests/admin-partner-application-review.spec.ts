import { test, expect, type BrowserContext } from "@playwright/test";

/**
 * Admin reviews a DIRECT partner application. A new user applies via
 * /partenaires WITHOUT a commercial code (so the application is pending, not
 * auto-approved), then an admin approves it from the Candidatures tab with a
 * commission %.
 *
 * Admin: emp-flow-admin@safephone.test. The store name is unique so the row is
 * easy to target.
 *
 *   SLOW_MO=1500 npx playwright test admin-partner-application-review --headed
 */

const BASE = "http://localhost:3001";
const PASSWORD = "TestPassword123!";
const ts = Date.now();
const applicantEmail = `directpartner+${ts}@safephone.test`;
const storeName = `Boutique Direct ${ts}`;

async function signInContext(ctx: BrowserContext, email: string) {
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await ctx.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email, password: PASSWORD } });
  await ctx.addCookies((await ctx.request.storageState()).cookies);
  await ctx.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);
}

test("admin approves a direct partner application", async ({ page, context, browser }) => {
  test.setTimeout(150_000);
  await context.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);

  // ── A new user applies directly (no commercial code → pending) ───────────
  await page.goto("/partenaires");
  await page.getByPlaceholder("Aminata Diallo").fill("Direct Partner");
  await page.getByPlaceholder("aminata@email.com").fill(applicantEmail);
  await page.getByPlaceholder("+221 77 000 00 00").fill("+221 77 222 33 44");
  const pw = page.getByPlaceholder("••••••••");
  await pw.first().fill(PASSWORD);
  await pw.nth(1).fill(PASSWORD);
  await page.getByRole("button", { name: /Continuer|Continue/ }).click();

  await page.getByPlaceholder("Boutique Diallo Mobile").fill(storeName);
  await page.locator("select").selectOption("Dakar");
  await page.getByPlaceholder(/Marché Ouest Foire/).fill("Marché Tilène, Dakar");
  await page.getByRole("button", { name: /Envoyer ma candidature|Submit/ }).click();
  await expect(page.getByText(/Candidature reçue|Application received|Our team will review/i)).toBeVisible({ timeout: 20_000 });

  // ── Admin reviews + approves it in the Candidatures tab ──────────────────
  const adminCtx = await browser.newContext();
  await signInContext(adminCtx, "emp-flow-admin@safephone.test");
  const admin = await adminCtx.newPage();
  await admin.goto("/admin");
  await admin.getByRole("button", { name: /^Candidatures$|^Applications$/i }).first().click();

  const row = admin.getByRole("row").filter({ hasText: storeName });
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.getByPlaceholder("10").fill("12");
  await row.getByRole("button", { name: /^Approuver$|^Approve$/i }).click();

  // Status flips to approved.
  await expect(row.getByText(/Approuv|Approved/i).first()).toBeVisible({ timeout: 15_000 });
  await adminCtx.close();
  console.log(`\n  ✅ Admin approved direct partner application "${storeName}" (${applicantEmail})\n`);
});
