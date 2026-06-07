import {
  test,
  expect,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from "@playwright/test";

/**
 * Add a device to an EXISTING active subscription (free, within the plan's
 * per-type caps), from the dashboard.
 *
 * Scenario mirrors a reported case: the plan covers several device types but
 * the PRIMARY (originally-paid) device is a computer, and the plan covers only
 * 1 computer. The user must still be able to add the OTHER covered types
 * (smartphone, tablet, console) to the same subscription — and the computer
 * slot must show as full (the primary device is counted).
 *
 * The dashboard header must expose an explicit "Ajouter un appareil" button
 * (distinct from "Prendre un nouveau forfait", which starts a brand-new plan).
 *
 * Backend (summary, devices, plans, POST, upload) is stubbed so the test is
 * self-contained; auth hits the real backend. Cap/coverage enforcement is
 * covered separately by the Go service tests.
 *
 *   SLOW_MO=800 npx playwright test add-device-to-subscription --headed
 */

const PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";
const PLAN_ID = "a1111111-1111-1111-1111-111111111111";
const SUB_ID = "11111111-1111-1111-1111-111111111111";
const ORG_ID = "469242c2-df0e-44e4-ad77-0b8e40b61f41";
const NOW = "2026-06-06T00:00:00Z";

function uniqueEmail() {
  return `member+${Math.random().toString(36).slice(2, 10)}@safephone.test`;
}

async function registerAndSignIn(
  request: APIRequestContext,
  context: BrowserContext,
  email: string,
) {
  const headers = { Origin: BASE_URL, "Content-Type": "application/json" };
  const up = await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
    headers,
    data: { email, password: PASSWORD, name: "E2E Member" },
  });
  if (!up.ok()) throw new Error(`sign-up failed (${up.status()})`);
  const si = await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers,
    data: { email, password: PASSWORD },
  });
  if (!si.ok()) throw new Error(`sign-in failed (${si.status()})`);
  await context.addCookies((await request.storageState()).cookies);
}

// Primary device = a computer (no brand; full name in model), already filling
// the plan's single computer slot.
function primaryComputer() {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    org_id: ORG_ID,
    user_id: "33333333-3333-3333-3333-333333333333",
    device_type: "computer",
    brand: "",
    model: "Apple MacBook Air m2",
    metadata: {},
    imei: "",
    status: "active",
    created_at: NOW,
    updated_at: NOW,
  };
}

// The API client unwraps `body.data`, so every stub wraps its payload.
function ok(data: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  };
}

// "haute"-like plan: 3 smartphones / 2 tablets / 1 computer / 1 console / 0 tv.
const PLAN = {
  id: PLAN_ID,
  slug: "haute",
  name_fr: "Haute",
  name_en: "High",
  price_monthly: 10000,
  price_annual: 100000,
  tier: "haute",
  features_fr: [],
  features_en: [],
  not_covered_fr: [],
  not_covered_en: [],
  service_time: "48h",
  is_popular: false,
  sort_order: 4,
  max_smartphones: 3,
  max_tablets: 2,
  max_computers: 1,
  max_game_consoles: 1,
  max_tvs: 0,
  claim_waiting_period_days: 30,
  created_at: NOW,
  updated_at: NOW,
};

async function stubBackend(page: Page) {
  await page.route("**/api/v1/plans", (route) => route.fulfill(ok([PLAN])));

  await page.route("**/api/v1/dashboard/summary", (route) =>
    route.fulfill(
      ok({
        active_subscriptions_count: 1,
        devices_count: 1,
        claims_count: 0,
        payments_count: 1,
        pending_activation_devices: [],
        recent_devices: [],
        recent_claims: [],
        recent_payments: [],
        active_subscriptions: [
          {
            subscription: {
              id: SUB_ID,
              org_id: ORG_ID,
              user_id: "33333333-3333-3333-3333-333333333333",
              device_id: primaryComputer().id,
              plan_id: PLAN_ID,
              status: "active",
              billing_cycle: "monthly",
              activated_at: NOW,
              current_period_end: "2026-07-06T00:00:00Z",
              created_at: NOW,
              updated_at: NOW,
            },
            device: primaryComputer(),
          },
        ],
      }),
    ),
  );

  // Devices attached to the subscription (the primary computer counts) + create.
  await page.route(`**/api/v1/subscriptions/${SUB_ID}/devices`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(
        ok(
          {
            ...primaryComputer(),
            id: "44444444-4444-4444-4444-444444444444",
            device_type: "smartphone",
            brand: "Samsung",
            model: "Galaxy S24",
            status: "pending",
          },
          201,
        ),
      );
    }
    return route.fulfill(ok([primaryComputer()]));
  });

  await page.route("**/api/v1/devices/verification-media", (route) =>
    route.fulfill(ok({ url: "https://media.test/verif.jpg" })),
  );
}

const FAKE_IMAGE = {
  name: "front.jpg",
  mimeType: "image/jpeg",
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
};
const FAKE_VIDEO = {
  name: "clip.mp4",
  mimeType: "video/mp4",
  buffer: Buffer.from([0x00, 0x00, 0x00, 0x18]),
};

test("add a non-computer device to a subscription whose computer slot is full", async ({
  page,
  request,
  context,
}) => {
  test.setTimeout(90_000);
  await registerAndSignIn(request, context, uniqueEmail());
  await stubBackend(page);

  await page.goto("/tableau-de-bord");

  // Header exposes BOTH a "new plan" action and an explicit "add device" one.
  await expect(
    page.getByRole("button", { name: /Prendre un nouveau forfait/i }).first(),
  ).toBeVisible({ timeout: 20_000 });
  const headerAdd = page
    .getByRole("button", { name: "Ajouter un appareil", exact: true })
    .first();
  await expect(headerAdd).toBeVisible({ timeout: 15_000 });
  await headerAdd.click();

  const modal = page.locator("div.fixed.inset-0");
  await expect(
    modal.getByRole("heading", { name: /Ajouter un appareil/ }),
  ).toBeVisible({ timeout: 15_000 });

  // The computer slot is full (primary device) → not offered; other covered
  // types are. Smartphone shows its remaining count.
  await expect(modal.getByRole("button", { name: /Ordinateur/ })).toHaveCount(0);
  const smartphoneChip = modal.getByRole("button", { name: /Smartphone/ });
  await expect(smartphoneChip).toBeVisible({ timeout: 15_000 });
  await expect(modal.getByText(/3 restant\(s\)/)).toBeVisible();
  await smartphoneChip.click();

  // Smartphone keeps the separate brand field + 2 verification photos.
  await modal.getByPlaceholder(/Apple, Samsung/).fill("Samsung");
  await modal.getByPlaceholder(/iPhone 15/).fill("Galaxy S24");

  const fileInputs = modal.locator('input[type="file"]');
  await expect(fileInputs).toHaveCount(3); // 2 photos + 1 video
  await fileInputs.nth(0).setInputFiles(FAKE_IMAGE);
  await fileInputs.nth(1).setInputFiles(FAKE_IMAGE);
  await fileInputs.nth(2).setInputFiles(FAKE_VIDEO);

  const submit = modal.getByRole("button", { name: /Ajouter l'appareil/ });
  await expect(submit).toBeEnabled({ timeout: 15_000 });
  await submit.click();

  await expect(modal).toHaveCount(0, { timeout: 15_000 });
});
