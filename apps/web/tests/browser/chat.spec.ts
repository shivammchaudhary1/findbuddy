import { test, expect } from "@playwright/test";
test("chat sends locally and resets on reload", async ({ page }) => {
  await page.goto("/messages/chat-riya");
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("See you at the café — preview message");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("log")).toContainText("preview message");
  await page.reload();
  await expect(page.getByRole("log")).not.toContainText("preview message");
});
test("mobile chat has a usable back path", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/messages");
  await page
    .getByRole("navigation", { name: "Conversations" })
    .getByRole("link")
    .first()
    .click();
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to conversations" }).click();
  await expect(
    page.getByRole("navigation", { name: "Conversations" }),
  ).toBeVisible();
});
