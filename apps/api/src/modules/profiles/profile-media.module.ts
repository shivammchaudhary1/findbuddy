import { Router } from "express";

import { MongooseTransactionRunner } from "../../common/database/transaction.js";
import type { Environment } from "../../config/env.js";
import { S3StorageAdapter } from "../../integrations/s3/s3-storage.adapter.js";
import { createAccessTokenService } from "../auth/token.service.js";
import { MongooseMediaRepository } from "../media/media.repository.js";
import { createMediaRouter } from "../media/media.routes.js";
import { MediaService } from "../media/media.service.js";
import { MongooseUserRepository } from "../users/user.repository.js";
import { MongooseProfileRepository } from "./profile.repository.js";
import { createProfileRouter } from "./profile.routes.js";
import { ProfileService } from "./profile.service.js";

export function createProfileMediaModule(environment: Environment): Router {
  const router = Router();
  const users = new MongooseUserRepository();
  const profiles = new MongooseProfileRepository();
  const media = new MongooseMediaRepository();
  const storage = new S3StorageAdapter(
    environment.awsRegion,
    environment.mediaPublicBaseUrl,
  );
  const accessTokens = createAccessTokenService({
    secret: environment.jwtAccessSecret,
    ttlSeconds: environment.jwtAccessTtlSeconds,
    issuer: environment.jwtIssuer,
    audience: environment.jwtAudience,
  });
  const profileService = new ProfileService(profiles, users, media, storage);
  const mediaService = new MediaService(
    media,
    profiles,
    storage,
    new MongooseTransactionRunner(),
    {
      bucket: environment.awsS3Bucket,
      allowedImageTypes: environment.mediaAllowedImageTypes,
      maxImageBytes: environment.mediaMaxImageBytes,
      presignTtlSeconds: environment.mediaPresignTtlSeconds,
    },
  );

  router.use(
    createProfileRouter({ service: profileService, users, accessTokens }),
  );
  router.use(createMediaRouter({ service: mediaService, users, accessTokens }));
  return router;
}
