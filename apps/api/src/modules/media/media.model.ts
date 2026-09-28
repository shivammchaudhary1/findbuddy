import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { mediaKinds, mediaStatuses } from "@findbuddy/constants";

import { baseSchemaOptions } from "../../common/database/schema-options.js";

const mediaSchema = new Schema(
  {
    ownerUserId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    kind: { type: String, enum: mediaKinds, required: true },
    storage: { type: String, enum: ["S3"], default: "S3", required: true },
    bucket: { type: String, required: true },
    objectKey: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: mediaStatuses,
      default: "PENDING",
      required: true,
    },
  },
  { ...baseSchemaOptions, collection: "media" },
);

mediaSchema.index({ objectKey: 1 }, { unique: true });
mediaSchema.index({ ownerUserId: 1, kind: 1, status: 1 });
mediaSchema.index({ status: 1, createdAt: 1 });

export type MediaDocument = InferSchemaType<typeof mediaSchema>;
export const MediaModel =
  (models.Media as Model<MediaDocument> | undefined) ??
  model<MediaDocument>("Media", mediaSchema);

export { mediaSchema };
