import { test, expect, type BrowserContext } from "@playwright/test";

/**
 * A commercial submits a field-activity report (preuve terrain) with a proof
 * photo from their espace-commercial.
 *
 * Commercial: commercial-flow@safephone.test (created via the admin
 * create-commercial flow, referral_code 04C07368).
 *
 *   SLOW_MO=1500 npx playwright test commercial-activity-report --headed
 */

const BASE = "http://localhost:3001";
const PASSWORD = "TestPassword123!";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

async function signInContext(ctx: BrowserContext, email: string) {
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await ctx.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email, password: PASSWORD } });
  await ctx.addCookies((await ctx.request.storageState()).cookies);
  await ctx.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);
}

test("a commercial submits a field-activity report with a proof photo", async ({ context, browser }) => {
  test.setTimeout(120_000);
  const comm = await browser.newContext();
  await signInContext(comm, "commercial-flow@safephone.test");
  const page = await comm.newPage();
  await page.goto("/espace-commercial");

  // ── Field visits tab → fill the report and attach a proof photo ──────────
  await page.getByRole("button", { name: /Visites terrain|Field visits/i }).first().click();
  await page.getByPlaceholder(/^Commentaire$|^Comment$/i).fill("Visite de la boutique partenaire — affichage QR installé. Test e2e.");
  await page.locator('input[type="file"]').first().setInputFiles({ name: "proof.png", mimeType: "image/png", buffer: PNG });
  await page.getByRole("button", { name: /Envoyer le rapport|Submit report/i }).click();

  await expect(page.getByText(/Rapport envoyé|Report submitted/i).first()).toBeVisible({ timeout: 20_000 });
  await comm.close();
  console.log(`\n  ✅ Commercial submitted a field-activity report with a proof photo\n`);
});
