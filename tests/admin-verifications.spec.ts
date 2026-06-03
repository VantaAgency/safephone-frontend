import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Plans v2 admin Verifications tab smoke test.
 *
 * The tab itself doesn't need a populated queue to prove it shipped —
 * the empty-state copy is enough to confirm:
 *   - the admin user can land on /admin,
 *   - the new "Verifications" tab is in the tab strip,
 *   - clicking it renders the queue UI (loading skeleton + empty state).
 *
 * Pre-existing queue items would also exercise the photo grid + approve
 * / reject controls, but seeding a full pending verification requires a
 * paid subscription + an admin device payload — out of scope for this
 * smoke. The us-stripe.spec.ts test already exercises the
 * pending_verification flow on the customer side.
 */

const ADMIN_PASSWORD = "TestPassword123!";
const BACKEND_DIR = path.resolve(__dirname, "../../safePhone-Backend");

function uniqueAdminEmail() {
  return `admin-verif+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

test.describe("Admin Verifications tab", () => {
  let adminEmail: string;

  test.beforeAll(async ({ request }) => {
    adminEmail = uniqueAdminEmail();
    const baseURL = "http://localhost:3001";

    const signUp = await request.post(`${baseURL}/api/auth/sign-up/email`, {
      headers: { Origin: baseURL, "Content-Type": "application/json" },
      data: {
        email: adminEmail,
        password: ADMIN_PASSWORD,
        name: "E2E Verif Admin",
      },
    });
    if (!signUp.ok()) {
      throw new Error(
        `sign-up failed (${signUp.status()}): ${await signUp.text().catch(() => "")}`,
      );
    }

    const sql = `UPDATE users SET role = 'admin', updated_at = now() WHERE email = '${adminEmail}' AND deleted_at IS NULL; UPDATE "user" SET role = 'admin', "updatedAt" = now() WHERE email = '${adminEmail}';`;
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
  });

  test("admin lands on /admin and the Verifications tab renders", async ({
    page,
    request,
    context,
  }) => {
    test.setTimeout(60_000);
    const baseURL = "http://localhost:3001";

    const signIn = await request.post(`${baseURL}/api/auth/sign-in/email`, {
      headers: { Origin: baseURL, "Content-Type": "application/json" },
      data: { email: adminEmail, password: ADMIN_PASSWORD },
    });
    if (!signIn.ok()) {
      throw new Error(
        `sign-in failed (${signIn.status()}): ${await signIn.text().catch(() => "")}`,
      );
    }
    const storage = await request.storageState();
    await context.addCookies(storage.cookies);

    await page.goto("/admin");
    await page.waitForURL(/\/admin/, { timeout: 10_000 });

    const verifTab = page
      .getByRole("button", { name: /v[ée]rifications|^verifications$/i })
      .first();
    await expect(verifTab).toBeVisible({ timeout: 10_000 });
    await verifTab.click();

    // The tab renders either the empty state or the queue. Both are
    // valid — what matters is that the underlying fetch resolved (no
    // 401/403 banner) and the UI mounted.
    const empty = page.getByText(
      /aucune v[ée]rification|no pending verifications/i,
    );
    const queueItem = page.getByRole("button", {
      name: /approuver|approve/i,
    });
    await expect.poll(
      async () => (await empty.count()) + (await queueItem.count()),
      { timeout: 10_000 },
    ).toBeGreaterThan(0);
  });
});
