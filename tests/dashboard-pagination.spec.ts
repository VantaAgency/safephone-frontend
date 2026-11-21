import { test, expect } from "./fixtures";

test("the member can navigate a repair history with a full last page", async ({
  page,
  context,
  user,
}) => {
  await context.addCookies([{ name: "sp_market", value: "SN", domain: "localhost", path: "/" }]);
  const repairs = Array.from({ length: 40 }, (_, index) => ({
    id: String(index),
    reference: `PAGE-${index + 1}`,
    device_brand: "Apple",
    device_model: "iPhone 13",
    repair_type: "screen",
    status: "pending",
    service_mode: "home",
    preferred_date: "2026-12-01",
    preferred_time: "10:00",
    customer_name: user.name,
    market: "SN",
  }));

  await page.route("**/api/v1/repairs/mine?*", async (route) => {
    const params = new URL(route.request().url()).searchParams;
    const offset = Number(params.get("offset"));
    const limit = Number(params.get("limit"));
    await route.fulfill({ json: { data: repairs.slice(offset, offset + limit) } });
  });

  await page.goto("/tableau-de-bord");
  await page.getByRole("button", { name: /^Mes réparations$|^My repairs$/i }).click();

  const pagination = page.getByRole("navigation", { name: "Pagination" });
  const next = pagination.getByRole("button", { name: /Suivant|Next/i });
  const previous = pagination.getByRole("button", { name: /Précédent|Previous/i });
  await expect(page.getByText("PAGE-1", { exact: true })).toBeVisible();
  await expect(page.getByText("PAGE-21", { exact: true })).toHaveCount(0);
  await expect(previous).toBeDisabled();

  await next.click();
  await expect(page.getByText("PAGE-40", { exact: true })).toBeVisible();
  await expect(page.getByText("PAGE-1", { exact: true })).toHaveCount(0);
  await expect(next).toBeDisabled();

  await previous.click();
  await expect(page.getByText("PAGE-1", { exact: true })).toBeVisible();
  await expect(page.getByText("PAGE-21", { exact: true })).toHaveCount(0);
});
