import type { Request, Response } from "express";

import {
  forgotPasswordRequestSchema,
  loginRequestSchema,
  logoutRequestSchema,
  refreshRequestSchema,
  registerRequestSchema,
  resetPasswordRequestSchema,
  verifyEmailRequestSchema,
} from "@findbuddy/validation";
import type { AuthClientType, AuthSessionDto } from "@findbuddy/types";

import { AppError } from "../../common/errors/app-error.js";
import { sendSuccess } from "../../common/response/api-response.js";
import type { Environment } from "../../config/env.js";
import type { AuthService } from "./auth.service.js";
import { createOpaqueToken, safeTokenEquals } from "./token.service.js";

const REFRESH_COOKIE = "findbuddy_refresh";
const CSRF_COOKIE = "findbuddy_csrf";

export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly environment: Environment,
  ) {}

  register = async (request: Request, response: Response): Promise<void> => {
    const input = registerRequestSchema.parse(request.body);
    const result = await this.auth.register(input);
    sendSuccess(response, result, { statusCode: 201 });
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const input = loginRequestSchema.parse(request.body);
    const result = await this.auth.login(input);
    this.deliverSession(response, input.clientType, result);
  };

  refresh = async (request: Request, response: Response): Promise<void> => {
    const input = refreshRequestSchema.parse(request.body);
    const rawToken = this.readRefreshToken(
      request,
      input.clientType,
      input.refreshToken,
    );
    const result = await this.auth.refresh(rawToken);
    this.deliverSession(response, input.clientType, result);
  };

  logout = async (request: Request, response: Response): Promise<void> => {
    const input = logoutRequestSchema.parse(request.body);
    const rawToken = this.readRefreshToken(
      request,
      input.clientType,
      input.refreshToken,
    );
    await this.auth.logout(rawToken);
    if (input.clientType === "WEB") this.clearWebCookies(response);
    sendSuccess(response, { loggedOut: true as const });
  };

  verifyEmail = async (request: Request, response: Response): Promise<void> => {
    const input = verifyEmailRequestSchema.parse(request.body);
    await this.auth.verifyEmail(input.token);
    sendSuccess(response, { verified: true as const });
  };

  forgotPassword = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    const input = forgotPasswordRequestSchema.parse(request.body);
    await this.auth.forgotPassword(input.email);
    sendSuccess(response, { accepted: true as const }, { statusCode: 202 });
  };

  resetPassword = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    const input = resetPasswordRequestSchema.parse(request.body);
    await this.auth.resetPassword(input);
    sendSuccess(response, { reset: true as const });
  };

  private deliverSession(
    response: Response,
    clientType: AuthClientType,
    result: { session: AuthSessionDto; refreshToken: string },
  ): void {
    if (clientType === "MOBILE") {
      sendSuccess(response, {
        ...result.session,
        refreshToken: result.refreshToken,
      });
      return;
    }

    const csrfToken = createOpaqueToken();
    const secure = this.environment.nodeEnv === "production";
    response.cookie(REFRESH_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: this.environment.refreshTokenTtlSeconds * 1000,
    });
    response.cookie(CSRF_COOKIE, csrfToken, {
      httpOnly: false,
      secure,
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: this.environment.refreshTokenTtlSeconds * 1000,
    });
    sendSuccess(response, result.session);
  }

  private readRefreshToken(
    request: Request,
    clientType: AuthClientType,
    bodyToken?: string,
  ): string {
    if (clientType === "MOBILE") {
      if (!bodyToken) throw missingRefreshToken();
      return bodyToken;
    }

    const cookies = parseCookies(request.header("cookie"));
    const refreshToken = cookies.get(REFRESH_COOKIE);
    const csrfCookie = cookies.get(CSRF_COOKIE);
    const csrfHeader = request.header("x-csrf-token");
    if (
      !refreshToken ||
      !csrfCookie ||
      !csrfHeader ||
      !safeTokenEquals(csrfCookie, csrfHeader)
    ) {
      throw new AppError({
        statusCode: 403,
        code: "AUTH_CSRF_INVALID",
        message: "CSRF validation failed",
      });
    }
    return refreshToken;
  }

  private clearWebCookies(response: Response): void {
    const secure = this.environment.nodeEnv === "production";
    const options = {
      httpOnly: true,
      secure,
      sameSite: "strict" as const,
      path: "/api/v1/auth",
    };
    response.clearCookie(REFRESH_COOKIE, options);
    response.clearCookie(CSRF_COOKIE, { ...options, httpOnly: false });
  }
}

function parseCookies(header?: string): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of header?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    try {
      cookies.set(name, decodeURIComponent(value));
    } catch {
      continue;
    }
  }
  return cookies;
}

function missingRefreshToken(): AppError {
  return new AppError({
    statusCode: 401,
    code: "AUTH_INVALID_REFRESH_TOKEN",
    message: "Refresh token is required",
  });
}
