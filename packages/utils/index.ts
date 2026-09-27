import type { BuddyService, Subscription, TrustScore } from "@findbuddy/types";
import { FREE_SERVICE_LIMIT } from "@findbuddy/constants";
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
  return (
    subscription?.status === "ACTIVE" &&
    new Date(subscription.currentPeriodEnd) > now
  );
}
export function pricingError(
  pricingType: BuddyService["pricingType"],
  price: number,
  pro: boolean,
): string | undefined {
  if (!Number.isFinite(price) || price < 0)
    return "Enter a valid, non-negative activity fee.";
  if (pricingType === "FREE" && price !== 0)
    return "Free activities must have a zero fee.";
  if (!pro && pricingType === "PER_HOUR")
    return "Per-hour pricing is available with Pro.";
  if (!pro && price > FREE_SERVICE_LIMIT)
    return "Free members can set an activity fee up to ₹500.";
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
