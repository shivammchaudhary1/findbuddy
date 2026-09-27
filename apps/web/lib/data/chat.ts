import { getWebsiteData } from "./index";
export function getConversations(userId: string) {
  return getWebsiteData().conversations.filter((c) =>
    c.participantIds.includes(userId),
  );
}
export function getMessages(conversationId: string, userId: string) {
  if (!getConversations(userId).some((c) => c._id === conversationId))
    return [];
  return getWebsiteData()
    .messages.filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
