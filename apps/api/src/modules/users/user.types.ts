import type { AccountRole, AccountStatus } from "@findbuddy/types";

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  accountRole: AccountRole;
  accountStatus: AccountStatus;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = Pick<UserRecord, "email" | "passwordHash">;
