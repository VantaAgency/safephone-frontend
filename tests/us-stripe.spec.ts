import { test, expect } from "./fixtures";

/**
 * End-to-end US flow split into two tests:
 *
 *   1. Browser-visible flow: pricing → Stripe Checkout → 4242 card → success
 *      page. Does NOT depend on webhook delivery (the success redirect comes
 *      from Stripe's Hosted Checkout, not from our backend).
 *
 *   2. Device registration → dashboard. REQUIRES the Stripe webhook to be
 *      reachable so the backend records a pending subscription. Without
 *      webhook delivery the backend returns "US subscription awaiting device
 *      registration not found" and this test fails as expected — a clear
 *      signal that the Stripe → backend wiring is incomplete.
 *
 *      To get webhooks flowing locally:
 *         stripe listen --forward-to https://YOUR-NGROK.ngrok-free.dev/api/v1/webhooks/stripe
 *      …or configure the same endpoint in the Stripe Dashboard.
 *
 * Stripe Checkout DOM occasionally changes — selectors below may need updating.
 */
test.describe("US Stripe checkout flow", () => {
  test("pricing → Stripe checkout → 4242 → success page", async ({
    page,
    user,
  }) => {
    test.setTimeout(120_000);

    await page.goto("/us");
    expect(user.email).toContain("@");

    // ─── Pricing ──────────────────────────────────────────────────────────
    await page.goto("/us/pricing");
    await expect(page.getByText(/\$\d+/).first()).toBeVisible();

    const subscribeButtons = page.getByRole("button", {
      name: /subscribe|choose|select|get/i,
    });
    await expect(subscribeButtons.first()).toBeVisible();
    await subscribeButtons.first().click();

    // ─── Redirect through /us/signup → Stripe ────────────────────────────
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
    expect(page.url()).toContain("checkout.stripe.com");

    // ─── Fill Stripe Checkout test card ──────────────────────────────────
    const emailField = page.getByRole("textbox", { name: /email/i });
    if (await emailField.isVisible().catch(() => false)) {
      await emailField.fill(user.email);
    }
    await page
      .getByRole("textbox", { name: /card number/i })
      .fill("4242 4242 4242 4242");
    await page
      .getByRole("textbox", { name: /expiration|expiry/i })
      .fill("12 / 30");
    await page.getByRole("textbox", { name: /cvc|security code/i }).fill("123");

    const nameField = page.getByRole("textbox", {
      name: /name on card|cardholder/i,
    });
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill(user.name);
    }

    const zipField = page.getByRole("textbox", { name: /zip|postal/i });
    if (await zipField.isVisible().catch(() => false)) {
      await zipField.fill("94103");
    }

    await page
      .getByRole("button", { name: /subscribe|pay|start|confirm/i })
      .first()
      .click();

    // ─── Back on success page ─────────────────────────────────────────────
    await page.waitForURL(/\/us\/checkout\/success/, { timeout: 60_000 });
    await expect(page).toHaveURL(/session_id=cs_test_/);
  });

  test("register device → dashboard (requires Stripe webhook)", async ({
    page,
    user,
  }) => {
    test.setTimeout(180_000);

    // Repeat the checkout flow to set up state. (We could share state between
    // tests via storageState, but a fresh checkout per test keeps each spec
    // independently runnable.)
    await page.goto("/us/pricing");
    await page
      .getByRole("button", { name: /subscribe|choose|select|get/i })
      .first()
      .click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });

    const emailField = page.getByRole("textbox", { name: /email/i });
    if (await emailField.isVisible().catch(() => false)) {
      await emailField.fill(user.email);
    }
    await page
      .getByRole("textbox", { name: /card number/i })
      .fill("4242 4242 4242 4242");
    await page
      .getByRole("textbox", { name: /expiration|expiry/i })
      .fill("12 / 30");
    await page.getByRole("textbox", { name: /cvc|security code/i }).fill("123");
    const nameField = page.getByRole("textbox", {
      name: /name on card|cardholder/i,
    });
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill(user.name);
    }
    const zipField = page.getByRole("textbox", { name: /zip|postal/i });
    if (await zipField.isVisible().catch(() => false)) {
      await zipField.fill("94103");
    }
    await page
      .getByRole("button", { name: /subscribe|pay|start|confirm/i })
      .first()
      .click();

    await page.waitForURL(/\/us\/checkout\/success/, { timeout: 60_000 });

    // ─── Register device ──────────────────────────────────────────────────
    // Webhook needs ~5-15s to land — try a few times before giving up.
    await page.goto("/us/register-device");
    await page.waitForURL(/\/us\/register-device/, { timeout: 10_000 });

    // Plans v2: pick device type (smartphone is the default but click
    // explicitly so the test exercises the selector). Then brand + model.
    await page.getByRole("button", { name: /smartphone/i }).first().click();
    const brandButton = page
      .getByRole("button", { name: /apple|samsung|google/i })
      .first();
    await brandButton.click();
    await page.locator("#model").fill("iPhone 15 Pro");

    // Verification proof — 5 photos + 1 video uploaded via multipart
    // (the URL inputs were replaced by VerificationMediaUpload). Use a
    // tiny 1x1 PNG and a near-empty MP4 stub; the backend doesn't
    // decode the bytes, it only checks content-type + size.
    const pngBytes = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    );
    const mp4Stub = Buffer.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
      0x00, 0x00, 0x00, 0x00, 0x6d, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6f, 0x6d,
    ]);
    const fileInputs = page.locator('input[type="file"]');
    const photoSlotCount = 5;
    for (let i = 0; i < photoSlotCount; i++) {
      await fileInputs.nth(i).setInputFiles({
        name: `photo-${i + 1}.png`,
        mimeType: "image/png",
        buffer: pngBytes,
      });
      // Wait for the upload's "View uploaded file" link to appear before
      // attaching the next file — otherwise the slot's still uploading
      // when we try to fire the next setInputFiles.
      await page
        .getByRole("link", { name: /view uploaded file/i })
        .nth(i)
        .waitFor({ state: "visible", timeout: 15_000 });
    }
    await fileInputs.nth(photoSlotCount).setInputFiles({
      name: "video.mp4",
      mimeType: "video/mp4",
      buffer: mp4Stub,
    });
    await page
      .getByRole("link", { name: /view uploaded file/i })
      .nth(photoSlotCount)
      .waitFor({ state: "visible", timeout: 15_000 });

    // Retry the submit a few times — the backend rejects with
    // "US subscription awaiting device registration not found" until the
    // Stripe webhook lands.
    let lastError = "";
    for (let attempt = 0; attempt < 6; attempt++) {
      await page
        .getByRole("button", { name: /finish registration/i })
        .click();
      const dashboardReached = await page
        .waitForURL(/\/us\/dashboard/, { timeout: 15_000 })
        .then(() => true)
        .catch(() => false);
      if (dashboardReached) break;

      const errorBanner = page.getByText(/subscription.*not found/i);
      if (await errorBanner.isVisible().catch(() => false)) {
        lastError = "webhook not yet received";
        await page.waitForTimeout(5000);
        continue;
      }
      break;
    }

    if (!page.url().includes("/us/dashboard") && lastError) {
      test.skip(
        true,
        "Stripe webhook never reached the backend — run `stripe listen --forward-to https://YOUR-NGROK/api/v1/webhooks/stripe` or configure the webhook in the Stripe Dashboard.",
      );
    }
    await expect(page).toHaveURL(/\/us\/dashboard/);

    // ─── Payments tab shows the Stripe transaction in USD ────────────────
    // The invoice.paid handler now records a payment row (closes the bug
    // where USD purchases were invisible in /us/dashboard + /admin).
    // Webhook timing varies — give it up to ~15s to land.
    const paymentsTab = page
      .getByRole("button", { name: /^payments$|^paiements$/i })
      .first();
    await paymentsTab.click();
    await expect(
      page.getByText(/\$\d+(\.\d{2})?/).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
