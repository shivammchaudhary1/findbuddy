import cors from "cors";
import express, { type Express, type Router } from "express";
import helmet from "helmet";
import type { Logger } from "pino";

import { errorHandler } from "./common/middleware/error-handler.js";
import { notFound } from "./common/middleware/not-found.js";
import { requestId } from "./common/middleware/request-id.js";
import { requestLogger } from "./common/middleware/request-logger.js";
import type { Environment } from "./config/env.js";
import {
  createHealthRouter,
  type ReadinessCheck,
} from "./modules/health/health.routes.js";

export type CreateAppOptions = {
  environment: Environment;
  logger: Logger;
  readinessCheck?: ReadinessCheck;
  additionalRouter?: Router;
};

export function createApp(options: CreateAppOptions): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestId);
  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin: options.environment.corsOrigins,
    }),
  );
  app.use(requestLogger(options.logger));
  app.use(express.json({ limit: options.environment.requestBodyLimit }));

  app.use("/health", createHealthRouter(options.readinessCheck));
  if (options.additionalRouter) app.use(options.additionalRouter);

  app.use(notFound);
  app.use(errorHandler(options.logger));

  return app;
}
