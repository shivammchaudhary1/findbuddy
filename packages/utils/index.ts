import type { BuddyService, Subscription, TrustScore } from "@findbuddy/types";
import { hasActiveProEntitlement, validateServicePricing } from "./domain";

export * from "./domain";
export * from "./public-dto";

export function currency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
export function feeLabel(
  service: Pick<BuddyService, "price" | "pricingType">,
): string {
  return service.pricingType === "FREE"
    ? "Free activity"
    : `${currency(service.price)} ${service.pricingType === "PER_HOUR" ? "per hour" : "per activity"}`;
}
export function isPro(
  subscription: Subscription | undefined,
  now: Date = new Date(),
): boolean {
  return hasActiveProEntitlement(subscription, now);
}
export function pricingError(
  pricingType: BuddyService["pricingType"],
  price: number,
  pro: boolean,
): string | undefined {
  const result = validateServicePricing({
    isPro: pro,
    pricingType,
    price,
  });

  return result.valid ? undefined : result.message;
}
export function recommendationLabel(
  state: TrustScore["recommendation"],
): string {
  return {
    RECOMMENDED: "Recommended",
    PROCEED_WITH_CAUTION: "Proceed with Caution",
    NOT_RECOMMENDED: "Not Recommended",
  }[state];
}
export function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
export function timeLabel(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
