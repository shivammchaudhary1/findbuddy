import type { Logger } from "pino";

import type { Environment } from "../../config/env.js";
import { MongooseUserRepository } from "../users/user.repository.js";
import {
  MongooseAuthActionTokenRepository,
  MongooseRefreshTokenRepository,
} from "./auth.repository.js";
import { createAuthRouter } from "./auth.routes.js";
import { AuthService, type AuthTokenNotifier } from "./auth.service.js";
import { argon2PasswordHasher } from "./password.service.js";
import { createAccessTokenService } from "./token.service.js";

export function createAuthModule(
  environment: Environment,
  logger: Logger,
): ReturnType<typeof createAuthRouter> {
  const users = new MongooseUserRepository();
  const accessTokens = createAccessTokenService({
    secret: environment.jwtAccessSecret,
    ttlSeconds: environment.jwtAccessTtlSeconds,
    issuer: environment.jwtIssuer,
    audience: environment.jwtAudience,
  });
  const notifier: AuthTokenNotifier = {
    sendEmailVerification: async () => {
      logger.info("email verification dispatch requested");
    },
    sendPasswordReset: async () => {
      logger.info("password reset dispatch requested");
    },
  };
  const service = new AuthService({
    users,
    refreshTokens: new MongooseRefreshTokenRepository(),
    actionTokens: new MongooseAuthActionTokenRepository(),
    passwordHasher: argon2PasswordHasher,
    accessTokens,
    notifier,
    accessTokenTtlSeconds: environment.jwtAccessTtlSeconds,
    refreshTokenTtlSeconds: environment.refreshTokenTtlSeconds,
    emailVerificationTtlSeconds: environment.emailVerificationTtlSeconds,
    passwordResetTtlSeconds: environment.passwordResetTtlSeconds,
  });
  return createAuthRouter({ service, environment });
}
