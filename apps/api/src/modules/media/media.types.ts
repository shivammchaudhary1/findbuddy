export type MediaRecord = {
  id: string;
  ownerUserId: string;
  kind: "PROFILE_IMAGE";
  storage: "S3";
  bucket: string;
  objectKey: string;
  mimeType: string;
  sizeBytes: number;
  status: "PENDING" | "ACTIVE" | "DELETED";
  createdAt: Date;
  updatedAt: Date;
};
