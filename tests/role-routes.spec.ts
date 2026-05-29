import {
  test,
  expect,
  type APIRequestContext,
  type BrowserContext,
} from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Per-role smoke tests: for each non-default role (employee, partner,
 * commercial) we register a fresh user, promote them via direct DB
 * update, sign them in, and verify they land on their dedicated
 * dashboard with the expected page header rendered.
 *
 * Coverage:
 *   member     → /tableau-de-bord     (covered by market-currency.spec.ts)
 *   admin      → /admin                (covered by admin-dashboard.spec.ts)
 *   employee   → /espace-employe       (this file)
 *   partner    → /espace-partenaire    (this file)
 *   commercial → /espace-commercial    (this file)
 *
 * Why the Makefile target is not used:
 *   `make promote-{admin,employee}` exists but partner/commercial don't
 *   have targets, and the existing targets shell out to a local `psql`
 *   binary which isn't on PATH in CI or minimal dev environments. We go
 *   through `docker compose exec postgres psql` directly so the test is
 *   self-contained.
 *
 * Both tables (`users` and Better Auth's `"user"`) are updated in one
 * round-trip so the role check in middleware matches the JWT claim.
 */

const PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";
const BACKEND_DIR = path.resolve(__dirname, "../../safePhone-Backend");

type Role = "employee" | "partner" | "commercial";

function uniqueEmail(prefix: string): string {
  return `${prefix}+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

/**
 * Updates the user's role in both `users` and Better Auth `"user"` via a
 * single psql -c call inside the postgres docker container. Uses
 * execFileSync with an argv array (NOT a shell string) so the email and
 * role values cannot be interpreted as shell metachars.
 */
function promoteRole(email: string, role: Role): void {
  const sql = `UPDATE users SET role = '${role}', updated_at = now() WHERE email = '${email}' AND deleted_at IS NULL; UPDATE "user" SET role = '${role}', "updatedAt" = now() WHERE email = '${email}';`;
  execFileSync(
    "docker",
    [
      "compose",
      "-f",
      path.join(BACKEND_DIR, "docker-compose.yml"),
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      "safephone",
      "-d",
      "safephone",
      "-c",
      sql,
    ],
    { stdio: "pipe" },
  );
}

async function registerUser(
  request: APIRequestContext,
  email: string,
): Promise<void> {
  const res = await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
    headers: { Origin: BASE_URL, "Content-Type": "application/json" },
    data: { email, password: PASSWORD, name: `E2E ${email}` },
  });
  if (!res.ok()) {
    throw new Error(
      `sign-up failed (${res.status()}): ${await res.text().catch(() => "")}`,
    );
  }
}

async function signInAndAttach(
  request: APIRequestContext,
  context: BrowserContext,
  email: string,
): Promise<void> {
  const res = await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers: { Origin: BASE_URL, "Content-Type": "application/json" },
    data: { email, password: PASSWORD },
  });
  if (!res.ok()) {
    throw new Error(
      `sign-in failed (${res.status()}): ${await res.text().catch(() => "")}`,
    );
  }
  const storage = await request.storageState();
  await context.addCookies(storage.cookies);
}

test.describe("Role-based dashboard routing", () => {
  test("employee can access /espace-employe", async ({
    page,
    request,
    context,
  }) => {
    test.setTimeout(60_000);
    const email = uniqueEmail("employee");
    await registerUser(request, email);
    promoteRole(email, "employee");
    await signInAndAttach(request, context, email);

    await page.goto("/espace-employe");
    await page.waitForURL(/\/espace-employe/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/espace-employe/);
    await expect(
      page.getByRole("heading", { name: /espace employ[eé]/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("partner can access /espace-partenaire", async ({
    page,
    request,
    context,
  }) => {
    test.setTimeout(60_000);
    const email = uniqueEmail("partner");
    await registerUser(request, email);
    promoteRole(email, "partner");
    await signInAndAttach(request, context, email);

    await page.goto("/espace-partenaire");
    await page.waitForURL(/\/espace-partenaire/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/espace-partenaire/);
    // The "Partenaire" / "Partner" pill is always rendered at the top.
    await expect(
      page.getByText(/^Partenaire$|^Partner$/).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("commercial can access /espace-commercial", async ({
    page,
    request,
    context,
  }) => {
    test.setTimeout(60_000);
    const email = uniqueEmail("commercial");
    await registerUser(request, email);
    promoteRole(email, "commercial");
    await signInAndAttach(request, context, email);

    await page.goto("/espace-commercial");
    await page.waitForURL(/\/espace-commercial/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/espace-commercial/);
    await expect(
      page
        .getByRole("heading", { name: /espace commercial|commercial dashboard/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("member is bounced from /admin (negative)", async ({
    page,
    request,
    context,
  }) => {
    test.setTimeout(60_000);
    const email = uniqueEmail("member");
    await registerUser(request, email);
    // No role bump — stays default member.
    await signInAndAttach(request, context, email);

    await page.goto("/admin");
    // Member should NOT stay on /admin. Proxy redirects to home with auth
    // modal or to the member dashboard depending on session state.
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"), {
      timeout: 10_000,
    });
    expect(page.url()).not.toContain("/admin");
  });
});
