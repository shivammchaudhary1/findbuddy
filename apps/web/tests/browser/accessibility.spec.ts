import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const route of [
  "/",
  "/explore",
  "/buddies/riya",
  "/services/coffee-riya",
  "/plans/create",
  "/bookings/booking-6",
  "/messages/chat-riya",
  "/profile",
  "/profile/subscription",
  "/register",
  "/admin/reports",
  "/missing-page",
]) {
  test(`accessibility scan ${route}`, async ({ page }) => {
    await page.goto(route);
    if (route.startsWith("/admin"))
      await page.getByRole("button", { name: "Open sample admin" }).click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}
test("mobile navigation closes with Escape and retains keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
});
