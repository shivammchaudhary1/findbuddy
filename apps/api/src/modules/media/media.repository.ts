import { Types, type ClientSession, type Model } from "mongoose";

import { MediaModel, type MediaDocument } from "./media.model.js";
import type { MediaRecord } from "./media.types.js";

export interface MediaRepository {
  createPending(input: {
    ownerUserId: string;
    kind: "PROFILE_IMAGE";
    bucket: string;
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<MediaRecord>;
  findById(id: string): Promise<MediaRecord | null>;
  findActiveById(id: string, ownerUserId: string): Promise<MediaRecord | null>;
  activatePending(
    id: string,
    ownerUserId: string,
    session?: ClientSession,
  ): Promise<MediaRecord | null>;
}

type MediaPersistence = MediaDocument & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export class MongooseMediaRepository implements MediaRepository {
  constructor(private readonly model: Model<MediaDocument> = MediaModel) {}

  async createPending(input: {
    ownerUserId: string;
    kind: "PROFILE_IMAGE";
    bucket: string;
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<MediaRecord> {
    const media = await this.model.create({
      ...input,
      storage: "S3",
      status: "PENDING",
    });
    return toMediaRecord(media.toObject() as MediaPersistence);
  }

  async findById(id: string): Promise<MediaRecord | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const media = await this.model.findById(id).lean<MediaPersistence>();
    return media ? toMediaRecord(media) : null;
  }

  async findActiveById(
    id: string,
    ownerUserId: string,
  ): Promise<MediaRecord | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const media = await this.model
      .findOne({ _id: id, ownerUserId, status: "ACTIVE" })
      .lean<MediaPersistence>();
    return media ? toMediaRecord(media) : null;
  }

  async activatePending(
    id: string,
    ownerUserId: string,
    session?: ClientSession,
  ): Promise<MediaRecord | null> {
    const media = await this.model
      .findOneAndUpdate(
        { _id: id, ownerUserId, status: "PENDING" },
        { $set: { status: "ACTIVE" } },
        { new: true, runValidators: true, session },
      )
      .lean<MediaPersistence>();
    return media ? toMediaRecord(media) : null;
  }
}

function toMediaRecord(media: MediaPersistence): MediaRecord {
  return {
    id: media._id.toString(),
    ownerUserId: media.ownerUserId.toString(),
    kind: media.kind,
    storage: media.storage,
    bucket: media.bucket,
    objectKey: media.objectKey,
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    status: media.status,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
  };
}
