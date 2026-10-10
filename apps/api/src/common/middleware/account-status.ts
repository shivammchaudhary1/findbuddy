import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import type { UserRepository } from "../../modules/users/user.repository.js";

export function requireActiveAccount(users: UserRepository): RequestHandler {
  return async (request, _response, next) => {
    const userId = request.auth?.userId;
    if (!userId) {
      next(
        new AppError({
          statusCode: 401,
          code: "AUTH_UNAUTHORIZED",
          message: "Authentication is required",
        }),
      );
      return;
    }

    const user = await users.findById(userId);
    if (!user || user.accountStatus === "DELETED") {
      next(
        new AppError({
          statusCode: 401,
          code: "AUTH_UNAUTHORIZED",
          message: "Authentication is required",
        }),
      );
      return;
    }
    if (user.accountStatus !== "ACTIVE") {
      next(
        new AppError({
          statusCode: 403,
          code:
            user.accountStatus === "SUSPENDED"
              ? "ACCOUNT_SUSPENDED"
              : "ACCOUNT_BLOCKED",
          message:
            user.accountStatus === "SUSPENDED"
              ? "Account is suspended"
              : "Account is blocked",
        }),
      );
      return;
    }
    next();
  };
}
