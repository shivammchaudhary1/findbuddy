import { vi } from "vitest";

import type { TransactionRunner } from "../../src/common/database/transaction.js";
import type {
  StorageAdapter,
  StoredObjectMetadata,
} from "../../src/integrations/s3/storage.adapter.js";
import type { MediaRepository } from "../../src/modules/media/media.repository.js";
import { MediaService } from "../../src/modules/media/media.service.js";
import type { MediaRecord } from "../../src/modules/media/media.types.js";
import type { ProfileRepository } from "../../src/modules/profiles/profile.repository.js";
import { ProfileService } from "../../src/modules/profiles/profile.service.js";
import type {
  ProfileRecord,
  ProfileUpdate,
} from "../../src/modules/profiles/profile.types.js";
import { addVerifiedUser, createAuthHarness } from "./auth-harness.js";

export class MemoryProfileRepository implements ProfileRepository {
  readonly records: ProfileRecord[] = [];

  async findByUserId(userId: string): Promise<ProfileRecord | null> {
    const profile = this.records.find((record) => record.userId === userId);
    return profile ? cloneProfile(profile) : null;
  }

  async upsertForUser(
    userId: string,
    update: ProfileUpdate,
  ): Promise<ProfileRecord> {
    let profile = this.records.find((record) => record.userId === userId);
    if (!profile) {
      profile = {
        id: `profile-${this.records.length + 1}`,
        userId,
        name: update.name!,
        interests: [],
        languages: [],
        intent: "BOTH",
        averageRating: 0,
        ratingCount: 0,
        isIdentityVerified: false,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      };
      this.records.push(profile);
    }
    Object.assign(profile, update, {
      interests: update.interests ? [...update.interests] : profile.interests,
      languages: update.languages ? [...update.languages] : profile.languages,
    });
    return cloneProfile(profile);
  }

  async setProfilePhoto(userId: string, mediaId: string): Promise<boolean> {
    const profile = this.records.find((record) => record.userId === userId);
    if (!profile) return false;
    profile.profilePhotoMediaId = mediaId;
    return true;
  }
}

export class MemoryMediaRepository implements MediaRepository {
  readonly records: MediaRecord[] = [];

  async createPending(input: {
    ownerUserId: string;
    kind: "PROFILE_IMAGE";
    bucket: string;
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<MediaRecord> {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const record: MediaRecord = {
      id: `media-${this.records.length + 1}`,
      ...input,
      storage: "S3",
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };
    this.records.push(record);
    return { ...record };
  }

  async findById(id: string): Promise<MediaRecord | null> {
    const media = this.records.find((record) => record.id === id);
    return media ? { ...media } : null;
  }

  async findActiveById(
    id: string,
    ownerUserId: string,
  ): Promise<MediaRecord | null> {
    const media = this.records.find(
      (record) =>
        record.id === id &&
        record.ownerUserId === ownerUserId &&
        record.status === "ACTIVE",
    );
    return media ? { ...media } : null;
  }

  async activatePending(
    id: string,
    ownerUserId: string,
  ): Promise<MediaRecord | null> {
    const media = this.records.find(
      (record) =>
        record.id === id &&
        record.ownerUserId === ownerUserId &&
        record.status === "PENDING",
    );
    if (!media) return null;
    media.status = "ACTIVE";
    return { ...media };
  }
}

export async function createProfileMediaHarness() {
  const auth = createAuthHarness();
  const user = await addVerifiedUser(auth);
  const profiles = new MemoryProfileRepository();
  const media = new MemoryMediaRepository();
  let objectMetadata: StoredObjectMetadata | null = null;
  const storage: StorageAdapter & {
    createUploadUrl: ReturnType<typeof vi.fn>;
    getObjectMetadata: ReturnType<typeof vi.fn>;
  } = {
    createUploadUrl: vi.fn(async () => "https://upload.findbuddy.test/signed"),
    getObjectMetadata: vi.fn(async () => objectMetadata),
    getPublicUrl: (objectKey) => `https://media.findbuddy.test/${objectKey}`,
  };
  const transactions: TransactionRunner = {
    run: (work) => work(undefined),
  };
  const profileService = new ProfileService(
    profiles,
    auth.users,
    media,
    storage,
  );
  const mediaService = new MediaService(
    media,
    profiles,
    storage,
    transactions,
    {
      bucket: "findbuddy-test-media",
      allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
      maxImageBytes: 5 * 1024 * 1024,
      presignTtlSeconds: 300,
    },
  );

  return {
    auth,
    user,
    profiles,
    media,
    storage,
    profileService,
    mediaService,
    setObjectMetadata(value: StoredObjectMetadata | null) {
      objectMetadata = value;
    },
  };
}

function cloneProfile(profile: ProfileRecord): ProfileRecord {
  return {
    ...profile,
    interests: [...profile.interests],
    languages: [...profile.languages],
  };
}
