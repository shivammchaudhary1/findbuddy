import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { baseSchemaOptions } from "../../common/database/schema-options.js";
import { authActionTypes } from "./auth.types.js";

const authActionTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    tokenHash: { type: String, required: true },
    type: { type: String, enum: authActionTypes, required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { ...baseSchemaOptions, collection: "authActionTokens" },
);

authActionTokenSchema.index({ tokenHash: 1 }, { unique: true });
authActionTokenSchema.index({ userId: 1, type: 1, consumedAt: 1 });
authActionTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type AuthActionTokenDocument = InferSchemaType<
  typeof authActionTokenSchema
>;
export const AuthActionTokenModel =
  (models.AuthActionToken as Model<AuthActionTokenDocument> | undefined) ??
  model<AuthActionTokenDocument>("AuthActionToken", authActionTokenSchema);

export { authActionTokenSchema };
