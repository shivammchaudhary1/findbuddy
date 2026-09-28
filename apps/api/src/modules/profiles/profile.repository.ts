import { Types, type ClientSession, type Model } from "mongoose";

import { ProfileModel, type ProfileDocument } from "./profile.model.js";
import type { ProfileRecord, ProfileUpdate } from "./profile.types.js";

export interface ProfileRepository {
  findByUserId(userId: string): Promise<ProfileRecord | null>;
  upsertForUser(userId: string, update: ProfileUpdate): Promise<ProfileRecord>;
  setProfilePhoto(
    userId: string,
    mediaId: string,
    session?: ClientSession,
  ): Promise<boolean>;
}

type ProfilePersistence = ProfileDocument & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export class MongooseProfileRepository implements ProfileRepository {
  constructor(private readonly model: Model<ProfileDocument> = ProfileModel) {}

  async findByUserId(userId: string): Promise<ProfileRecord | null> {
    if (!Types.ObjectId.isValid(userId)) return null;
    const profile = await this.model
      .findOne({ userId })
      .lean<ProfilePersistence>();
    return profile ? toProfileRecord(profile) : null;
  }

  async upsertForUser(
    userId: string,
    update: ProfileUpdate,
  ): Promise<ProfileRecord> {
    const profile = await this.model
      .findOneAndUpdate(
        { userId },
        {
          $set: update,
          $setOnInsert: { userId },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean<ProfilePersistence>();
    if (!profile) throw new Error("Profile upsert did not return a document");
    return toProfileRecord(profile);
  }

  async setProfilePhoto(
    userId: string,
    mediaId: string,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.model.updateOne(
      { userId },
      { $set: { profilePhotoMediaId: mediaId } },
      { session },
    );
    return result.modifiedCount === 1 || result.matchedCount === 1;
  }
}

function toProfileRecord(profile: ProfilePersistence): ProfileRecord {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    name: profile.name,
    ...(profile.age == null ? {} : { age: profile.age }),
    ...(profile.gender ? { gender: profile.gender } : {}),
    ...(profile.city ? { city: profile.city } : {}),
    ...(profile.pincode ? { pincode: profile.pincode } : {}),
    ...(profile.bio ? { bio: profile.bio } : {}),
    ...(profile.profilePhotoMediaId
      ? { profilePhotoMediaId: profile.profilePhotoMediaId.toString() }
      : {}),
    interests: [...profile.interests],
    languages: [...profile.languages],
    intent: profile.intent,
    ...(profile.womenOnlyVisibility == null
      ? {}
      : { womenOnlyVisibility: profile.womenOnlyVisibility }),
    averageRating: profile.averageRating,
    ratingCount: profile.ratingCount,
    isIdentityVerified: profile.isIdentityVerified,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
