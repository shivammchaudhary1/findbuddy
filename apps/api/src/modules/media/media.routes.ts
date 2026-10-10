import { Router } from "express";

import { requireActiveAccount } from "../../common/middleware/account-status.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import type { AccessTokenService } from "../auth/token.service.js";
import type { UserRepository } from "../users/user.repository.js";
import { MediaController } from "./media.controller.js";
import type { MediaService } from "./media.service.js";

export function createMediaRouter(options: {
  service: MediaService;
  users: UserRepository;
  accessTokens: AccessTokenService;
}): Router {
  const router = Router();
  const controller = new MediaController(options.service);
  const authentication = authenticate(options.accessTokens);
  const activeAccount = requireActiveAccount(options.users);

  router.post(
    "/api/v1/media/presign",
    authentication,
    activeAccount,
    controller.presign,
  );
  router.post(
    "/api/v1/media/:mediaId/confirm",
    authentication,
    activeAccount,
    controller.confirm,
  );
  return router;
}
