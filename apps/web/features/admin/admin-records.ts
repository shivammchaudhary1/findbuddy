import type { WebsiteData } from "@findbuddy/types";
import { currency, dateLabel, feeLabel } from "@findbuddy/utils";
import type { ModerationTarget } from "./moderation-dialog";
export type AdminRecord = {
  id: string;
  title: string;
  detail: string;
  status: string;
  href?: string;
  target?: ModerationTarget;
};
export function adminRecords(
  data: WebsiteData,
  section: string,
): AdminRecord[] {
  const name = (id: string) =>
    data.profiles.find((p) => p.userId === id)?.name ?? id;
  switch (section) {
    case "users":
      return data.users
        .filter((u) => u.accountRole === "USER")
        .map((u) => ({
          id: u._id,
          title: name(u._id),
          detail: u.email,
          status: u.accountStatus,
          href: `/admin/users/${u._id}`,
          target: {
            kind: "user",
            id: u._id,
            title: name(u._id),
            options: ["SUSPENDED", "BLOCKED", "ACTIVE"],
          },
        }));
    case "services":
      return data.services.map((s) => ({
        id: s._id,
        title: s.title,
        detail: `${name(s.providerId)} · ${feeLabel(s)}`,
        status: s.status,
        target:
          s.status !== "REMOVED"
            ? {
                kind: "service",
                id: s._id,
                title: s.title,
                options: ["REMOVED"],
              }
            : undefined,
      }));
    case "plans":
      return data.plans.map((p) => ({
        id: p._id,
        title: p.title,
        detail: `${name(p.creatorId)} · ${dateLabel(p.date)} · ${p.locationText}`,
        status: p.status,
        target:
          p.status === "PUBLISHED"
            ? {
                kind: "plan",
                id: p._id,
                title: p.title,
                options: ["CANCELLED"],
              }
            : undefined,
      }));
    case "bookings":
      return data.bookings.map((b) => ({
        id: b._id,
        title: b.serviceSnapshot.title,
        detail: `${name(b.consumerId)} → ${name(b.providerId)} · ${dateLabel(b.scheduledAt)} · ${feeLabel(b.serviceSnapshot)} · ${b.paymentStatus.toLowerCase()}`,
        status: b.status,
      }));
    case "reports":
      return data.reports.map((r) => ({
        id: r._id,
        title: `${r.category.replaceAll("_", " ")} · ${r.severity.toLowerCase()}`,
        detail: `${name(r.reporterId)} reported ${name(r.reportedUserId)}: ${r.description}`,
        status: r.status,
        href: `/admin/users/${r.reportedUserId}`,
        target: {
          kind: "report",
          id: r._id,
          title: r.category,
          options: ["UNDER_REVIEW", "CONFIRMED", "DISMISSED", "RESOLVED"],
        },
      }));
    case "verifications":
      return data.verificationRequests.map((v) => ({
        id: v._id,
        title: name(v.userId),
        detail:
          "Identity verification status only · No identity documents stored in this preview",
        status: v.status,
        target: {
          kind: "verification",
          id: v._id,
          title: name(v.userId),
          options: ["VERIFIED", "FAILED"],
        },
      }));
    case "trust":
      return data.trustScores.map((t) => ({
        id: t.userId,
        title: `${name(t.userId)} · ${t.finalScore}/100`,
        detail: `Computed ${t.computedScore} · Manual ${t.manualAdjustment > 0 ? "+" : ""}${t.manualAdjustment} · ${t.completedBookings} completed · ${t.repeatBookings} repeats. ${t.reasons.join(". ")}`,
        status: t.recommendation.replaceAll("_", " "),
        href: `/admin/users/${t.userId}`,
        target: {
          kind: "trust",
          id: t.userId,
          title: `${name(t.userId)}'s Trust Score`,
        },
      }));
    case "subscriptions":
      return data.users
        .filter((u) => u.accountRole === "USER")
        .map((u) => {
          const s = data.subscriptions.find((s) => s.userId === u._id);
          return {
            id: u._id,
            title: name(u._id),
            detail: s
              ? `${currency(s.amount)} / month · Period ends ${dateLabel(s.currentPeriodEnd)}`
              : "Free membership · No paid subscription",
            status: s?.status ?? "FREE",
          };
        });
    default:
      return [];
  }
}
