import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type {
  StorageAdapter,
  StoredObjectMetadata,
  UploadIntent,
} from "./storage.adapter.js";

export class S3StorageAdapter implements StorageAdapter {
  private readonly client: S3Client;

  constructor(
    region: string,
    private readonly publicBaseUrl: string,
    client?: S3Client,
  ) {
    this.client = client ?? new S3Client({ region });
  }

  createUploadUrl(intent: UploadIntent): Promise<string> {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: intent.bucket,
        Key: intent.objectKey,
        ContentType: intent.mimeType,
        ContentLength: intent.sizeBytes,
      }),
      { expiresIn: intent.expiresInSeconds },
    );
  }

  async getObjectMetadata(input: {
    bucket: string;
    objectKey: string;
  }): Promise<StoredObjectMetadata | null> {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({ Bucket: input.bucket, Key: input.objectKey }),
      );
      return {
        ...(result.ContentType ? { mimeType: result.ContentType } : {}),
        ...(result.ContentLength === undefined
          ? {}
          : { sizeBytes: result.ContentLength }),
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  getPublicUrl(objectKey: string): string {
    const encodedKey = objectKey
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${this.publicBaseUrl.replace(/\/$/, "")}/${encodedKey}`;
  }
}

function isNotFound(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as {
    name?: unknown;
    $metadata?: { httpStatusCode?: unknown };
  };
  return (
    candidate.name === "NotFound" || candidate.$metadata?.httpStatusCode === 404
  );
}
