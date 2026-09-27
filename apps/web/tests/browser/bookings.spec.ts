import { test, expect } from "@playwright/test";
test("all booking states and local cancellation", async ({ page }) => {
  await page.goto("/bookings");
  for (const state of [
    "Requested",
    "Accepted",
    "Completed",
    "Rejected",
    "Cancelled",
  ]) {
    await page.getByRole("button", { name: state, exact: true }).click();
    await expect(page.getByRole("link", { name: "View booking" })).toHaveCount(
      state === "Completed" ? 2 : 1,
    );
  }
  await page.goto("/bookings/booking-1");
  await page.getByRole("button", { name: "Cancel booking" }).click();
  await expect(page.getByRole("status")).toContainText("cancelled");
  await expect(
    page.getByRole("button", { name: "Cancel booking" }),
  ).toHaveCount(0);
});
test("completed booking review updates locally and cannot be submitted twice", async ({
  page,
}) => {
  await page.goto("/bookings/booking-6");
  for (const label of [
    "Overall experience",
    "Behaviour / respect",
    "Punctuality",
    "Profile accuracy",
  ])
    await page
      .getByRole("combobox", { name: label, exact: true })
      .selectOption("5");
  await page
    .getByLabel("Your experience", { exact: true })
    .fill("A respectful and enjoyable workout.");
  await page.getByRole("button", { name: "Save review preview" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Review saved in this preview",
  );
  await expect(
    page.getByRole("button", { name: "Save review preview" }),
  ).toHaveCount(0);
  await expect(
    page.getByText("A respectful and enjoyable workout.", { exact: true }),
  ).toBeVisible();
});
