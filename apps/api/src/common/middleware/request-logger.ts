import type { RequestHandler } from "express";
import type { Logger } from "pino";

export function requestLogger(logger: Logger): RequestHandler {
  return (request, response, next) => {
    const startedAt = process.hrtime.bigint();

    response.once("finish", () => {
      const durationMs =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      logger.info(
        {
          requestId: request.requestId,
          method: request.method,
          route: request.route?.path ?? request.path,
          status: response.statusCode,
          durationMs: Math.round(durationMs * 100) / 100,
          ...(request.auth ? { userId: request.auth.userId } : {}),
        },
        "request completed",
      );
    });

    next();
  };
}
