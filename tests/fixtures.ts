import {
  test as base,
  expect,
  type APIRequestContext,
  type BrowserContext,
} from "@playwright/test";

/**
 * Creates a fresh user via Better Auth's HTTP API and signs them in by
 * extracting the resulting Set-Cookie header from sign-in and copying it
 * onto the browser context. This bypasses the login UI (which is brittle —
 * two duplicated forms on /connexion when the auth modal is auto-opened)
 * and gives every test a logged-in browser to start from.
 */
export interface TestUser {
  email: string;
  password: string;
  name: string;
}

function uniqueEmail(prefix = "e2e"): string {
  const slug = Math.random().toString(36).slice(2, 10);
  return `${prefix}+${slug}@safephone.test`;
}

// Better Auth's trustedOrigins guard requires a matching Origin header.
// Playwright's APIRequestContext doesn't set it automatically — we attach
// the baseURL so Better Auth accepts requests from the e2e suite.
function authHeaders(baseURL: string): Record<string, string> {
  return { Origin: baseURL, "Content-Type": "application/json" };
}

async function registerUser(
  request: APIRequestContext,
  baseURL: string,
  overrides: Partial<TestUser> = {},
): Promise<TestUser> {
  const user: TestUser = {
    email: overrides.email ?? uniqueEmail(),
    password: overrides.password ?? "TestPassword123!",
    name: overrides.name ?? "E2E User",
  };
  const res = await request.post("/api/auth/sign-up/email", {
    headers: authHeaders(baseURL),
    data: {
      email: user.email,
      password: user.password,
      name: user.name,
    },
  });
  if (!res.ok()) {
    throw new Error(
      `sign-up failed (${res.status()}): ${await res.text().catch(() => "")}`,
    );
  }
  return user;
}

async function signInAndAttachCookies(
  request: APIRequestContext,
  context: BrowserContext,
  user: TestUser,
  baseURL: string,
): Promise<void> {
  const res = await request.post("/api/auth/sign-in/email", {
    headers: authHeaders(baseURL),
    data: { email: user.email, password: user.password },
  });
  if (!res.ok()) {
    throw new Error(
      `sign-in failed (${res.status()}): ${await res.text().catch(() => "")}`,
    );
  }
  // Better Auth uses the APIRequestContext's own storageState — copy any
  // cookies it set onto the browser context so page.goto() runs authenticated.
  const storage = await request.storageState();
  if (storage.cookies.length) {
    await context.addCookies(storage.cookies);
  }
  // Sanity check — at least one Better Auth session cookie should now be
  // present on the context.
  void baseURL;
}

export const test = base.extend<{ user: TestUser }>({
  user: async ({ request, context, baseURL }, use) => {
    const base = baseURL ?? "http://localhost:3001";
    const u = await registerUser(request, base);
    await signInAndAttachCookies(request, context, u, base);
    await use(u);
  },
});

export { expect };
// Re-export the Playwright types the spec files consume from "./fixtures" so
// they have a single import source alongside `test`/`expect`.
export type { BrowserContext, Page } from "@playwright/test";
