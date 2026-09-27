import { getWebsiteData } from "./index";
export function getPlans() {
  return getWebsiteData().plans;
}
export function getPlan(id: string) {
  return getPlans().find((p) => p._id === id);
}
export function getPopularPlans() {
  return getPlans()
    .filter((p) => p.status === "PUBLISHED")
    .slice(0, 4);
}
export function getPlanParticipants(id: string) {
  return getWebsiteData()
    .planJoinRequests.filter((r) => r.planId === id && r.status === "ACCEPTED")
    .map((r) => r.requesterId);
}
