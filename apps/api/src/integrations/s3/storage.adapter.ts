export type UploadIntent = {
  bucket: string;
  objectKey: string;
  mimeType: string;
  sizeBytes: number;
  expiresInSeconds: number;
};

export type StoredObjectMetadata = {
  mimeType?: string;
  sizeBytes?: number;
};

export interface StorageAdapter {
  createUploadUrl(intent: UploadIntent): Promise<string>;
  getObjectMetadata(input: {
    bucket: string;
    objectKey: string;
  }): Promise<StoredObjectMetadata | null>;
  getPublicUrl(objectKey: string): string;
}
