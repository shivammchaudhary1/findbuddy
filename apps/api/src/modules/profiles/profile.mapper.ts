import type { PrivateProfileDto, PublicProfileDto } from "@findbuddy/types";

import type { UserRecord } from "../users/user.types.js";
import type { ProfileRecord } from "./profile.types.js";

export function toPublicProfile(
  profile: ProfileRecord,
  profilePhotoUrl?: string,
): PublicProfileDto {
  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.name,
    ...(profile.age === undefined ? {} : { age: profile.age }),
    ...(profile.gender ? { gender: profile.gender } : {}),
    ...(profile.city ? { city: profile.city } : {}),
    ...(profile.bio ? { bio: profile.bio } : {}),
    ...(profilePhotoUrl ? { profilePhotoUrl } : {}),
    interests: [...profile.interests],
    languages: [...profile.languages],
    intent: profile.intent,
    averageRating: profile.averageRating,
    ratingCount: profile.ratingCount,
    isIdentityVerified: profile.isIdentityVerified,
  };
}

export function toPrivateProfile(
  user: UserRecord,
  profile: ProfileRecord,
  profilePhotoUrl?: string,
): PrivateProfileDto {
  return {
    ...toPublicProfile(profile, profilePhotoUrl),
    email: user.email,
    accountRole: user.accountRole,
    accountStatus: user.accountStatus,
    emailVerified: Boolean(user.emailVerifiedAt),
    ...(profile.pincode ? { pincode: profile.pincode } : {}),
    ...(profile.womenOnlyVisibility === undefined
      ? {}
      : { womenOnlyVisibility: profile.womenOnlyVisibility }),
  };
}
