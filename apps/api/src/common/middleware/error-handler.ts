import type { ErrorRequestHandler } from "express";
import type { Logger } from "pino";
import { ZodError } from "zod";

import type { ApiError } from "@findbuddy/contracts";

import { AppError } from "../errors/app-error.js";

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, request, response, next) => {
    void next;

    const normalizedError = normalizeError(error);

    if (normalizedError.statusCode >= 500) {
      logger.error(
        {
          requestId: request.requestId,
          errorCode: normalizedError.code,
          err: error,
        },
        "request failed",
      );
    }

    const body: ApiError = {
      success: false,
      error: {
        code: normalizedError.code,
        message: normalizedError.message,
        ...(normalizedError.details === undefined
          ? {}
          : { details: normalizedError.details }),
      },
    };

    response.status(normalizedError.statusCode).json(body);
  };
}

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    return new AppError({
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: error.issues,
    });
  }

  if (isHttpParserError(error, 400, "entity.parse.failed")) {
    return new AppError({
      statusCode: 400,
      code: "MALFORMED_JSON",
      message: "Request body contains malformed JSON",
    });
  }

  if (isHttpParserError(error, 413, "entity.too.large")) {
    return new AppError({
      statusCode: 413,
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body exceeds the configured size limit",
    });
  }

  return new AppError({
    statusCode: 500,
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  });
}

function isHttpParserError(
  error: unknown,
  statusCode: number,
  type: string,
): error is Error & { status: number; type: string } {
  if (!(error instanceof Error)) return false;

  const candidate = error as Error & { status?: unknown; type?: unknown };
  return candidate.status === statusCode && candidate.type === type;
}
