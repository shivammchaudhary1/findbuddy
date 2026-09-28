import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { accountRoles, accountStatuses } from "@findbuddy/constants";

import { baseSchemaOptions } from "../../common/database/schema-options.js";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    accountRole: {
      type: String,
      enum: accountRoles,
      default: "USER",
      required: true,
    },
    accountStatus: {
      type: String,
      enum: accountStatuses,
      default: "ACTIVE",
      required: true,
    },
    emailVerifiedAt: { type: Date },
  },
  { ...baseSchemaOptions, collection: "users" },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ accountStatus: 1 });
userSchema.index({ createdAt: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel =
  (models.User as Model<UserDocument> | undefined) ??
  model<UserDocument>("User", userSchema);

export { userSchema };
