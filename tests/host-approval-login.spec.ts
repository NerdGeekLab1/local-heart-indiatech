import { test, expect } from "../playwright-fixture";

/**
 * End-to-end coverage for the host approval → host login → host dashboard path.
 * Relies on the seeded demo host account whose application is approved.
 */
const HOST_EMAIL = "demo.host@travelista.app";
const PASSWORD = "demo123456";

async function loginAsHost(page: any) {
  await page.goto("/login/host");
  await page.getByLabel(/email/i).first().fill(HOST_EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
}

test("approved host logs in and lands on the host dashboard", async ({ page }) => {
  await loginAsHost(page);
  await page.waitForURL(/\/dashboard\/host/, { timeout: 25_000 });
  expect(page.url()).toContain("/dashboard/host");
  expect(page.url()).not.toContain("/dashboard/traveler");
});

test("approved host onboarding page reports the host role", async ({ page }) => {
  await loginAsHost(page);
  await page.waitForURL(/\/dashboard\/host/, { timeout: 25_000 });

  await page.goto("/host-onboarding");
  await expect(page.getByText(/role assigned to your account/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("assigned-role")).toContainText(/host/i);
});

test("approved host is never redirected to the traveler dashboard", async ({ page }) => {
  await loginAsHost(page);
  await page.waitForURL(/\/dashboard\/host/, { timeout: 25_000 });
  await page.goto("/dashboard/traveler");
  await page.waitForTimeout(2500);
  expect(page.url()).not.toContain("/dashboard/traveler");
});
