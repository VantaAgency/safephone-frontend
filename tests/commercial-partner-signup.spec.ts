import { test, expect } from "@playwright/test";

/**
 * Flow: a COMMERCIAL shares their acquisition link, and a brand-new user (no
 * account) uses it to sign up AS A PARTNER. The commercial's link is
 *   {frontendURL}/partenaires?commercial=<CODE>
 * (built by buildCommercialReferralURL in the backend). PartnersPage reads the
 * ?commercial= param and sends commercial_referral_code with the application,
 * so the new partner is attributed to that commercial.
 *
 * Watch it live (3s between every action):
 *   SLOW_MO=3000 npx playwright test commercial-partner-signup --headed
 *
 * Active commercial used: rifi@gmail.com → referral_code CB53C5A2 (from DB).
 */

const COMMERCIAL_CODE = "CB53C5A2";
const PASSWORD = "TestPassword123!";

// Unique email each run so the inline sign-up always creates a fresh account.
const email = `legend.partner+${Date.now()}@safephone.test`;

test("a new user signs up as a partner through a commercial's link", async ({
  page,
  context,
}) => {
  // Force the SN market so phone format / cities / placeholders are Senegalese
  // (the form validates the phone against the active market's regex).
  await context.addCookies([
    { name: "sp_market", value: "SN", domain: "localhost", path: "/" },
  ]);

  // 1. Open the commercial's acquisition link as the recruited user would.
  await page.goto(`/partenaires?commercial=${COMMERCIAL_CODE}`);

  // The commercial code must survive any market redirect (/partenaires ->
  // /sn/partenaires) — that's what carries the attribution.
  await expect(page).toHaveURL(new RegExp(`commercial=${COMMERCIAL_CODE}`, "i"));

  // ── Step 1: "Mon compte" — create the account ────────────────────────────
  await expect(
    page.getByRole("heading", { name: /Créez votre compte|Create your account/ }),
  ).toBeVisible();

  await page.getByPlaceholder("Aminata Diallo").fill("Legend Partner");
  await page.getByPlaceholder("aminata@email.com").fill(email);
  await page.getByPlaceholder("+221 77 000 00 00").fill("+221 77 123 45 67");

  // Two password fields share the same bullet placeholder → first = password,
  // second = confirm.
  const pwFields = page.getByPlaceholder("••••••••");
  await pwFields.first().fill(PASSWORD);
  await pwFields.nth(1).fill(PASSWORD);

  await page.getByRole("button", { name: /Continuer|Continue/ }).click();

  // ── Step 2: "Ma boutique" — store details, then submit ───────────────────
  await expect(
    page.getByRole("heading", { name: /Votre boutique|Your store/ }),
  ).toBeVisible();

  await page.getByPlaceholder("Boutique Diallo Mobile").fill("Boutique Legend Mobile");
  await page.locator("select").selectOption("Dakar");
  await page.getByPlaceholder(/Marché Ouest Foire/).fill("Marché HLM, Avenue Bourguiba");

  await page
    .getByRole("button", { name: /Envoyer ma candidature|Submit/ })
    .click();

  // ── Success: application received ────────────────────────────────────────
  await expect(
    page.getByText(/Candidature reçue|Application received|Our team will review/i),
  ).toBeVisible({ timeout: 30_000 });

  // Linger so the result is visible in --headed runs.
  await page.waitForTimeout(3000);

  // Surface the email so the DB-attribution check can target this run.
  console.log(`\n  ✅ Partner signed up via commercial ${COMMERCIAL_CODE}: ${email}\n`);
});
