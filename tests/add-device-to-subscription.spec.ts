import {
  test,
  expect,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from "@playwright/test";

/**
 * PR #2 — add a device to an EXISTING active subscription (free, within the
 * plan's per-type caps). The dashboard active-subscription card must show an
 * "Ajouter un appareil" button for multi-device plans; the modal must let you
 * pick a covered device type (with remaining-slot counts), use the combined
 * brand+model field for non-phones, upload the per-device verification media,
 * and submit.
 *
 * The dashboard summary + subscription devices + POST + media upload are
 * stubbed so the test is self-contained; /plans and auth hit the real backend
 * so planById resolves the real "totale" plan caps (4/3/2/2/1). Backend caps +
 * coverage enforcement is covered separately by the Go service tests.
 *
 *   SLOW_MO=800 npx playwright test add-device-to-subscription --headed
 */

const PASSWORD = "TestPassword123!";
const BASE_URL = "http://localhost:3001";
// Real SN "totale" plan — covers smartphone(4)/tablet(3)/computer(2)/console(2)/tv(1).
const TOTALE_PLAN_ID = "d4d91039-7050-4557-8aed-0453946e5b84";
const SUB_ID = "11111111-1111-1111-1111-111111111111";
const ORG_ID = "469242c2-df0e-44e4-ad77-0b8e40b61f41";

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

const NOW = "2026-06-06T00:00:00Z";

function primaryPhone() {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    org_id: ORG_ID,
    user_id: "33333333-3333-3333-3333-333333333333",
    device_type: "smartphone",
    brand: "Apple",
    model: "iPhone 15",
    metadata: {},
    imei: "356789012345678",
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

const TOTALE_PLAN = {
  id: TOTALE_PLAN_ID,
  slug: "totale",
  name_fr: "Totale",
  name_en: "Total",
  price_monthly: 15000,
  price_annual: 150000,
  tier: "totale",
  features_fr: [],
  features_en: [],
  not_covered_fr: [],
  not_covered_en: [],
  service_time: "48h",
  is_popular: false,
  sort_order: 5,
  max_smartphones: 4,
  max_tablets: 3,
  max_computers: 2,
  max_game_consoles: 2,
  max_tvs: 1,
  claim_waiting_period_days: 30,
  created_at: NOW,
  updated_at: NOW,
};

async function stubBackend(page: Page) {
  // Plans list — so planById resolves the multi-device "totale" caps.
  await page.route("**/api/v1/plans", (route) =>
    route.fulfill(ok([TOTALE_PLAN])),
  );

  // Member dashboard summary — one active subscription on the multi-device plan.
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
              device_id: primaryPhone().id,
              plan_id: TOTALE_PLAN_ID,
              status: "active",
              billing_cycle: "monthly",
              activated_at: NOW,
              current_period_end: "2026-07-06T00:00:00Z",
              created_at: NOW,
              updated_at: NOW,
            },
            device: primaryPhone(),
          },
        ],
      }),
    ),
  );

  // Devices attached to the subscription + create + media upload.
  await page.route(`**/api/v1/subscriptions/${SUB_ID}/devices`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(
        ok(
          {
            ...primaryPhone(),
            id: "44444444-4444-4444-4444-444444444444",
            device_type: "game_console",
            brand: "",
            model: "PlayStation 5",
            status: "pending",
          },
          201,
        ),
      );
    }
    return route.fulfill(ok([primaryPhone()]));
  });

  await page.route("**/api/v1/devices/verification-media", (route) =>
    route.fulfill(ok({ url: "https://media.test/verif.jpg" })),
  );
}

const FAKE_IMAGE = {
  name: "tv.jpg",
  mimeType: "image/jpeg",
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
};
const FAKE_VIDEO = {
  name: "tv.mp4",
  mimeType: "video/mp4",
  buffer: Buffer.from([0x00, 0x00, 0x00, 0x18]),
};

test("add a covered device to an existing subscription from the dashboard", async ({
  page,
  request,
  context,
}) => {
  test.setTimeout(90_000);
  await registerAndSignIn(request, context, uniqueEmail());
  await stubBackend(page);

  await page.goto("/tableau-de-bord");

  // The active-subscription card shows the primary phone and the new button.
  // Scope to the card so we don't hit the page-level "Ajouter un appareil"
  // link (which navigates to /sn/inscription).
  const card = page
    .locator("div.rounded-xl")
    .filter({ hasText: "Apple iPhone 15" });
  await expect(card.getByText("Apple iPhone 15")).toBeVisible({
    timeout: 20_000,
  });
  await card.getByRole("button", { name: /Ajouter un appareil/i }).click();

  // Modal: device-type chips with remaining counts; pick a non-phone (console).
  const modal = page.locator("div.fixed.inset-0");
  await expect(
    modal.getByRole("heading", { name: /Ajouter un appareil/ }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(modal.getByText(/restant\(s\)/).first()).toBeVisible({
    timeout: 15_000,
  });
  await modal.getByRole("button", { name: /Console de jeux/ }).click();

  // Non-phone uses the single combined brand+model field (no separate Brand).
  await expect(modal.getByText(/Appareil \(marque et modèle\)/)).toBeVisible();
  await modal
    .getByPlaceholder(/PlayStation 5, MacBook Pro/)
    .fill("PlayStation 5");

  // Per-device verification: console = 1 powered-on photo + 1 video.
  const fileInputs = modal.locator('input[type="file"]');
  await expect(fileInputs).toHaveCount(2);
  await fileInputs.nth(0).setInputFiles(FAKE_IMAGE);
  await fileInputs.nth(1).setInputFiles(FAKE_VIDEO);

  // Once both uploads resolve, submit becomes enabled.
  const submit = modal.getByRole("button", { name: /Ajouter l'appareil/ });
  await expect(submit).toBeEnabled({ timeout: 15_000 });
  await submit.click();

  // On success the modal closes.
  await expect(modal).toHaveCount(0, { timeout: 15_000 });
});
