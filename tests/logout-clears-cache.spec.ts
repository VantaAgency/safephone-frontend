import { test, expect, type APIRequestContext, type BrowserContext } from "@playwright/test";

/**
 * Logout must drop the React Query cache (handleSignOut → queryClient.clear())
 * so the previous session's data can't linger for the next user on the same
 * browser. Observable end state: after signing out, the authed dashboard is
 * gone and a protected route no longer renders the cached dashboard.
 *
 *   SLOW_MO=1000 npx playwright test logout-clears-cache --headed
 */

const PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";

function uniqueEmail() {
  return `member+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

async function registerAndSignIn(request: APIRequestContext, context: BrowserContext, email: string) {
  const up = await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
    headers: { Origin: BASE_URL, "Content-Type": "application/json" },
    data: { email, password: PASSWORD, name: "E2E Member" },
  });
  if (!up.ok()) throw new Error(`sign-up failed (${up.status()})`);
  const si = await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers: { Origin: BASE_URL, "Content-Type": "application/json" },
    data: { email, password: PASSWORD },
  });
  if (!si.ok()) throw new Error(`sign-in failed (${si.status()})`);
  await context.addCookies((await request.storageState()).cookies);
}

test("signing out clears cached data and locks protected routes", async ({ page, request, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 }); // ensure desktop navbar

  await registerAndSignIn(request, context, uniqueEmail());

  // 1. Load the dashboard so React Query caches the member's data.
  await page.goto("/tableau-de-bord");
  await expect(page).toHaveURL(/tableau-de-bord/);
  await expect(
    page.getByText(/tableau de bord|dashboard|mes appareils|my devices|aucun|no devices|appareils/i).first(),
  ).toBeVisible({ timeout: 15_000 });

  // 2. Open the account menu (navbar is in AppShell, present here) and sign out.
  const accountTrigger = page.getByRole("button", { name: /mon espace|my space/i });
  await expect(accountTrigger).toBeVisible({ timeout: 15_000 });
  await accountTrigger.click();
  await page.getByRole("button", { name: /déconnexion|sign out/i }).click();

  // 3. We're logged out: the account menu trigger is gone.
  await expect(accountTrigger).toHaveCount(0, { timeout: 15_000 });

  // 4. Re-visiting the protected route keeps us logged out (the guard bounces
  //    to home + auth modal) — no authed chrome, and with the cache cleared
  //    there's no stale dashboard to flash.
  await page.goto("/tableau-de-bord");
  await expect(page.getByRole("button", { name: /mon espace|my space/i })).toHaveCount(0, { timeout: 15_000 });
});
