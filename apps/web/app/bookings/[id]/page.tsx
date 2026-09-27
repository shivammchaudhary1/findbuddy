export const metadata = { title: "Booking details | FindBuddy" };
import { BookingDetail } from "@/features/bookings/booking-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <BookingDetail id={(await params).id} />;
}
