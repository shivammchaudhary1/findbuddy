import { test, expect } from "@playwright/test";
test("home to discovery, buddy and activity", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("main")
    .getByRole("link", { name: "Find a buddy", exact: true })
    .click();
  await expect(page).toHaveURL(/\/explore$/);
  await page
    .getByRole("link", { name: "View Riya S.'s profile", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/buddies\/riya$/);
  await page
    .getByRole("link", { name: "View activity", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/services\/coffee-riya$/);
  await expect(page).toHaveTitle("Activity details | FindBuddy");
});
test("home to plans and host decision", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("main")
    .getByRole("link", { name: "Explore plans", exact: true })
    .click();
  await expect(page).toHaveURL(/\/plans$/);
  await page
    .getByRole("link", { name: "View plan", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Who's coming" }),
  ).toBeVisible();
  await page.goto("/plans/sunday-football");
  await page.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Request updated");
  await expect(
    page.getByRole("button", { name: "Accept", exact: true }),
  ).toHaveCount(0);
});
test("small mobile and wide desktop fit the viewport", async ({ page }) => {
  for (const width of [320, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/explore",
      "/profile/subscription",
      "/messages/chat-riya",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
