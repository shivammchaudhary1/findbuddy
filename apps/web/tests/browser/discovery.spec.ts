import { test, expect } from "@playwright/test";
test("search, category, fee, and empty states", async ({ page }) => {
  await page.goto("/explore");
  await expect(page.getByRole("status")).toContainText("8 activities");
  await page.getByRole("button", { name: "Coffee", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 activity");
  await expect(page.getByRole("heading", { name: "Riya S." })).toBeVisible();
  await page.getByLabel("Search activities or people").fill("not-a-match");
  await expect(
    page.getByRole("heading", { name: "No services found" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByLabel("Maximum activity fee").selectOption("0");
  await expect(page.getByText("Free activity", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Verified only")).toBeDisabled();
});
test("mobile navigation and filters are operable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Explore", exact: true })
    .click();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(page.getByLabel("Maximum activity fee")).toBeVisible();
  await page.getByLabel("City", { exact: true }).fill("Delhi");
  await expect(
    page.getByRole("heading", { name: "No services found" }),
  ).toBeVisible();
});
