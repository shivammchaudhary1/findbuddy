import { test, expect } from "@playwright/test";
test("admin preview requires explicit access and records moderation reasons", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Admin preview" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open sample admin" }).click();
  await page
    .getByRole("navigation", { name: "Admin navigation" })
    .getByRole("link", { name: "Users", exact: true })
    .click();
  await page
    .getByRole("row")
    .filter({ hasText: "Riya S." })
    .getByRole("link", { name: "User detail" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Riya S.", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review account status" }).click();
  await page
    .getByLabel("Reason", { exact: true })
    .fill("Preview moderation review");
  await page.getByRole("button", { name: "Apply preview change" }).click();
  await expect(
    page.getByRole("main").getByText("suspended", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Admin navigation" })
    .getByRole("link", { name: "Trust", exact: true })
    .click();
  await page
    .getByRole("row")
    .filter({ hasText: "Riya S." })
    .getByRole("button", { name: "Review", exact: true })
    .click();
  await page.getByLabel("Score adjustment").fill("-10");
  await page.getByLabel("Reason", { exact: true }).fill("Review adjustment");
  await page.getByRole("button", { name: "Apply preview change" }).click();
  await expect(
    page.getByText("Riya S. · 77/100", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("trust.update · riya · Review adjustment"),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Admin preview" }),
  ).toBeVisible();
});
test("admin dialogs support Escape and restore focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/reports");
  await page.getByRole("button", { name: "Open sample admin" }).click();
  const button = page
    .getByRole("button", { name: "Review", exact: true })
    .first();
  await button.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(button).toBeFocused();
});
