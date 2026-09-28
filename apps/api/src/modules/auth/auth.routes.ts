import { Router, type RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";

import { AppError } from "../../common/errors/app-error.js";
import type { Environment } from "../../config/env.js";
import { AuthController } from "./auth.controller.js";
import type { AuthService } from "./auth.service.js";

export type AuthRateLimits = {
  register: number;
  login: number;
  recovery: number;
  windowMs: number;
};

const defaultRateLimits: AuthRateLimits = {
  register: 5,
  login: 10,
  recovery: 5,
  windowMs: 15 * 60 * 1000,
};

export function createAuthRouter(options: {
  service: AuthService;
  environment: Environment;
  rateLimits?: Partial<AuthRateLimits>;
}): Router {
  const router = Router();
  const controller = new AuthController(options.service, options.environment);
  const limits = { ...defaultRateLimits, ...options.rateLimits };

  router.post(
    "/register",
    authRateLimit(limits.register, limits.windowMs),
    controller.register,
  );
  router.post(
    "/login",
    authRateLimit(limits.login, limits.windowMs),
    controller.login,
  );
  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);
  router.post("/verify-email", controller.verifyEmail);
  router.post(
    "/forgot-password",
    authRateLimit(limits.recovery, limits.windowMs),
    controller.forgotPassword,
  );
  router.post(
    "/reset-password",
    authRateLimit(limits.recovery, limits.windowMs),
    controller.resetPassword,
  );

  return router;
}

function authRateLimit(max: number, windowMs: number): RequestHandler {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_request, _response, next) => {
      next(
        new AppError({
          statusCode: 429,
          code: "AUTH_RATE_LIMITED",
          message: "Too many authentication attempts; try again later",
        }),
      );
    },
  });
}
