import { getWebsiteData } from "./index";
export function getBookings(userId: string) {
  return getWebsiteData().bookings.filter(
    (b) => b.providerId === userId || b.consumerId === userId,
  );
}
export function getBooking(id: string, userId: string) {
  return getBookings(userId).find((b) => b._id === id);
}
