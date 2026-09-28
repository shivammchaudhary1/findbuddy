import type {
  PrivateProfileDto,
  PublicProfileDto,
  UpdateProfileRequest,
} from "@findbuddy/types";

import { AppError } from "../../common/errors/app-error.js";
import type { StorageAdapter } from "../../integrations/s3/storage.adapter.js";
import type { MediaRepository } from "../media/media.repository.js";
import type { UserRepository } from "../users/user.repository.js";
import { toPrivateProfile, toPublicProfile } from "./profile.mapper.js";
import type { ProfileRepository } from "./profile.repository.js";
import type { ProfileRecord } from "./profile.types.js";

export class ProfileService {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly users: UserRepository,
    private readonly media: MediaRepository,
    private readonly storage: StorageAdapter,
  ) {}

  async getMe(userId: string): Promise<{ profile: PrivateProfileDto | null }> {
    const user = await this.users.findById(userId);
    if (!user) throw profileNotFound();
    const profile = await this.profiles.findByUserId(userId);
    if (!profile) return { profile: null };
    return {
      profile: toPrivateProfile(
        user,
        profile,
        await this.resolvePhotoUrl(profile),
      ),
    };
  }

  async updateMe(
    userId: string,
    input: UpdateProfileRequest,
  ): Promise<PrivateProfileDto> {
    const user = await this.users.findById(userId);
    if (!user) throw profileNotFound();
    const existing = await this.profiles.findByUserId(userId);
    if (!existing && !input.name) {
      throw new AppError({
        statusCode: 400,
        code: "PROFILE_NAME_REQUIRED",
        message: "Name is required when creating a profile",
      });
    }
    const profile = await this.profiles.upsertForUser(userId, input);
    return toPrivateProfile(user, profile, await this.resolvePhotoUrl(profile));
  }

  async getPublic(userId: string): Promise<PublicProfileDto> {
    const [user, profile] = await Promise.all([
      this.users.findById(userId),
      this.profiles.findByUserId(userId),
    ]);
    if (!user || user.accountStatus !== "ACTIVE" || !profile) {
      throw profileNotFound();
    }
    return toPublicProfile(profile, await this.resolvePhotoUrl(profile));
  }

  private async resolvePhotoUrl(
    profile: ProfileRecord,
  ): Promise<string | undefined> {
    if (!profile.profilePhotoMediaId) return undefined;
    const media = await this.media.findActiveById(
      profile.profilePhotoMediaId,
      profile.userId,
    );
    return media ? this.storage.getPublicUrl(media.objectKey) : undefined;
  }
}

function profileNotFound(): AppError {
  return new AppError({
    statusCode: 404,
    code: "PROFILE_NOT_FOUND",
    message: "Profile was not found",
  });
}
