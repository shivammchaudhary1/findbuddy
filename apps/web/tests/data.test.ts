import { describe, it, expect } from "vitest";
import { getWebsiteData } from "@/lib/data";
import { getService, filterServices } from "@/lib/data/services";
import { getProfile } from "@/lib/data/users";
import { getBooking } from "@/lib/data/bookings";
import { getMessages } from "@/lib/data/chat";
import { websiteSchema } from "@findbuddy/validation";
import {
  pricingError,
  isPro,
  feeLabel,
  recommendationLabel,
} from "@findbuddy/utils";
describe("JSON data boundary", () => {
  const data = getWebsiteData();
  it("validates data and relationships", () => {
    expect(websiteSchema.safeParse(data).success).toBe(true);
    for (const s of data.services) {
      expect(getProfile(s.providerId)).toBeDefined();
      expect(data.categories.some((c) => c.id === s.category)).toBe(true);
    }
    for (const b of data.bookings) {
      expect(getService(b.serviceId)).toBeDefined();
      expect(b.providerId).not.toBe(b.consumerId);
    }
  });
  it("rejects malformed business data", () =>
    expect(
      websiteSchema.safeParse({
        ...data,
        services: [{ ...data.services[0], price: -1 }],
      }).success,
    ).toBe(false));
  it("handles missing records", () => {
    expect(getService("missing")).toBeUndefined();
    expect(getProfile("missing")).toBeUndefined();
  });
  it("limits private booking and chat selectors to participants", () => {
    expect(getBooking("booking-1", "vikram")).toBeUndefined();
    expect(getMessages("chat-riya", "vikram")).toEqual([]);
    expect(getMessages("chat-riya", "arjun").length).toBeGreaterThan(0);
  });
  it("combines search, category, fee, rating, location and trust filters", () => {
    expect(
      filterServices(data, {
        search: "coffee",
        category: "COFFEE_BUDDY",
        maxPrice: 300,
        minRating: 4.8,
        city: "Mumbai",
        minTrust: 80,
        verifiedOnly: true,
      }).map((s) => s._id),
    ).toEqual(["coffee-riya"]);
    expect(filterServices(data, { city: "Delhi" })).toEqual([]);
    expect(filterServices(data, { dayOfWeek: 1 })).toEqual([]);
  });
  it("hides blocked and suspended profiles", () => {
    const changed = structuredClone(data);
    changed.blocks.push({ blockerId: "arjun", blockedUserId: "riya" });
    expect(filterServices(changed).some((s) => s.providerId === "riya")).toBe(
      false,
    );
    changed.users[0].accountStatus = "SUSPENDED";
    expect(
      filterServices(changed).some(
        (s) => s.providerId === changed.users[0]._id,
      ),
    ).toBe(false);
  });
});
describe("pricing and entitlement", () => {
  it("enforces Free limits on boundaries", () => {
    expect(pricingError("PER_SESSION", 500, false)).toBeUndefined();
    expect(pricingError("PER_SESSION", 501, false)).toBeDefined();
    expect(pricingError("PER_HOUR", 100, false)).toBeDefined();
    expect(pricingError("FREE", 1, true)).toBeDefined();
    expect(pricingError("PER_SESSION", NaN, true)).toBeDefined();
  });
  it("allows Pro pricing and expires entitlement", () => {
    expect(pricingError("PER_HOUR", 800, true)).toBeUndefined();
    const sub = getWebsiteData().subscriptions[0];
    expect(isPro(sub, new Date("2026-09-27"))).toBe(true);
    expect(isPro(sub, new Date(sub.currentPeriodEnd))).toBe(false);
    expect(isPro({ ...sub, status: "CANCELLED" }, new Date("2026-09-27"))).toBe(
      false,
    );
    expect(isPro(undefined)).toBe(false);
  });
  it("uses service-fee terminology and all recommendation labels", () => {
    expect(feeLabel({ price: 300, pricingType: "PER_SESSION" })).toBe(
      "₹300 per activity",
    );
    expect(feeLabel({ price: 0, pricingType: "FREE" })).toBe("Free activity");
    expect(recommendationLabel("RECOMMENDED")).toBe("Recommended");
    expect(recommendationLabel("PROCEED_WITH_CAUTION")).toBe(
      "Proceed with Caution",
    );
    expect(recommendationLabel("NOT_RECOMMENDED")).toBe("Not Recommended");
  });
});
