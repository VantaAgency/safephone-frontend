import { defineConfig, devices } from "@playwright/test";

// Override with `E2E_BASE_URL=https://mari-...ngrok-free.dev npm run test:e2e`
// when you want to exercise the tunneled path (DEXPAY/Stripe webhooks). Default
// localhost works for smoke + UI tests; Better Auth accepts both via TRUSTED_ORIGINS.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3001";
// SLOW_MO=5000 npx playwright test --headed → 5s between each action so the
// run is observable. When set, action / navigation / test timeouts are
// scaled up so the slow-mo delays don't trip them.
const slowMo = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO, 10) : 0;
const slowMoScale = slowMo > 0 ? 6 : 1;

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000 * slowMoScale,
  expect: { timeout: 10_000 * slowMoScale },
  fullyParallel: false, // shared DB state, run serial to avoid cross-test leaks
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    actionTimeout: 10_000 * slowMoScale,
    navigationTimeout: 15_000 * slowMoScale,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
    launchOptions: slowMo > 0 ? { slowMo } : {},
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
