import type { WebsiteData } from "@findbuddy/types";
import { getWebsiteData } from "./index";
export function getTrust(userId: string, data: WebsiteData = getWebsiteData()) {
  return data.trustScores.find((t) => t.userId === userId);
}
export function getReviews(
  userId: string,
  data: WebsiteData = getWebsiteData(),
) {
  return data.reviews.filter(
    (r) => r.revieweeId === userId && r.status === "ACTIVE",
  );
}
