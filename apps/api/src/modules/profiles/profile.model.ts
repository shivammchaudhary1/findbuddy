import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { profileIntents } from "@findbuddy/constants";

import { baseSchemaOptions } from "../../common/database/schema-options.js";

const profileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, min: 1, max: 120 },
    gender: { type: String, trim: true, maxlength: 50 },
    city: { type: String, trim: true, maxlength: 100 },
    pincode: { type: String, trim: true, maxlength: 20 },
    bio: { type: String, trim: true, maxlength: 1000 },
    profilePhotoMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    interests: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    intent: {
      type: String,
      enum: profileIntents,
      default: "BOTH",
      required: true,
    },
    womenOnlyVisibility: { type: Boolean },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    isIdentityVerified: { type: Boolean, default: false },
  },
  { ...baseSchemaOptions, collection: "profiles" },
);

profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index({ city: 1 });
profileSchema.index({ pincode: 1 });
profileSchema.index({ isIdentityVerified: 1 });
profileSchema.index({ averageRating: -1 });

export type ProfileDocument = InferSchemaType<typeof profileSchema>;
export const ProfileModel =
  (models.Profile as Model<ProfileDocument> | undefined) ??
  model<ProfileDocument>("Profile", profileSchema);

export { profileSchema };
