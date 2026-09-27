import type { WebsiteData } from "@findbuddy/types";
export function isBlocked(data: WebsiteData, otherId: string): boolean {
  const current = data.currentUser.userId;
  return data.blocks.some(
    (b) =>
      (b.blockerId === current && b.blockedUserId === otherId) ||
      (b.blockerId === otherId && b.blockedUserId === current),
  );
}
export function canViewProfile(data: WebsiteData, otherId: string): boolean {
  const profile = data.profiles.find((p) => p.userId === otherId);
  if (
    !profile ||
    data.users.find((u) => u._id === otherId)?.accountStatus !== "ACTIVE" ||
    isBlocked(data, otherId)
  )
    return false;
  return (
    !profile.womenOnlyVisibility ||
    otherId === data.currentUser.userId ||
    data.profiles.find((p) => p.userId === data.currentUser.userId)?.gender ===
      "WOMAN"
  );
}
export function canInteract(data: WebsiteData, otherId: string): boolean {
  return (
    data.users.find((u) => u._id === data.currentUser.userId)?.accountStatus ===
      "ACTIVE" && canViewProfile(data, otherId)
  );
}
