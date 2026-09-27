import type { WebsiteData } from "@findbuddy/types";
import { websiteSchema } from "@findbuddy/validation";
type ReviewInput = {
  overallRating: number;
  behaviourRating: number;
  punctualityRating: number;
  profileAccuracyRating: number;
  wouldBookAgain: boolean;
  comment: string;
};
export function submitReview(
  data: WebsiteData,
  bookingId: string,
  input: ReviewInput,
): WebsiteData {
  const user = data.currentUser.userId;
  const booking = data.bookings.find(
    (b) =>
      b._id === bookingId && (b.providerId === user || b.consumerId === user),
  );
  if (!booking || booking.status !== "COMPLETED")
    throw new Error("Only participants can review a completed booking.");
  if (
    data.reviews.some((r) => r.bookingId === bookingId && r.reviewerId === user)
  )
    throw new Error("You have already reviewed this booking.");
  const revieweeId =
    booking.providerId === user ? booking.consumerId : booking.providerId;
  const review = websiteSchema.shape.reviews.element.parse({
    ...input,
    _id: crypto.randomUUID(),
    bookingId,
    reviewerId: user,
    revieweeId,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  });
  return {
    ...data,
    reviews: [...data.reviews, review],
    profiles: data.profiles.map((p) =>
      p.userId === revieweeId
        ? {
            ...p,
            averageRating:
              (p.averageRating * p.ratingCount + review.overallRating) /
              (p.ratingCount + 1),
            ratingCount: p.ratingCount + 1,
          }
        : p,
    ),
  };
}
