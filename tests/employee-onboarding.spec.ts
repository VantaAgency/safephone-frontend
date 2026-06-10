import {
  test,
  expect,
  type APIRequestContext,
  type BrowserContext,
} from "@playwright/test";

/**
 * Employee workflow: an ADMIN onboards a new employee from the admin dashboard
 * (Employés tab → "Ajouter un employé" → name/email/initial password), then
 * that brand-new employee signs in and lands on their /espace-employe.
 *
 * Watch it live (3s between actions):
 *   SLOW_MO=3000 npx playwright test employee-onboarding --headed
 *
 * Bootstrap (run before): emp-flow-admin@safephone.test is signed up and
 * promoted to admin (UPDATE users/"user".role).
 */

const BASE = "http://localhost:3001";
const ADMIN_EMAIL = "emp-flow-admin@safephone.test";
const ADMIN_PASSWORD = "TestPassword123!";
const EMP_PASSWORD = "TestPassword123!";
const empEmail = `emp+${Date.now()}@safephone.test`;
const empName = "Lola Employée";

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

test("admin onboards an employee; the employee then reaches their space", async ({
  page,
  request,
  context,
  browser,
}) => {
  test.setTimeout(120_000);

  // ── Admin signs in and opens the dashboard ───────────────────────────────
  await signIn(request, context, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin/);

  // ── Go to the Employés tab and open the create form ──────────────────────
  await page.getByRole("button", { name: "Employés" }).click();
  await page.getByRole("button", { name: /Ajouter un employé/ }).click();

  // The page also shows an edit panel for an already-selected employee, so
  // scope to the "Créer un compte employé" create panel to disambiguate.
  const createPanel = page
    .locator("div.rounded-3xl")
    .filter({ hasText: "Créer un compte employé" })
    .first();

  // ── Fill the new-employee form ───────────────────────────────────────────
  await createPanel.getByPlaceholder("Nom complet").fill(empName);
  await createPanel.getByPlaceholder("email@safephone.sn").fill(empEmail);
  await createPanel.getByPlaceholder(/Téléphone/).fill("+221 77 555 11 22");
  await createPanel.getByPlaceholder(/Mot de passe initial/).fill(EMP_PASSWORD);

  await createPanel.getByRole("button", { name: /Créer l.employé/ }).click();

  // Success: the form closes (initial-password field gone) and the new
  // employee shows up in the dashboard.
  await expect(page.getByPlaceholder(/Mot de passe initial/)).toBeHidden({
    timeout: 20_000,
  });
  await expect(page.getByText(empEmail).first()).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(2000);

  // ── The new employee signs in and lands on their own space ───────────────
  const empContext = await browser.newContext();
  await signIn(empContext.request, empContext, empEmail, EMP_PASSWORD);
  const empPage = await empContext.newPage();
  await empPage.goto("/espace-employe");

  // Not bounced to /acces-refuse — the employee role grants the space.
  await expect(empPage).toHaveURL(/\/espace-employe/);
  await expect(
    empPage.getByText(/Sinistres|Clients|Vue d.ensemble|Réparations/i).first(),
  ).toBeVisible({ timeout: 20_000 });
  await empPage.waitForTimeout(2000);

  console.log(`\n  ✅ Admin created employee + employee reached espace-employe: ${empEmail}\n`);
  await empContext.close();
});
