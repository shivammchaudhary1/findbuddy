import type { Booking } from "@findbuddy/types";
export function canTransition(
  booking: Booking,
  next: Booking["status"],
  actorId: string,
  now: Date = new Date(),
): boolean {
  const provider = booking.providerId === actorId;
  const participant = provider || booking.consumerId === actorId;
  if (!participant) return false;
  if (booking.status === "REQUESTED")
    return (
      next === "CANCELLED" ||
      (provider && (next === "ACCEPTED" || next === "REJECTED"))
    );
  if (booking.status === "ACCEPTED")
    return (
      next === "CANCELLED" ||
      (next === "COMPLETED" &&
        new Date(booking.scheduledAt) <= now &&
        (!booking.paymentRequired || booking.paymentStatus === "PAID"))
    );
  return false;
}
