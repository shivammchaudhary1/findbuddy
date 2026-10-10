import { randomUUID } from "node:crypto";

import type {
  MediaDto,
  MediaPresignDto,
  MediaPresignRequest,
} from "@findbuddy/types";

import type { TransactionRunner } from "../../common/database/transaction.js";
import { AppError } from "../../common/errors/app-error.js";
import type { StorageAdapter } from "../../integrations/s3/storage.adapter.js";
import type { ProfileRepository } from "../profiles/profile.repository.js";
import type { MediaRepository } from "./media.repository.js";

const extensionByMimeType: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class MediaService {
  constructor(
    private readonly media: MediaRepository,
    private readonly profiles: ProfileRepository,
    private readonly storage: StorageAdapter,
    private readonly transactions: TransactionRunner,
    private readonly configuration: {
      bucket: string;
      allowedImageTypes: readonly string[];
      maxImageBytes: number;
      presignTtlSeconds: number;
    },
  ) {}

  async presign(
    userId: string,
    input: MediaPresignRequest,
  ): Promise<MediaPresignDto> {
    if (!this.configuration.allowedImageTypes.includes(input.mimeType)) {
      throw new AppError({
        statusCode: 400,
        code: "MEDIA_TYPE_NOT_ALLOWED",
        message: "Image type is not allowed",
      });
    }
    if (input.sizeBytes > this.configuration.maxImageBytes) {
      throw new AppError({
        statusCode: 400,
        code: "MEDIA_SIZE_EXCEEDED",
        message: "Image exceeds the configured size limit",
      });
    }
    if (!(await this.profiles.findByUserId(userId))) {
      throw new AppError({
        statusCode: 409,
        code: "PROFILE_REQUIRED",
        message: "Create a profile before uploading a profile image",
      });
    }

    const extension = extensionByMimeType[input.mimeType] ?? "image";
    const objectKey = `users/${userId}/profile/${randomUUID()}.${extension}`;
    const record = await this.media.createPending({
      ownerUserId: userId,
      kind: input.kind,
      bucket: this.configuration.bucket,
      objectKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });
    const uploadUrl = await this.storage.createUploadUrl({
      bucket: record.bucket,
      objectKey: record.objectKey,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
      expiresInSeconds: this.configuration.presignTtlSeconds,
    });
    return {
      mediaId: record.id,
      uploadUrl,
      objectKey,
      expiresInSeconds: this.configuration.presignTtlSeconds,
      requiredHeaders: { "content-type": record.mimeType },
    };
  }

  async confirm(userId: string, mediaId: string): Promise<MediaDto> {
    const media = await this.media.findById(mediaId);
    if (!media) throw mediaNotFound();
    if (media.ownerUserId !== userId) {
      throw new AppError({
        statusCode: 403,
        code: "MEDIA_FORBIDDEN",
        message: "You do not own this media",
      });
    }
    if (media.status !== "PENDING") {
      throw new AppError({
        statusCode: 409,
        code: "MEDIA_INVALID_STATE",
        message: "Only pending media can be confirmed",
      });
    }
    if (!(await this.profiles.findByUserId(userId))) {
      throw new AppError({
        statusCode: 409,
        code: "PROFILE_REQUIRED",
        message: "Create a profile before confirming a profile image",
      });
    }

    const metadata = await this.storage.getObjectMetadata({
      bucket: media.bucket,
      objectKey: media.objectKey,
    });
    if (
      !metadata ||
      metadata.mimeType !== media.mimeType ||
      metadata.sizeBytes !== media.sizeBytes
    ) {
      throw new AppError({
        statusCode: 409,
        code: "MEDIA_METADATA_MISMATCH",
        message: "Uploaded object does not match the authorized upload",
      });
    }

    const active = await this.transactions.run(async (session) => {
      const activated = await this.media.activatePending(
        media.id,
        userId,
        session,
      );
      if (!activated) {
        throw new AppError({
          statusCode: 409,
          code: "MEDIA_INVALID_STATE",
          message: "Media is no longer pending",
        });
      }
      const assigned = await this.profiles.setProfilePhoto(
        userId,
        activated.id,
        session,
      );
      if (!assigned) {
        throw new AppError({
          statusCode: 409,
          code: "PROFILE_REQUIRED",
          message: "Profile is no longer available",
        });
      }
      return activated;
    });

    return {
      id: active.id,
      kind: active.kind,
      status: "ACTIVE",
      url: this.storage.getPublicUrl(active.objectKey),
    };
  }
}

function mediaNotFound(): AppError {
  return new AppError({
    statusCode: 404,
    code: "MEDIA_NOT_FOUND",
    message: "Media was not found",
  });
}
