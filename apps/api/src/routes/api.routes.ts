import { Router } from "express";
import type { Logger } from "pino";

import type { Environment } from "../config/env.js";
import { createAuthModule } from "../modules/auth/auth.module.js";
import { createProfileMediaModule } from "../modules/profiles/profile-media.module.js";

export function createApiRouter(
  environment: Environment,
  logger: Logger,
): Router {
  const router = Router();
  router.use("/api/v1/auth", createAuthModule(environment, logger));
  router.use(createProfileMediaModule(environment));
  return router;
}
