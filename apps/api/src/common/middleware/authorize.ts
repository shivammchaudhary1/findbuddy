import type { Request, RequestHandler } from "express";

import type { AccountRole } from "@findbuddy/types";

import { AppError } from "../errors/app-error.js";

export function requireRole(...allowedRoles: AccountRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth || !allowedRoles.includes(request.auth.accountRole)) {
      next(forbidden());
      return;
    }
    next();
  };
}

export function requireOwnership(
  resolveOwnerId: (request: Request) => string | undefined,
  options: { allowRoles?: readonly AccountRole[] } = {},
): RequestHandler {
  return (request, _response, next) => {
    if (
      !request.auth ||
      (request.auth.userId !== resolveOwnerId(request) &&
        !options.allowRoles?.includes(request.auth.accountRole))
    ) {
      next(forbidden());
      return;
    }
    next();
  };
}

function forbidden(): AppError {
  return new AppError({
    statusCode: 403,
    code: "AUTH_FORBIDDEN",
    message: "You do not have permission to perform this action",
  });
}
