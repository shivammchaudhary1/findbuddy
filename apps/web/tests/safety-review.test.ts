import { it, expect } from "vitest";
import { getWebsiteData } from "@/lib/data";
import { canViewProfile, canInteract } from "@/lib/data/visibility";
import { submitReview } from "@/features/bookings/review-rules";
const input = {
  overallRating: 4,
  behaviourRating: 5,
  punctualityRating: 4,
  profileAccuracyRating: 5,
  wouldBookAgain: true,
  comment: "Good activity",
};
it("restricts profile visibility for blocks, women-only and inactive accounts", () => {
  const data = structuredClone(getWebsiteData());
  data.blocks.push({ blockerId: "riya", blockedUserId: "arjun" });
  expect(canViewProfile(data, "riya")).toBe(false);
  data.profiles.find((p) => p.userId === "sneha")!.womenOnlyVisibility = true;
  expect(canViewProfile(data, "sneha")).toBe(false);
  data.users.find((u) => u._id === "arjun")!.accountStatus = "SUSPENDED";
  expect(canInteract(data, "karan")).toBe(false);
});
it("reviews require completed booking participation and reject duplicates", () => {
  const data = getWebsiteData();
  expect(() => submitReview(data, "booking-1", input)).toThrow(
    "completed booking",
  );
  expect(() => submitReview(data, "booking-3", input)).toThrow(
    "already reviewed",
  );
  const outsider = { ...data, currentUser: { userId: "vikram" } };
  expect(() => submitReview(outsider, "booking-3", input)).toThrow(
    "participants",
  );
});
it("the other participant can review once and update the rating aggregate", () => {
  const data = { ...getWebsiteData(), currentUser: { userId: "sneha" } };
  const updated = submitReview(data, "booking-3", input);
  expect(updated.reviews.at(-1)).toMatchObject({
    reviewerId: "sneha",
    revieweeId: "arjun",
    overallRating: 4,
  });
  expect(updated.profiles.find((p) => p.userId === "arjun")!.ratingCount).toBe(
    data.profiles.find((p) => p.userId === "arjun")!.ratingCount + 1,
  );
  expect(() => submitReview(updated, "booking-3", input)).toThrow(
    "already reviewed",
  );
});
