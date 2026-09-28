import type {
  PricingType,
  PublicProfileDto,
  PublicServiceDto,
} from "@findbuddy/types";

type Identifier = string | { toString(): string };

export type PublicProfileSource = {
  _id: Identifier;
  userId: Identifier;
  name: string;
  age?: number;
  gender?: string;
  city?: string;
  bio?: string;
  profilePhotoUrl?: string;
  interests: string[];
  languages: string[];
  intent: PublicProfileDto["intent"];
  averageRating: number;
  ratingCount: number;
  isIdentityVerified: boolean;
};

export type PublicServiceSource = {
  _id: Identifier;
  providerId: Identifier;
  category: PublicServiceDto["category"];
  title: string;
  description: string;
  pricingType: PricingType;
  price: number;
  city?: string;
  availability?: PublicServiceDto["availability"];
};

export function toPublicProfileDto(
  profile: PublicProfileSource,
): PublicProfileDto {
  return {
    id: String(profile._id),
    userId: String(profile.userId),
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    city: profile.city,
    bio: profile.bio,
    profilePhotoUrl: profile.profilePhotoUrl,
    interests: [...profile.interests],
    languages: [...profile.languages],
    intent: profile.intent,
    averageRating: profile.averageRating,
    ratingCount: profile.ratingCount,
    isIdentityVerified: profile.isIdentityVerified,
  };
}

export function toPublicServiceDto(
  service: PublicServiceSource,
): PublicServiceDto {
  return {
    id: String(service._id),
    providerId: String(service.providerId),
    category: service.category,
    title: service.title,
    description: service.description,
    pricingType: service.pricingType,
    price: service.price,
    city: service.city,
    availability: service.availability
      ? service.availability.map((availability) => ({ ...availability }))
      : [],
  };
}
