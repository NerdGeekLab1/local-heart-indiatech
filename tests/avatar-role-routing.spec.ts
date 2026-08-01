import { test, expect } from "../playwright-fixture";

/**
 * End-to-end coverage for role-aware login routing and profile-picture uploads.
 * Uses the seeded demo accounts (see supabase/functions/create-demo-accounts).
 */
const ACCOUNTS = [
  { role: "traveler", email: "demo.traveler@travelista.app", dashboard: "/dashboard/traveler", forbidden: "/dashboard/host" },
  { role: "host", email: "demo.host@travelista.app", dashboard: "/dashboard/host", forbidden: "/dashboard/traveler" },
] as const;

const PASSWORD = "demo123456";

async function login(page: any, portal: "traveler" | "host", email: string) {
  await page.goto(`/login/${portal}`);
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
}

for (const account of ACCOUNTS) {
  test(`${account.role} login lands on its own dashboard`, async ({ page }) => {
    await login(page, account.role, account.email);
    await page.waitForURL(new RegExp(account.dashboard), { timeout: 20_000 });
    expect(page.url()).toContain(account.dashboard);
    expect(page.url()).not.toContain(account.forbidden);
  });

  test(`${account.role} cannot open the other role's dashboard`, async ({ page }) => {
    await login(page, account.role, account.email);
    await page.waitForURL(new RegExp(account.dashboard), { timeout: 20_000 });
    await page.goto(account.forbidden);
    await page.waitForTimeout(2500);
    expect(page.url()).not.toContain(account.forbidden);
  });

  test(`${account.role} avatar upload succeeds with crop + compression`, async ({ page }) => {
    const uploadLogs: string[] = [];
    page.on("console", (msg: any) => {
      if (msg.text().includes("[ImageUpload]")) uploadLogs.push(msg.text());
    });

    await login(page, account.role, account.email);
    await page.waitForURL(new RegExp(account.dashboard), { timeout: 20_000 });
    await page.goto(`${account.dashboard}?tab=settings`);

    // 2x2 red PNG fixture generated inline so no binary asset is needed.
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR4nGP8z8DAwMDAxIAKUPkYCgB1IQL1t0oXPQAAAABJRU5ErkJggg==",
      "base64",
    );
    await page.locator('input[type="file"]').first().setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: png,
    });

    // Cropper appears for avatars — accept the default framing.
    const usePhoto = page.getByRole("button", { name: /use photo/i });
    if (await usePhoto.count()) await usePhoto.first().click();

    await expect(page.getByText(/image uploaded/i)).toBeVisible({ timeout: 30_000 });
    expect(uploadLogs.some((l) => l.includes("upload complete"))).toBeTruthy();
  });
}
