import { Router } from "express";

import { requireActiveAccount } from "../../common/middleware/account-status.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import type { AccessTokenService } from "../auth/token.service.js";
import type { UserRepository } from "../users/user.repository.js";
import { ProfileController } from "./profile.controller.js";
import type { ProfileService } from "./profile.service.js";

export function createProfileRouter(options: {
  service: ProfileService;
  users: UserRepository;
  accessTokens: AccessTokenService;
}): Router {
  const router = Router();
  const controller = new ProfileController(options.service);
  const authentication = authenticate(options.accessTokens);
  const activeAccount = requireActiveAccount(options.users);

  router.get("/api/v1/me", authentication, activeAccount, controller.getMe);
  router.patch(
    "/api/v1/me/profile",
    authentication,
    activeAccount,
    controller.updateMe,
  );
  router.get("/api/v1/users/:userId/profile", controller.getPublic);
  return router;
}
