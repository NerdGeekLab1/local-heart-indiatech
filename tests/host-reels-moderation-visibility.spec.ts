import { test, expect } from "../playwright-fixture";

const ADMIN_EMAIL = "demo.admin@travelista.app";
const PASSWORD = "demo123456";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

async function publicHostWithReels() {
  const directory = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_host_directory`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: "{}",
  });
  const hosts = (await directory.json()) as any[];
  for (const host of hosts ?? []) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_host`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ _identifier: host.username || host.id }),
    });
    const data = (await response.json()) as any;
    if ((data?.reels ?? []).length) return { host, reels: data.reels as any[] };
  }
  return null;
}

async function adminLogin(page: any) {
  await page.goto("/admin-login");
  await page.getByLabel(/email/i).first().fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
  await page.waitForURL(/\/dashboard\/admin|\/admin/, { timeout: 30_000 });
}

test("reels approval and rejection control what the public host preview shows", async ({ page, context }) => {
  const found = await publicHostWithReels();
  test.skip(!found, "No approved public host with reels available to moderate.");
  const { host, reels } = found!;
  const target = reels[0];
  const publicPath = `/host/${host.username || host.id}`;
  const note = `E2E review note ${Date.now()}`;

  // Baseline: the approved reel is visible on the public page.
  await page.goto(publicPath);
  const reelsSection = page.getByTestId("host-reels");
  await expect(reelsSection).toBeVisible({ timeout: 20_000 });
  await expect(reelsSection.locator(`[data-reel-id="${target.id}"], figure`).first()).toBeVisible();
  const approvedCount = await reelsSection.locator("figure").count();
  expect(approvedCount).toBeGreaterThan(0);

  // Admin rejects the reel with a reviewer note.
  const admin = await context.newPage();
  await adminLogin(admin);
  await admin.goto("/dashboard/admin?tab=reels");
  const panel = admin.getByRole("heading", { name: /reels & stories moderation/i });
  await expect(panel).toBeVisible({ timeout: 30_000 });
  await admin.getByRole("button", { name: /^approved$/i }).click();
  const card = admin.locator("div").filter({ hasText: /approved/i }).first();
  await expect(card).toBeVisible({ timeout: 20_000 });
  await admin.getByPlaceholder(/reviewer note/i).first().fill(note);
  await admin.getByRole("button", { name: /^reject$/i }).first().click();
  await expect(admin.getByText(/reel rejected/i).first()).toBeVisible({ timeout: 20_000 });
  // The reviewer note is persisted and shown back to the admin.
  await admin.getByRole("button", { name: /^rejected$/i }).click();
  await expect(admin.getByText(note).first()).toBeVisible({ timeout: 20_000 });

  // Public page must now show fewer reels (the rejected one is hidden).
  await page.reload();
  await expect(reelsSection).toBeVisible({ timeout: 20_000 });
  await expect
    .poll(async () => reelsSection.locator("figure").count(), { timeout: 25_000 })
    .toBeLessThan(approvedCount);
  await expect(page.getByText(note)).toHaveCount(0);

  // Re-approving restores public visibility.
  await admin.getByRole("button", { name: /^rejected$/i }).click();
  await admin.getByRole("button", { name: /^approve$/i }).first().click();
  await expect(admin.getByText(/reel approved/i).first()).toBeVisible({ timeout: 20_000 });

  await page.reload();
  await expect
    .poll(async () => reelsSection.locator("figure").count(), { timeout: 25_000 })
    .toBe(approvedCount);
  await admin.close();
});
