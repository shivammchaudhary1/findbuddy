import type { WebsiteData } from "@findbuddy/types";
import { getWebsiteData } from "./index";
export function getProfile(id: string, data: WebsiteData = getWebsiteData()) {
  return data.profiles.find((p) => p.userId === id);
}
export function getCurrentProfile() {
  return getProfile(getWebsiteData().currentUser.userId);
}
export function getUserServices(
  id: string,
  data: WebsiteData = getWebsiteData(),
) {
  return data.services.filter(
    (s) => s.providerId === id && s.status !== "REMOVED",
  );
}
export function getUserSubscription(
  id: string,
  data: WebsiteData = getWebsiteData(),
) {
  return data.subscriptions.find((s) => s.userId === id);
}
