import type { AccountRole } from "@findbuddy/types";

export const authActionTypes = ["VERIFY_EMAIL", "RESET_PASSWORD"] as const;
export type AuthActionType = (typeof authActionTypes)[number];

export type RefreshTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
};

export type AuthActionTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  type: AuthActionType;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
};

export type AccessTokenClaims = {
  userId: string;
  accountRole: AccountRole;
};
