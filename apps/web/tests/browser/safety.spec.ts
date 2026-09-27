import { test, expect } from "@playwright/test";
test("report and block are local, with unblock available from profile", async ({
  page,
}) => {
  await page.goto("/buddies/riya");
  await page.getByRole("button", { name: "Report user" }).click();
  await page
    .getByLabel("What happened?")
    .fill("Preview profile review request");
  await page.getByRole("button", { name: "Save report preview" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No moderation team was notified",
  );
  await page.getByRole("button", { name: "Block user" }).click();
  await page.getByRole("button", { name: "Block in preview" }).click();
  await expect(
    page.getByRole("heading", { name: "This page wandered off" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "My account", exact: true }).click();
  await page.getByRole("button", { name: "Unblock", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unblock", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Trusted contact name").fill("Sample contact");
  await page.getByLabel("Contact phone or email").fill("contact@example.com");
  await page.getByRole("button", { name: "Save contact preview" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No notification was sent",
  );
});
