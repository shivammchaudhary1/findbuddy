import type { ApiSuccess } from "./api";
import type {
  MediaDto,
  MediaPresignDto,
  MediaPresignRequest,
} from "@findbuddy/types";

export type MediaPresignBody = MediaPresignRequest;
export type MediaPresignResponse = ApiSuccess<MediaPresignDto>;
export type MediaConfirmResponse = ApiSuccess<MediaDto>;
