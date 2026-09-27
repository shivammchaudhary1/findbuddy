import { it, expect } from "vitest";
import { getWebsiteData } from "@/lib/data";
import { canTransition } from "@/features/bookings/booking-rules";
it("restricts booking transitions by actor and current status", () => {
  const b = getWebsiteData().bookings[0];
  expect(canTransition(b, "ACCEPTED", b.consumerId)).toBe(false);
  expect(canTransition(b, "ACCEPTED", b.providerId)).toBe(true);
  expect(canTransition(b, "CANCELLED", "stranger")).toBe(false);
  for (const status of ["CANCELLED", "REJECTED", "COMPLETED"] as const)
    expect(canTransition({ ...b, status }, "ACCEPTED", b.providerId)).toBe(
      false,
    );
});
it("does not complete future or unpaid bookings", () => {
  const b = { ...getWebsiteData().bookings[0], status: "ACCEPTED" as const };
  expect(
    canTransition(b, "COMPLETED", b.providerId, new Date("2025-01-01")),
  ).toBe(false);
  expect(
    canTransition(b, "COMPLETED", b.providerId, new Date("2027-01-01")),
  ).toBe(false);
  expect(
    canTransition(
      { ...b, paymentStatus: "PAID" },
      "COMPLETED",
      b.providerId,
      new Date("2027-01-01"),
    ),
  ).toBe(true);
});
