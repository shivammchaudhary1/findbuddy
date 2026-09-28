import { randomUUID } from "node:crypto";

import type {
  AuthSessionDto,
  AuthUserDto,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@findbuddy/types";

import { AppError } from "../../common/errors/app-error.js";
import type { UserRepository } from "../users/user.repository.js";
import type { UserRecord } from "../users/user.types.js";
import type {
  AuthActionTokenRepository,
  RefreshTokenRepository,
} from "./auth.repository.js";
import type { PasswordHasher } from "./password.service.js";
import {
  createOpaqueToken,
  hashOpaqueToken,
  type AccessTokenService,
} from "./token.service.js";

export interface AuthTokenNotifier {
  sendEmailVerification(input: { email: string; token: string }): Promise<void>;
  sendPasswordReset(input: { email: string; token: string }): Promise<void>;
}

export type AuthServiceOptions = {
  users: UserRepository;
  refreshTokens: RefreshTokenRepository;
  actionTokens: AuthActionTokenRepository;
  passwordHasher: PasswordHasher;
  accessTokens: AccessTokenService;
  notifier: AuthTokenNotifier;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  emailVerificationTtlSeconds: number;
  passwordResetTtlSeconds: number;
  now?: () => Date;
};

export class AuthService {
  private readonly now: () => Date;

  constructor(private readonly options: AuthServiceOptions) {
    this.now = options.now ?? (() => new Date());
  }

  async register(input: RegisterRequest): Promise<{
    user: AuthUserDto;
    emailVerificationRequired: true;
  }> {
    const existing = await this.options.users.findByEmail(input.email);
    if (existing) throw emailAlreadyExists();

    const passwordHash = await this.options.passwordHasher.hash(input.password);
    let user: UserRecord;
    try {
      user = await this.options.users.create({
        email: input.email,
        passwordHash,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) throw emailAlreadyExists();
      throw error;
    }

    await this.issueActionToken(user, "VERIFY_EMAIL");
    return { user: toAuthUser(user), emailVerificationRequired: true };
  }

  async login(input: LoginRequest): Promise<{
    session: AuthSessionDto;
    refreshToken: string;
  }> {
    const user = await this.options.users.findByEmail(input.email);
    if (
      !user ||
      !(await this.options.passwordHasher.verify(
        user.passwordHash,
        input.password,
      ))
    ) {
      throw invalidCredentials();
    }
    this.assertCanAuthenticate(user);
    return this.createSession(user, randomUUID());
  }

  async refresh(rawToken: string): Promise<{
    session: AuthSessionDto;
    refreshToken: string;
  }> {
    const now = this.now();
    const token = await this.options.refreshTokens.findByHash(
      hashOpaqueToken(rawToken),
    );
    if (!token) throw invalidRefreshToken();

    if (token.revokedAt) {
      await this.options.refreshTokens.revokeFamily(token.familyId, now);
      throw new AppError({
        statusCode: 401,
        code: "AUTH_REFRESH_REUSE_DETECTED",
        message: "Refresh token reuse was detected",
      });
    }
    if (token.expiresAt <= now) {
      await this.options.refreshTokens.revokeIfActive(token.id, now);
      throw new AppError({
        statusCode: 401,
        code: "AUTH_TOKEN_EXPIRED",
        message: "Refresh token has expired",
      });
    }

    const revoked = await this.options.refreshTokens.revokeIfActive(
      token.id,
      now,
    );
    if (!revoked) {
      await this.options.refreshTokens.revokeFamily(token.familyId, now);
      throw new AppError({
        statusCode: 401,
        code: "AUTH_REFRESH_REUSE_DETECTED",
        message: "Refresh token reuse was detected",
      });
    }

    const user = await this.options.users.findById(token.userId);
    if (!user) throw invalidRefreshToken();
    this.assertCanAuthenticate(user);
    return this.createSession(user, token.familyId);
  }

  async logout(rawToken: string): Promise<void> {
    const token = await this.options.refreshTokens.findByHash(
      hashOpaqueToken(rawToken),
    );
    if (token && !token.revokedAt) {
      await this.options.refreshTokens.revokeIfActive(token.id, this.now());
    }
  }

  async verifyEmail(rawToken: string): Promise<void> {
    const token = await this.options.actionTokens.consumeActive(
      hashOpaqueToken(rawToken),
      "VERIFY_EMAIL",
      this.now(),
    );
    if (!token) throw invalidActionToken();
    await this.options.users.markEmailVerified(token.userId, this.now());
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.options.users.findByEmail(email);
    if (!user || user.accountStatus === "DELETED") return;
    await this.issueActionToken(user, "RESET_PASSWORD");
  }

  async resetPassword(input: ResetPasswordRequest): Promise<void> {
    const now = this.now();
    const token = await this.options.actionTokens.consumeActive(
      hashOpaqueToken(input.token),
      "RESET_PASSWORD",
      now,
    );
    if (!token) throw invalidActionToken();

    const passwordHash = await this.options.passwordHasher.hash(input.password);
    await this.options.users.updatePassword(token.userId, passwordHash);
    await this.options.refreshTokens.revokeAllForUser(token.userId, now);
  }

  private async createSession(
    user: UserRecord,
    familyId: string,
  ): Promise<{ session: AuthSessionDto; refreshToken: string }> {
    const now = this.now();
    const refreshToken = createOpaqueToken();
    await this.options.refreshTokens.create({
      userId: user.id,
      tokenHash: hashOpaqueToken(refreshToken),
      familyId,
      expiresAt: new Date(
        now.getTime() + this.options.refreshTokenTtlSeconds * 1000,
      ),
    });
    const accessToken = await this.options.accessTokens.sign({
      userId: user.id,
      accountRole: user.accountRole,
    });
    return {
      refreshToken,
      session: {
        accessToken,
        expiresInSeconds: this.options.accessTokenTtlSeconds,
        user: toAuthUser(user),
      },
    };
  }

  private async issueActionToken(
    user: UserRecord,
    type: "VERIFY_EMAIL" | "RESET_PASSWORD",
  ): Promise<void> {
    const rawToken = createOpaqueToken();
    const ttl =
      type === "VERIFY_EMAIL"
        ? this.options.emailVerificationTtlSeconds
        : this.options.passwordResetTtlSeconds;
    await this.options.actionTokens.create({
      userId: user.id,
      tokenHash: hashOpaqueToken(rawToken),
      type,
      expiresAt: new Date(this.now().getTime() + ttl * 1000),
    });
    if (type === "VERIFY_EMAIL") {
      await this.options.notifier.sendEmailVerification({
        email: user.email,
        token: rawToken,
      });
    } else {
      await this.options.notifier.sendPasswordReset({
        email: user.email,
        token: rawToken,
      });
    }
  }

  private assertCanAuthenticate(user: UserRecord): void {
    if (!user.emailVerifiedAt) {
      throw new AppError({
        statusCode: 403,
        code: "AUTH_EMAIL_NOT_VERIFIED",
        message: "Email verification is required",
      });
    }
    if (user.accountStatus === "SUSPENDED") {
      throw new AppError({
        statusCode: 403,
        code: "ACCOUNT_SUSPENDED",
        message: "Account is suspended",
      });
    }
    if (user.accountStatus === "BLOCKED") {
      throw new AppError({
        statusCode: 403,
        code: "ACCOUNT_BLOCKED",
        message: "Account is blocked",
      });
    }
    if (user.accountStatus === "DELETED") throw invalidCredentials();
  }
}

function toAuthUser(user: UserRecord): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    accountRole: user.accountRole,
    accountStatus: user.accountStatus,
    emailVerified: Boolean(user.emailVerifiedAt),
  };
}

function invalidCredentials(): AppError {
  return new AppError({
    statusCode: 401,
    code: "AUTH_INVALID_CREDENTIALS",
    message: "Email or password is incorrect",
  });
}

function invalidRefreshToken(): AppError {
  return new AppError({
    statusCode: 401,
    code: "AUTH_INVALID_REFRESH_TOKEN",
    message: "Refresh token is invalid",
  });
}

function invalidActionToken(): AppError {
  return new AppError({
    statusCode: 400,
    code: "AUTH_INVALID_OR_EXPIRED_TOKEN",
    message: "Token is invalid or expired",
  });
}

function emailAlreadyExists(): AppError {
  return new AppError({
    statusCode: 409,
    code: "AUTH_EMAIL_ALREADY_EXISTS",
    message: "An account already exists for this email",
  });
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11_000
  );
}
