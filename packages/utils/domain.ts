import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  FREE_SERVICE_LIMIT,
  MAX_PAGE_SIZE,
} from "@findbuddy/constants";
import type {
  ServicePricingInput,
  ServicePricingValidation,
  SubscriptionEntitlement,
} from "@findbuddy/types";
import type { PaginationMeta } from "@findbuddy/contracts";

export function hasActiveProEntitlement(
  subscription: SubscriptionEntitlement | undefined,
  now: Date = new Date(),
): boolean {
  if (subscription?.status !== "ACTIVE" || !subscription.currentPeriodEnd) {
    return false;
  }

  const periodEnd = new Date(subscription.currentPeriodEnd);
  return Number.isFinite(periodEnd.getTime()) && periodEnd > now;
}

export function validateServicePricing(
  input: ServicePricingInput,
): ServicePricingValidation {
  if (!Number.isFinite(input.price) || input.price < 0) {
    return {
      valid: false,
      code: "INVALID_PRICE",
      message: "Enter a valid, non-negative activity fee.",
    };
  }

  if (input.pricingType === "FREE" && input.price !== 0) {
    return {
      valid: false,
      code: "FREE_PRICE_MUST_BE_ZERO",
      message: "Free activities must have a zero fee.",
    };
  }

  if (!input.isPro && input.pricingType === "PER_HOUR") {
    return {
      valid: false,
      code: "PRO_REQUIRED_FOR_HOURLY_PRICING",
      message: "Per-hour pricing is available with Pro.",
    };
  }

  if (
    !input.isPro &&
    input.pricingType === "PER_SESSION" &&
    input.price > FREE_SERVICE_LIMIT
  ) {
    return {
      valid: false,
      code: "FREE_USER_PRICE_LIMIT",
      message: `Free members can set an activity fee up to ₹${FREE_SERVICE_LIMIT}.`,
    };
  }

  return { valid: true };
}

export function createPaginationMeta(input: {
  page?: number;
  limit?: number;
  total: number;
}): PaginationMeta {
  const page = input.page ?? DEFAULT_PAGE;
  const limit = input.limit ?? DEFAULT_PAGE_SIZE;

  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("Pagination page must be a positive integer");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new RangeError(
      `Pagination limit must be between 1 and ${MAX_PAGE_SIZE}`,
    );
  }
  if (!Number.isInteger(input.total) || input.total < 0) {
    throw new RangeError("Pagination total must be a non-negative integer");
  }

  return {
    page,
    limit,
    total: input.total,
    totalPages: Math.ceil(input.total / limit),
  };
}
