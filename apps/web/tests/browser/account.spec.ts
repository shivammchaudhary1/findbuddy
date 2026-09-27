import { test, expect } from "@playwright/test";
test("profile edits reach the public profile and reset on reload", async ({
  page,
}) => {
  await page.goto("/profile");
  await page.getByLabel("Name", { exact: true }).fill("Arjun Preview");
  await page.getByRole("button", { name: "Save profile preview" }).click();
  await page.getByRole("link", { name: "Public profile" }).click();
  await expect(page).toHaveURL(/\/buddies\/arjun$/);
  await expect(
    page.getByRole("heading", { name: "Arjun Preview", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Arjun Mehta", exact: true }),
  ).toBeVisible();
});
test("service pricing enforces Free limits and newly created detail works", async ({
  page,
}) => {
  await page.goto("/profile/services");
  await page.getByRole("button", { name: "Add activity" }).click();
  await page.getByLabel("Activity title").fill("Weekend board games");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Play a relaxed round of board games at a public cafe.");
  await page.getByLabel("Activity fee").fill("501");
  await page.getByLabel("Meeting area").fill("Bandra cafe");
  await page.getByLabel("From (India)").fill("10:00");
  await page.getByLabel("Until (India)").fill("12:00");
  await page.getByRole("button", { name: "Save activity preview" }).click();
  await expect(page.getByRole("status")).toContainText("500");
  await page.getByLabel("Activity fee").fill("300");
  await page.getByRole("button", { name: "Save activity preview" }).click();
  await page
    .getByRole("article")
    .filter({ hasText: "Weekend board games" })
    .getByRole("link", { name: "View activity" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Weekend board games" }),
  ).toBeVisible();
});
test("subscription and auth are explicit about unavailable integrations", async ({
  page,
}) => {
  await page.goto("/profile");
  await page.getByRole("link", { name: "Subscription", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Upgrade unavailable in preview" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("main").getByText("Free member", { exact: true }),
  ).toBeVisible();
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password", { exact: true }).fill("preview123");
  await page
    .getByRole("button", { name: "Preview sign in", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("not connected");
});
