import pino, { type DestinationStream, type Logger } from "pino";

import type { Environment } from "./env.js";

export const loggerRedactionPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.token",
  "req.body.accessToken",
  "req.body.refreshToken",
  "headers.authorization",
  "headers.cookie",
  "body.password",
  "body.token",
  "body.accessToken",
  "body.refreshToken",
  "password",
  "passwordHash",
  "token",
  "rawToken",
  "accessToken",
  "refreshToken",
  "csrfToken",
  "jwtAccessSecret",
] as const;

export function createLogger(
  environment: Environment,
  destination?: DestinationStream,
): Logger {
  return pino(
    {
      level: environment.logLevel,
      base: {
        service: "findbuddy-api",
        environment: environment.nodeEnv,
      },
      redact: {
        paths: [...loggerRedactionPaths],
        censor: "[REDACTED]",
      },
    },
    destination,
  );
}
