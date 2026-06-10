import {
  test,
  expect,
  type APIRequestContext,
  type BrowserContext,
} from "@playwright/test";

/**
 * Full chain: an ADMIN registers a new COMMERCIAL (Commerciaux tab → Inviter un
 * commercial), the test reads that commercial's freshly-minted referral code
 * from the table, then a brand-new user opens the commercial's link
 * (/partenaires?commercial=<code>) and registers AS A PARTNER under them
 * (auto-approved, attributed to the new commercial).
 *
 * Watch it live (3s between actions):
 *   SLOW_MO=3000 npx playwright test commercial-and-partner-register --headed
 *
 * Bootstrap: emp-flow-admin@safephone.test is an admin (signed up + promoted).
 */

const BASE = "http://localhost:3001";
const ADMIN_EMAIL = "emp-flow-admin@safephone.test";
const PASSWORD = "TestPassword123!";

const ts = Date.now();
const commercialEmail = `commercial+${ts}@safephone.test`;
const partnerEmail = `cpreg+${ts}@safephone.test`;

async function signIn(
  request: APIRequestContext,
  context: BrowserContext,
  email: string,
  password: string,
) {
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  const res = await request.post(`${BASE}/api/auth/sign-in/email`, {
    headers,
    data: { email, password },
  });
  if (!res.ok()) throw new Error(`sign-in failed for ${email} (${res.status()})`);
  await context.addCookies((await request.storageState()).cookies);
  await context.addCookies([
    { name: "sp_market", value: "SN", domain: "localhost", path: "/" },
  ]);
}

test("admin registers a commercial, then a new user registers as partner under them", async ({
  page,
  request,
  context,
  browser,
}) => {
  // Two phases (admin create + partner signup) across two contexts, each with
  // cold page compiles — generous timeout so SLOW_MO runs don't trip it.
  test.setTimeout(360_000);

  // ══ Phase 1: admin registers a commercial ════════════════════════════════
  await signIn(request, context, ADMIN_EMAIL, PASSWORD);
  await page.goto("/admin");
  await page.getByRole("button", { name: "Commerciaux" }).click();
  await page.getByRole("button", { name: /Inviter un commercial/ }).click();

  // Scope to the create form (anchored on its unique commission label).
  const createPanel = page
    .locator("div.rounded-2xl")
    .filter({ hasText: "Commission commercial (%)" })
    .first();
  await createPanel.getByPlaceholder("Nom complet").fill("Comm Ercial");
  await createPanel.getByPlaceholder("email@safephone.sn").fill(commercialEmail);
  await createPanel.getByPlaceholder("Téléphone").fill("+221 77 444 33 22");
  await createPanel.getByPlaceholder("Mot de passe").fill(PASSWORD);
  await createPanel.getByRole("button", { name: "Créer" }).click();

  // The new commercial appears in the table — read its referral code (col 2).
  const row = page.getByRole("row").filter({ hasText: commercialEmail });
  await expect(row).toBeVisible({ timeout: 20_000 });
  const code = (await row.locator("td").nth(1).innerText()).trim().toUpperCase();
  expect(code).toMatch(/^[A-Z0-9]{6,}$/);
  console.log(`\n  commercial registered: ${commercialEmail} → code ${code}`);
  await page.waitForTimeout(2500);

  // ══ Phase 2: a fresh user registers as partner via the commercial link ════
  const userCtx = await browser.newContext();
  await userCtx.addCookies([
    { name: "sp_market", value: "SN", domain: "localhost", path: "/" },
  ]);
  const u = await userCtx.newPage();
  await u.goto(`/partenaires?commercial=${code}`);
  await expect(u).toHaveURL(new RegExp(`commercial=${code}`, "i"));

  // Step 1 — account
  await u.getByPlaceholder("Aminata Diallo").fill("Partner Underling");
  await u.getByPlaceholder("aminata@email.com").fill(partnerEmail);
  await u.getByPlaceholder("+221 77 000 00 00").fill("+221 77 111 22 33");
  const pw = u.getByPlaceholder("••••••••");
  await pw.first().fill(PASSWORD);
  await pw.nth(1).fill(PASSWORD);
  await u.getByRole("button", { name: /Continuer/ }).click();

  // Step 2 — store
  await u.getByPlaceholder("Boutique Diallo Mobile").fill("Boutique Underling");
  await u.locator("select").selectOption("Dakar");
  await u.getByPlaceholder(/Marché Ouest Foire/).fill("Marché Sandaga, Plateau");
  await u.getByRole("button", { name: /Envoyer ma candidature/ }).click();

  await expect(
    u.getByText(/Candidature reçue|Application received|Our team will review/i),
  ).toBeVisible({ timeout: 30_000 });
  await u.waitForTimeout(2500);

  console.log(`  ✅ partner ${partnerEmail} registered under commercial ${code}\n`);
  await userCtx.close();
});
