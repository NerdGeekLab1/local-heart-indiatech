import { expect, test } from "../playwright-fixture";

const HOST_EMAIL = "demo.host@travelista.app";
const PASSWORD = "demo123456";

test("host dashboard circuit breaker stops and Try again recovers", async ({ page }) => {
  await page.goto("/login/host");
  await page.getByLabel(/email/i).first().fill(HOST_EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
  await page.waitForURL(/\/dashboard\/host/, { timeout: 25_000 });

  let failDashboard = true;
  let failures = 0;
  await page.route("**/rest/v1/**", async route => {
    const url = route.request().url();
    if (failDashboard && /\/(bookings|invoices|profiles|experiences|reviews|messages|host_)/.test(url)) {
      failures += 1;
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Injected dashboard outage" }) });
      return;
    }
    await route.continue();
  });

  await page.reload();
  await expect(page.getByTestId("host-dashboard-error")).toBeVisible({ timeout: 20_000 });
  const stoppedAt = failures;
  await page.waitForTimeout(3_000);
  expect(failures).toBe(stoppedAt);

  failDashboard = false;
  await page.getByTestId("host-dashboard-retry").click();
  await expect(page.getByTestId("host-dashboard-error")).toHaveCount(0, { timeout: 20_000 });
  await expect(page.getByText(/Total Bookings/i)).toBeVisible();
});