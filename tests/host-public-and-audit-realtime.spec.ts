import { test, expect } from "../playwright-fixture";

const ADMIN_EMAIL = "demo.admin@travelista.app";
const PASSWORD = "demo123456";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

async function firstPublicHost() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_host_directory`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: "{}",
  });
  const hosts = (await response.json()) as any[];
  return hosts?.[0] ?? null;
}

test("public host preview link loads the approved host with live data", async ({ page }) => {
  const host = await firstPublicHost();
  test.skip(!host, "No approved public host in the directory yet.");

  await page.goto(`/host/${host.username || host.id}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(host.full_name, { timeout: 20_000 });
  if (host.city) await expect(page.getByText(host.city, { exact: false }).first()).toBeVisible();
  for (const service of (host.services ?? []).slice(0, 2)) {
    await expect(page.getByText(service, { exact: false }).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: /reels & stories/i })).toBeVisible();
  // No demo placeholders should leak into the public page.
  await expect(page.getByText(/Ravi's Heritage Haveli/i)).toHaveCount(0);
});

test("admin audit timeline receives new entries in realtime", async ({ page, context }) => {
  await page.goto("/login/host");
  await page.goto("/admin-login");
  await page.getByLabel(/email/i).first().fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
  await page.waitForURL(/\/dashboard\/admin|\/admin/, { timeout: 30_000 });

  await page.goto("/admin/audit-log");
  const rows = page.getByTestId("audit-rows").locator("tr");
  await expect(rows.first()).toBeVisible({ timeout: 20_000 });
  const before = await rows.count();

  // Toggling a feature flag writes an audit entry through a database trigger.
  const flagsPage = await context.newPage();
  await flagsPage.goto("/admin/feature-flags");
  const toggle = flagsPage.getByRole("switch").first();
  await expect(toggle).toBeVisible({ timeout: 20_000 });
  await toggle.click();

  await expect.poll(() => rows.count(), { timeout: 25_000 }).toBeGreaterThan(before);
  await toggle.click();
  await flagsPage.close();
});
