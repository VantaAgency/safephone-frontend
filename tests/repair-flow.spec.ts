import { test, expect, type BrowserContext } from "@playwright/test";

/**
 * MobiTech repair flow: a repair is booked (the public /reparations booking,
 * here created via the API to keep the long booking form out of scope), then an
 * ADMIN accepts it from the Réparations tab.
 *
 * Admin: emp-flow-admin@safephone.test.
 *
 *   SLOW_MO=1500 npx playwright test repair-flow --headed
 */

const BASE = "http://localhost:3001";
const PASSWORD = "TestPassword123!";
const ts = Date.now();
const customerName = `Repair Customer ${ts}`;

async function signInContext(ctx: BrowserContext, email: string) {
  const headers = { Origin: BASE, "Content-Type": "application/json" };
  await ctx.request.post(`${BASE}/api/auth/sign-in/email`, { headers, data: { email, password: PASSWORD } });
  await ctx.addCookies((await ctx.request.storageState()).cookies);
  await ctx.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);
}

test("a booked repair is accepted by an admin", async ({ context, browser }) => {
  test.setTimeout(120_000);

  // ── A repair is booked (MobiTech) ────────────────────────────────────────
  const res = await context.request.post(`${BASE}/api/v1/repairs`, {
    headers: { Origin: BASE, "Content-Type": "application/json" },
    data: {
      device_brand: "Apple",
      device_model: "iPhone 15",
      repair_type: "screen",
      service_mode: "center",
      center_id: "colobane",
      preferred_date: "2026-06-25",
      preferred_time: "10:00",
      customer_name: customerName,
      customer_phone: "+221771234567",
    },
  });
  expect(res.status()).toBe(201);
  const booking = (await res.json()).data as { reference: string; id: string };
  const reference = booking.reference;

  // ── Admin accepts it from the Réparations tab ────────────────────────────
  const adminCtx = await browser.newContext();
  await signInContext(adminCtx, "emp-flow-admin@safephone.test");
  const admin = await adminCtx.newPage();
  await admin.goto("/admin");
  await admin.getByRole("button", { name: /^Réparations$|^Repairs$/i }).first().click();

  // Find the search box and filter to this booking's reference, then accept it.
  await admin.getByPlaceholder(/Référence|Reference/i).first().fill(reference);
  const card = admin
    .locator("div")
    .filter({ has: admin.getByText(reference) })
    .filter({ has: admin.getByRole("button", { name: /Accepter|Accept/i }) })
    .last();
  await expect(card).toBeVisible({ timeout: 20_000 });
  await card.getByRole("button", { name: /^Accepter$|^Accept$/i }).click();
  // The pending "Accepter" button disappears once the repair is accepted.
  await expect(card.getByRole("button", { name: /^Accepter$|^Accept$/i })).toHaveCount(0, { timeout: 15_000 });

  // Authoritative: the booking is now "accepted".
  const adminToken = (await (await adminCtx.request.get(`${BASE}/api/auth/token`)).json()).token as string;
  const check = await adminCtx.request.get(`${BASE}/api/v1/admin/repairs/${booking.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect((await check.json()).data.status).toBe("accepted");
  await adminCtx.close();
  console.log(`\n  ✅ Repair ${reference} booked and accepted by the admin\n`);
});
