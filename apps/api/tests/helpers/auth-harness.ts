import { vi } from "vitest";

import type { AccountStatus } from "@findbuddy/types";

import type {
  AuthActionTokenRepository,
  RefreshTokenRepository,
} from "../../src/modules/auth/auth.repository.js";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import type {
  AuthActionTokenRecord,
  AuthActionType,
  RefreshTokenRecord,
} from "../../src/modules/auth/auth.types.js";
import type { PasswordHasher } from "../../src/modules/auth/password.service.js";
import type { AccessTokenService } from "../../src/modules/auth/token.service.js";
import type { UserRepository } from "../../src/modules/users/user.repository.js";
import type {
  CreateUserInput,
  UserRecord,
} from "../../src/modules/users/user.types.js";

export class MemoryUserRepository implements UserRepository {
  readonly records: UserRecord[] = [];

  async create(input: CreateUserInput): Promise<UserRecord> {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const record: UserRecord = {
      id: `user-${this.records.length + 1}`,
      ...input,
      accountRole: "USER",
      accountStatus: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };
    this.records.push(record);
    return { ...record };
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.clone(this.records.find((user) => user.email === email));
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.clone(this.records.find((user) => user.id === id));
  }

  async markEmailVerified(id: string, verifiedAt: Date): Promise<void> {
    const user = this.records.find((record) => record.id === id);
    if (user) user.emailVerifiedAt = verifiedAt;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const user = this.records.find((record) => record.id === id);
    if (user) user.passwordHash = passwordHash;
  }

  setStatus(id: string, status: AccountStatus): void {
    const user = this.records.find((record) => record.id === id);
    if (user) user.accountStatus = status;
  }

  private clone(user?: UserRecord): UserRecord | null {
    return user ? { ...user } : null;
  }
}

export class MemoryRefreshTokenRepository implements RefreshTokenRepository {
  readonly records: RefreshTokenRecord[] = [];

  async create(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRecord> {
    const record: RefreshTokenRecord = {
      id: `refresh-${this.records.length + 1}`,
      ...input,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    this.records.push(record);
    return { ...record };
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const token = this.records.find((record) => record.tokenHash === tokenHash);
    return token ? { ...token } : null;
  }

  async revokeIfActive(id: string, revokedAt: Date): Promise<boolean> {
    const token = this.records.find((record) => record.id === id);
    if (!token || token.revokedAt) return false;
    token.revokedAt = revokedAt;
    return true;
  }

  async revokeFamily(familyId: string, revokedAt: Date): Promise<void> {
    for (const token of this.records) {
      if (token.familyId === familyId && !token.revokedAt) {
        token.revokedAt = revokedAt;
      }
    }
  }

  async revokeAllForUser(userId: string, revokedAt: Date): Promise<void> {
    for (const token of this.records) {
      if (token.userId === userId && !token.revokedAt) {
        token.revokedAt = revokedAt;
      }
    }
  }
}

export class MemoryActionTokenRepository implements AuthActionTokenRepository {
  readonly records: AuthActionTokenRecord[] = [];

  async create(input: {
    userId: string;
    tokenHash: string;
    type: AuthActionType;
    expiresAt: Date;
  }): Promise<void> {
    this.records.push({
      id: `action-${this.records.length + 1}`,
      ...input,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  }

  async consumeActive(
    tokenHash: string,
    type: AuthActionType,
    consumedAt: Date,
  ): Promise<AuthActionTokenRecord | null> {
    const token = this.records.find(
      (record) =>
        record.tokenHash === tokenHash &&
        record.type === type &&
        !record.consumedAt &&
        record.expiresAt > consumedAt,
    );
    if (!token) return null;
    token.consumedAt = consumedAt;
    return { ...token };
  }
}

export function createAuthHarness() {
  let currentTime = new Date("2026-01-10T12:00:00.000Z");
  const users = new MemoryUserRepository();
  const refreshTokens = new MemoryRefreshTokenRepository();
  const actionTokens = new MemoryActionTokenRepository();
  const notifier = {
    sendEmailVerification: vi.fn(
      async (input: { email: string; token: string }) => {
        void input;
      },
    ),
    sendPasswordReset: vi.fn(
      async (input: { email: string; token: string }) => {
        void input;
      },
    ),
  };
  const passwordHasher: PasswordHasher = {
    hash: vi.fn(async (password: string) => `hashed:${password}`),
    verify: vi.fn(
      async (hash: string, password: string) => hash === `hashed:${password}`,
    ),
  };
  const accessTokens: AccessTokenService = {
    sign: vi.fn(async ({ userId }) => `access:${userId}`),
    verify: vi.fn(async (token: string) => {
      if (!token.startsWith("access:")) throw new Error("invalid");
      return { userId: token.slice(7), accountRole: "USER" as const };
    }),
  };
  const service = new AuthService({
    users,
    refreshTokens,
    actionTokens,
    notifier,
    passwordHasher,
    accessTokens,
    accessTokenTtlSeconds: 900,
    refreshTokenTtlSeconds: 3600,
    emailVerificationTtlSeconds: 1800,
    passwordResetTtlSeconds: 900,
    now: () => new Date(currentTime),
  });

  return {
    service,
    users,
    refreshTokens,
    actionTokens,
    notifier,
    passwordHasher,
    accessTokens,
    setTime(value: Date) {
      currentTime = value;
    },
  };
}

export type AuthHarness = ReturnType<typeof createAuthHarness>;

export async function addVerifiedUser(
  harness: AuthHarness,
  options: { email?: string; password?: string } = {},
): Promise<UserRecord> {
  const password = options.password ?? "StrongPassword1!";
  const user = await harness.users.create({
    email: options.email ?? "verified@example.com",
    passwordHash: `hashed:${password}`,
  });
  await harness.users.markEmailVerified(
    user.id,
    new Date("2026-01-02T00:00:00.000Z"),
  );
  return (await harness.users.findById(user.id))!;
}
