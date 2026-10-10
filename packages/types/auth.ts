import type { z } from "zod";

import type { accountRoles, accountStatuses } from "@findbuddy/constants";
import type {
  authClientTypes,
  forgotPasswordRequestSchema,
  loginRequestSchema,
  logoutRequestSchema,
  refreshRequestSchema,
  registerRequestSchema,
  resetPasswordRequestSchema,
  verifyEmailRequestSchema,
} from "@findbuddy/validation";

export type AccountRole = (typeof accountRoles)[number];
export type AccountStatus = (typeof accountStatuses)[number];
export type AuthClientType = (typeof authClientTypes)[number];

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

export type AuthUserDto = {
  id: string;
  email: string;
  accountRole: AccountRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
};

export type AuthSessionDto = {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthUserDto;
  refreshToken?: string;
};

export type AuthPrincipal = {
  userId: string;
  accountRole: AccountRole;
};
