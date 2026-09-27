import type { WebsiteData } from "@findbuddy/types";
export type ModerationKind =
  | "user"
  | "verification"
  | "service"
  | "plan"
  | "report"
  | "trust"
  | "category";
export type ModerationInput = {
  kind: ModerationKind;
  id: string;
  value: string;
  reason: string;
};
export function hasAdminAccess(
  data: WebsiteData,
  adminId: string | null,
): boolean {
  return data.users.some(
    (u) =>
      u._id === adminId &&
      u.accountStatus === "ACTIVE" &&
      (u.accountRole === "ADMIN" || u.accountRole === "SUPER_ADMIN"),
  );
}
// This pure mutation is for the in-memory preview. Backend authorization remains required later.
export function moderate(
  data: WebsiteData,
  adminId: string | null,
  input: ModerationInput,
): WebsiteData {
  if (!adminId || !hasAdminAccess(data, adminId))
    throw new Error("Admin access is required.");
  if (!input.reason.trim())
    throw new Error("A reason is required for every moderation action.");
  const next = structuredClone(data);
  let before: Record<string, unknown> = {},
    after: Record<string, unknown> = {};
  const { kind, id, value } = input;
  const createdAt = new Date().toISOString();
  if (kind === "user") {
    const record = next.users.find((u) => u._id === id);
    if (
      !record ||
      record.accountRole !== "USER" ||
      !["ACTIVE", "SUSPENDED", "BLOCKED"].includes(value)
    )
      throw new Error("Invalid account action.");
    before = { ...record };
    record.accountStatus = value as "ACTIVE" | "SUSPENDED" | "BLOCKED";
    after = { ...record };
  } else if (kind === "service") {
    const record = next.services.find((s) => s._id === id);
    if (!record || value !== "REMOVED")
      throw new Error("Invalid service action.");
    before = { ...record };
    record.status = "REMOVED";
    after = { ...record };
  } else if (kind === "plan") {
    const record = next.plans.find((p) => p._id === id);
    if (!record || value !== "CANCELLED")
      throw new Error("Invalid plan action.");
    before = { ...record };
    record.status = "CANCELLED";
    after = { ...record };
  } else if (kind === "verification") {
    const record = next.verificationRequests.find((v) => v._id === id);
    if (!record || !["VERIFIED", "FAILED"].includes(value))
      throw new Error("Invalid verification action.");
    const profile = next.profiles.find((p) => p.userId === record.userId);
    before = { ...record, isIdentityVerified: profile?.isIdentityVerified };
    record.status = value as "VERIFIED" | "FAILED";
    if (profile) profile.isIdentityVerified = value === "VERIFIED";
    after = { ...record, isIdentityVerified: profile?.isIdentityVerified };
  } else if (kind === "report") {
    const record = next.reports.find((r) => r._id === id);
    if (
      !record ||
      !["OPEN", "UNDER_REVIEW", "CONFIRMED", "DISMISSED", "RESOLVED"].includes(
        value,
      )
    )
      throw new Error("Invalid report action.");
    before = { ...record };
    record.status = value as typeof record.status;
    after = { ...record };
  } else if (kind === "category") {
    const record = next.categories.find((c) => c.id === id);
    if (!record || !value.trim() || value.trim().length > 60)
      throw new Error("Enter a category label of 1–60 characters.");
    before = { ...record };
    record.name = value.trim();
    after = { ...record };
  } else {
    const record = next.trustScores.find((t) => t.userId === id);
    const delta = Number(value);
    if (
      !record ||
      !value.trim() ||
      !Number.isInteger(delta) ||
      delta === 0 ||
      Math.abs(delta) > 100
    )
      throw new Error("Enter a nonzero adjustment between −100 and 100.");
    before = { ...record };
    record.manualAdjustment += delta;
    record.finalScore = Math.max(
      0,
      Math.min(100, record.computedScore + record.manualAdjustment),
    );
    // Preserve existing safety/history restrictions. A manual increase cannot auto-recommend someone.
    if (record.finalScore < 40) record.recommendation = "NOT_RECOMMENDED";
    else if (record.finalScore < 75 && record.recommendation === "RECOMMENDED")
      record.recommendation = "PROCEED_WITH_CAUTION";
    next.trustScoreEvents.push({
      userId: id,
      delta,
      reason: input.reason.trim(),
      actorAdminId: adminId,
      createdAt,
    });
    after = { ...record };
  }
  next.adminAuditLogs.push({
    _id: crypto.randomUUID(),
    adminId,
    action: `${kind}.update`,
    targetType: kind,
    targetId: id,
    reason: input.reason.trim(),
    before,
    after,
    createdAt,
  });
  return next;
}
