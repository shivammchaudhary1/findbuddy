export const metadata = { title: "Conversation | FindBuddy" };
import { Chat } from "@/features/chat/chat";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Chat id={(await params).id} />;
}
