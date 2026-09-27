export const pricingTypes = ["FREE", "PER_SESSION", "PER_HOUR"] as const;
export const bookingStatuses = [
  "REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
] as const;
export const recommendationStates = [
  "RECOMMENDED",
  "PROCEED_WITH_CAUTION",
  "NOT_RECOMMENDED",
] as const;
export const FREE_SERVICE_LIMIT = 500;
