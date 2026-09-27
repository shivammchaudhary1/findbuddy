export const metadata = { title: "Buddy profile | FindBuddy" };
import { BuddyDetail } from "@/features/buddies/buddy-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BuddyDetail id={id} />;
}
