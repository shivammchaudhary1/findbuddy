export const accountRoles = ["USER", "ADMIN", "SUPER_ADMIN"] as const;
export const accountStatuses = [
  "ACTIVE",
  "SUSPENDED",
  "BLOCKED",
  "DELETED",
] as const;
export const profileIntents = ["OFFER", "BOOK", "BOTH"] as const;
export const mediaKinds = ["PROFILE_IMAGE"] as const;
export const mediaStatuses = ["PENDING", "ACTIVE", "DELETED"] as const;

export const serviceCategories = [
  "GYM_BUDDY",
  "CLUB_BUDDY",
  "COFFEE_BUDDY",
  "MOVIE_PARTNER",
  "TRAVEL_BUDDY",
  "ONLY_LISTENING",
  "SHOPPING_BUDDY",
  "GAMING_BUDDY",
  "EVENT_BUDDY",
  "CUSTOM",
] as const;
export const pricingTypes = ["FREE", "PER_SESSION", "PER_HOUR"] as const;
export const serviceStatuses = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "REMOVED",
] as const;

export const bookingStatuses = [
  "REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
] as const;
export const planPricingTypes = ["FREE", "PAID"] as const;
export const planStatuses = [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
] as const;
export const planJoinRequestStatuses = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
] as const;

export const subscriptionPlanCodes = ["PRO_MONTHLY_299"] as const;
export const subscriptionStatuses = [
  "PENDING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
] as const;
export const paymentPurposes = [
  "SERVICE_BOOKING",
  "PLAN",
  "PRO_SUBSCRIPTION",
] as const;
export const paymentProviders = ["RAZORPAY"] as const;
export const paymentStatuses = [
  "CREATED",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const verificationTypes = ["AADHAAR_IDENTITY"] as const;
export const verificationStatuses = [
  "INITIATED",
  "PENDING",
  "VERIFIED",
  "FAILED",
  "EXPIRED",
] as const;
export const recommendationStates = [
  "RECOMMENDED",
  "PROCEED_WITH_CAUTION",
  "NOT_RECOMMENDED",
] as const;
export const reviewStatuses = ["ACTIVE", "REMOVED"] as const;

export const reportSeverities = ["LOW", "MEDIUM", "HIGH"] as const;
export const reportStatuses = [
  "OPEN",
  "UNDER_REVIEW",
  "CONFIRMED",
  "DISMISSED",
  "RESOLVED",
] as const;
export const safetyEventTypes = [
  "SOS",
  "MEETUP_CHECK_IN",
  "MEETUP_CHECK_OUT",
] as const;

export const conversationTypes = ["BOOKING", "PLAN"] as const;
export const messageTypes = ["TEXT"] as const;
export const notificationTypes = [
  "BOOKING_REQUEST",
  "BOOKING_ACCEPTED",
  "BOOKING_REJECTED",
  "PLAN_JOIN_REQUEST",
  "PLAN_JOIN_ACCEPTED",
  "PLAN_JOIN_REJECTED",
  "CHAT_MESSAGE",
  "BOOKING_REMINDER",
  "REVIEW_REQUEST",
  "VERIFICATION_STATUS",
  "SUBSCRIPTION_STATUS",
] as const;

export const supportedCurrencies = ["INR"] as const;
export const servicePricingErrorCodes = [
  "INVALID_PRICE",
  "FREE_PRICE_MUST_BE_ZERO",
  "PRO_REQUIRED_FOR_HOURLY_PRICING",
  "FREE_USER_PRICE_LIMIT",
] as const;

export const FREE_SERVICE_LIMIT = 500;
export const PRO_MONTHLY_PRICE = 299;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const TRUST_SCORE_MIN = 0;
export const TRUST_SCORE_MAX = 100;
export const TRUST_SCORE_INITIAL = 50;
export const RECOMMENDATION_HIGH_THRESHOLD = 75;
export const RECOMMENDATION_LOW_THRESHOLD = 40;
