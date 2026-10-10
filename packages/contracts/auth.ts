import type { ApiSuccess } from "./api";
import type { AuthSessionDto, AuthUserDto } from "@findbuddy/types";

export type RegisterResponse = ApiSuccess<{
  user: AuthUserDto;
  emailVerificationRequired: true;
}>;

export type LoginResponse = ApiSuccess<AuthSessionDto>;
export type RefreshResponse = ApiSuccess<AuthSessionDto>;
export type VerifyEmailResponse = ApiSuccess<{ verified: true }>;
export type ForgotPasswordResponse = ApiSuccess<{ accepted: true }>;
export type ResetPasswordResponse = ApiSuccess<{ reset: true }>;
export type LogoutResponse = ApiSuccess<{ loggedOut: true }>;
