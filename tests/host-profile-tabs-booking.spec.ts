import { test, expect } from "@playwright/test";

/**
 * Verifies the restored HostProfile tab layout renders live database data and that
 * "Book now" carries the correct host through to the Booking page.
 */
test.describe("Host public profile tabs and booking hand-off", () => {
  test("tabs render live host data and Book now loads the same host", async ({ page }) => {
    await page.goto("/explore");

    const firstHost = page.locator('a[href^="/host/"]').first();
    if (!(await firstHost.count())) {
      test.skip(true, "No approved hosts published yet");
      return;
    }
    await firstHost.click();

    // Tab bar must exist with every restored section.
    const tabs = page.getByTestId("host-tabs");
    await expect(tabs).toBeVisible();
    for (const label of ["Overview", "Stay", "Transport", "Food", "Experiences", "Reviews"]) {
      await expect(tabs.getByRole("tab", { name: new RegExp(label) })).toBeVisible();
    }

    const hostName = (await page.locator("h1").first().textContent())?.trim() || "";
    expect(hostName.length).toBeGreaterThan(0);

    // Every tab is clickable and renders a section heading (live data or a real empty state).
    for (const label of ["Stay", "Transport", "Food", "Experiences", "Reviews"]) {
      await tabs.getByRole("tab", { name: new RegExp(label) }).click();
      await expect(page.locator("h2").first()).toBeVisible();
    }

    await tabs.getByRole("tab", { name: /Overview/ }).click();
    await expect(page.getByText(new RegExp(`About ${hostName.split(" ")[0]}`, "i"))).toBeVisible();

    // Book now must resolve the same host, not the "Host not found" fallback.
    await page.getByRole("link", { name: /Book now/i }).click();
    await expect(page).toHaveURL(/\/book\//);
    await expect(page.getByText(/Host not found/i)).toHaveCount(0);
    await expect(page.getByText(hostName.split(" ")[0], { exact: false }).first()).toBeVisible();
  });
});
