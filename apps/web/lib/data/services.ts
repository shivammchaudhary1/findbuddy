import { canViewProfile } from "./visibility";
import type {
  BuddyService,
  ServiceFilters,
  WebsiteData,
} from "@findbuddy/types";
import { getWebsiteData } from "./index";
export function filterServices(
  data: WebsiteData,
  filters: ServiceFilters = {},
): BuddyService[] {
  const search = filters.search?.trim().toLowerCase();
  return data.services.filter((service) => {
    const profile = data.profiles.find((p) => p.userId === service.providerId);
    const trust = data.trustScores.find((t) => t.userId === service.providerId);
    if (
      !profile ||
      service.status !== "ACTIVE" ||
      !canViewProfile(data, service.providerId)
    )
      return false;
    return (
      (!search ||
        `${service.title} ${profile.name} ${service.description} ${profile.interests.join(" ")}`
          .toLowerCase()
          .includes(search)) &&
      (!filters.category || service.category === filters.category) &&
      (!filters.city ||
        service.city
          .toLowerCase()
          .includes(filters.city.trim().toLowerCase())) &&
      (filters.maxPrice === undefined || service.price <= filters.maxPrice) &&
      (filters.minRating === undefined ||
        profile.averageRating >= filters.minRating) &&
      (!filters.verifiedOnly || profile.isIdentityVerified) &&
      (filters.minTrust === undefined ||
        (trust?.finalScore ?? 0) >= filters.minTrust) &&
      (filters.dayOfWeek === undefined ||
        service.availability.some((a) => a.dayOfWeek === filters.dayOfWeek))
    );
  });
}
export function getServices(filters: ServiceFilters = {}) {
  return filterServices(getWebsiteData(), filters);
}
export function getService(id: string, data: WebsiteData = getWebsiteData()) {
  return data.services.find((s) => s._id === id && s.status !== "REMOVED");
}
export function getFeaturedBuddies() {
  const data = getWebsiteData();
  return data.profiles
    .filter((p) => getServices().some((s) => s.providerId === p.userId))
    .slice(0, 4);
}
