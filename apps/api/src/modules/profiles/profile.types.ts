import type { UpdateProfileRequest } from "@findbuddy/types";

export type ProfileRecord = {
  id: string;
  userId: string;
  name: string;
  age?: number;
  gender?: string;
  city?: string;
  pincode?: string;
  bio?: string;
  profilePhotoMediaId?: string;
  interests: string[];
  languages: string[];
  intent: "OFFER" | "BOOK" | "BOTH";
  womenOnlyVisibility?: boolean;
  averageRating: number;
  ratingCount: number;
  isIdentityVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileUpdate = UpdateProfileRequest;
