import { describe, expect, it } from "vitest";

import { mediaPresignRequestSchema } from "@findbuddy/validation";

import { createProfileMediaHarness } from "./helpers/profile-media-harness.js";

describe("MediaService presign", () => {
  it("creates a pending record and generated S3 key without accepting filenames", async () => {
    const harness = await createProfileMediaHarness();
    await harness.profileService.updateMe(harness.user.id, { name: "Riya" });

    const result = await harness.mediaService.presign(harness.user.id, {
      kind: "PROFILE_IMAGE",
      mimeType: "image/jpeg",
      sizeBytes: 1024,
    });

    expect(result).toMatchObject({
      mediaId: "media-1",
      uploadUrl: "https://upload.findbuddy.test/signed",
      expiresInSeconds: 300,
      requiredHeaders: { "content-type": "image/jpeg" },
    });
    expect(result.objectKey).toMatch(
      new RegExp(`^users/${harness.user.id}/profile/[0-9a-f-]+\\.jpg$`),
    );
    expect(harness.media.records[0]).toMatchObject({
      status: "PENDING",
      ownerUserId: harness.user.id,
      objectKey: result.objectKey,
    });
    expect(harness.storage.createUploadUrl).toHaveBeenCalledWith(
      expect.objectContaining({ objectKey: result.objectKey, sizeBytes: 1024 }),
    );
    expect(() =>
      mediaPresignRequestSchema.parse({
        mimeType: "image/jpeg",
        sizeBytes: 1024,
        filename: "user-controlled.jpg",
      }),
    ).toThrow();
  });

  it("enforces profile, MIME type, and configured size limits", async () => {
    const harness = await createProfileMediaHarness();
    await expect(
      harness.mediaService.presign(harness.user.id, {
        kind: "PROFILE_IMAGE",
        mimeType: "image/jpeg",
        sizeBytes: 1024,
      }),
    ).rejects.toMatchObject({ code: "PROFILE_REQUIRED" });
    await harness.profileService.updateMe(harness.user.id, { name: "Riya" });

    await expect(
      harness.mediaService.presign(harness.user.id, {
        kind: "PROFILE_IMAGE",
        mimeType: "image/gif",
        sizeBytes: 1024,
      }),
    ).rejects.toMatchObject({ code: "MEDIA_TYPE_NOT_ALLOWED" });
    await expect(
      harness.mediaService.presign(harness.user.id, {
        kind: "PROFILE_IMAGE",
        mimeType: "image/png",
        sizeBytes: 5 * 1024 * 1024 + 1,
      }),
    ).rejects.toMatchObject({ code: "MEDIA_SIZE_EXCEEDED" });
  });
});

describe("MediaService confirm", () => {
  it("verifies remote metadata, activates owned media, and assigns the profile photo", async () => {
    const harness = await createProfileMediaHarness();
    await harness.profileService.updateMe(harness.user.id, { name: "Riya" });
    const presigned = await harness.mediaService.presign(harness.user.id, {
      kind: "PROFILE_IMAGE",
      mimeType: "image/webp",
      sizeBytes: 2048,
    });
    harness.setObjectMetadata({ mimeType: "image/webp", sizeBytes: 2048 });

    const confirmed = await harness.mediaService.confirm(
      harness.user.id,
      presigned.mediaId,
    );
    expect(confirmed).toEqual({
      id: "media-1",
      kind: "PROFILE_IMAGE",
      status: "ACTIVE",
      url: `https://media.findbuddy.test/${presigned.objectKey}`,
    });
    expect(harness.media.records[0]?.status).toBe("ACTIVE");
    expect(harness.profiles.records[0]?.profilePhotoMediaId).toBe("media-1");

    const publicProfile = await harness.profileService.getPublic(
      harness.user.id,
    );
    expect(publicProfile.profilePhotoUrl).toBe(confirmed.url);
  });

  it("rejects missing objects and metadata mismatches without activation", async () => {
    const harness = await createProfileMediaHarness();
    await harness.profileService.updateMe(harness.user.id, { name: "Riya" });
    const presigned = await harness.mediaService.presign(harness.user.id, {
      kind: "PROFILE_IMAGE",
      mimeType: "image/png",
      sizeBytes: 2048,
    });

    harness.setObjectMetadata(null);
    await expect(
      harness.mediaService.confirm(harness.user.id, presigned.mediaId),
    ).rejects.toMatchObject({ code: "MEDIA_METADATA_MISMATCH" });
    harness.setObjectMetadata({ mimeType: "image/png", sizeBytes: 1024 });
    await expect(
      harness.mediaService.confirm(harness.user.id, presigned.mediaId),
    ).rejects.toMatchObject({ code: "MEDIA_METADATA_MISMATCH" });
    expect(harness.media.records[0]?.status).toBe("PENDING");
  });

  it("enforces ownership and pending-to-active state", async () => {
    const harness = await createProfileMediaHarness();
    await harness.profileService.updateMe(harness.user.id, { name: "Riya" });
    const presigned = await harness.mediaService.presign(harness.user.id, {
      kind: "PROFILE_IMAGE",
      mimeType: "image/jpeg",
      sizeBytes: 1024,
    });
    harness.setObjectMetadata({ mimeType: "image/jpeg", sizeBytes: 1024 });

    await expect(
      harness.mediaService.confirm("another-user", presigned.mediaId),
    ).rejects.toMatchObject({ code: "MEDIA_FORBIDDEN" });
    await harness.mediaService.confirm(harness.user.id, presigned.mediaId);
    await expect(
      harness.mediaService.confirm(harness.user.id, presigned.mediaId),
    ).rejects.toMatchObject({ code: "MEDIA_INVALID_STATE" });
  });
});
