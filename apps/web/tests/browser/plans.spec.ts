import { test, expect } from "@playwright/test";
test("join request is local and duplicate requests are disabled", async ({
  page,
}) => {
  await page.goto("/plans/movie-night");
  await page.getByRole("button", { name: "Join plan", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("preview");
  await expect(
    page.getByRole("button", { name: "Request pending" }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Join plan", exact: true }),
  ).toBeEnabled();
});
test("create plan validates and navigates to session record", async ({
  page,
}) => {
  await page.goto("/plans/create");
  await page.getByLabel("Plan title").fill("Weekend board game meetup");
  await page
    .getByLabel("Description")
    .fill("A friendly afternoon at a public café.");
  await page.getByLabel("Date", { exact: true }).fill("2027-01-02");
  await page.getByLabel("Time (India)").fill("15:00");
  await page.getByLabel("Meeting location").fill("Bandra café");
  await page.getByRole("button", { name: "Create plan", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Weekend board game meetup" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "You're hosting" }),
  ).toBeDisabled();
});
