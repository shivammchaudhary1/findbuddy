import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { baseSchemaOptions } from "../../common/database/schema-options.js";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    tokenHash: { type: String, required: true },
    familyId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { ...baseSchemaOptions, collection: "refreshTokens" },
);

refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ familyId: 1 });
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema>;
export const RefreshTokenModel =
  (models.RefreshToken as Model<RefreshTokenDocument> | undefined) ??
  model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);

export { refreshTokenSchema };
