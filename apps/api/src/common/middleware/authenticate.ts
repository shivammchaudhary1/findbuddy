import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import type { AccessTokenService } from "../../modules/auth/token.service.js";

export function authenticate(accessTokens: AccessTokenService): RequestHandler {
  return async (request, _response, next) => {
    const authorization = request.header("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      next(unauthorized());
      return;
    }

    try {
      request.auth = await accessTokens.verify(authorization.slice(7));
      next();
    } catch {
      next(unauthorized());
    }
  };
}

function unauthorized(): AppError {
  return new AppError({
    statusCode: 401,
    code: "AUTH_UNAUTHORIZED",
    message: "Authentication is required",
  });
}
