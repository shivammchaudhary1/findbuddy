import { test, expect } from "@playwright/test";
test("profile separates service fees and request validates availability", async ({
  page,
}) => {
  await page.goto("/buddies/riya");
  await expect(
    page.getByRole("heading", { name: "Riya S.", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Trust Score", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "View activity" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Coffee & a good conversation" }),
  ).toBeVisible();
  await page.getByLabel("Date", { exact: true }).fill("2020-01-01");
  await page.getByLabel("Time (India)").fill("10:00");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Choose a future" }),
  ).toContainText("future");
  await page.getByLabel("Date", { exact: true }).fill("2027-01-02");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Request added to this preview",
  );
});
test("own service cannot be booked and unknown profile is unavailable", async ({
  page,
}) => {
  await page.goto("/services/gym-arjun");
  await expect(
    page.getByRole("button", { name: "This is your activity" }),
  ).toBeDisabled();
  await page.goto("/buddies/missing");
  await expect(
    page.getByRole("heading", { name: "This page wandered off" }),
  ).toBeVisible();
});
