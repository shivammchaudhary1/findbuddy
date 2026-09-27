import { it, expect } from "vitest";
import { getWebsiteData } from "@/lib/data";
import { hasAdminAccess, moderate } from "@/features/admin/moderation";
import { websiteSchema } from "@findbuddy/validation";
it("rejects member access and unaudited changes", () => {
  const data = getWebsiteData();
  expect(hasAdminAccess(data, "arjun")).toBe(false);
  expect(() =>
    moderate(data, "arjun", {
      kind: "user",
      id: "riya",
      value: "BLOCKED",
      reason: "Review",
    }),
  ).toThrow("Admin access");
  expect(() =>
    moderate(data, "admin-preview", {
      kind: "user",
      id: "riya",
      value: "BLOCKED",
      reason: " ",
    }),
  ).toThrow("reason");
});
it("clamps manual trust changes, preserves computed score, and creates both audit records", () => {
  const data = getWebsiteData();
  const updated = moderate(data, "admin-preview", {
    kind: "trust",
    id: "riya",
    value: "-100",
    reason: "Confirmed complaint",
  });
  expect(updated.trustScores[0]).toMatchObject({
    computedScore: 87,
    manualAdjustment: -100,
    finalScore: 0,
    recommendation: "NOT_RECOMMENDED",
  });
  expect(data.trustScores[0].finalScore).toBe(87);
  expect(updated.trustScoreEvents).toHaveLength(1);
  expect(updated.adminAuditLogs[0].before.finalScore).toBe(87);
  expect(updated.adminAuditLogs[0].after.finalScore).toBe(0);
  expect(websiteSchema.safeParse(updated).success).toBe(true);
});
it("does not grant recommendation automatically after a manual increase", () => {
  const updated = moderate(getWebsiteData(), "admin-preview", {
    kind: "trust",
    id: "vikram",
    value: "50",
    reason: "Reviewed account",
  });
  expect(
    updated.trustScores.find((t) => t.userId === "vikram")?.recommendation,
  ).toBe("PROCEED_WITH_CAUTION");
});
