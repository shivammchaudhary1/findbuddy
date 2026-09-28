import type {
  PrivateProfileDto,
  PublicProfileDto,
  UpdateProfileRequest,
} from "@findbuddy/types";

import type { ApiSuccess } from "./api";

export type UpdateProfileBody = UpdateProfileRequest;
export type GetMeResponse = ApiSuccess<{ profile: PrivateProfileDto | null }>;
export type GetPublicProfileResponse = ApiSuccess<PublicProfileDto>;
export type UpdateProfileResponse = ApiSuccess<PrivateProfileDto>;
