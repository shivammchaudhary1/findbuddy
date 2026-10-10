import { Router } from "express";
import pino from "pino";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import type { Environment } from "../src/config/env.js";
import { createMediaRouter } from "../src/modules/media/media.routes.js";
import { createProfileRouter } from "../src/modules/profiles/profile.routes.js";
import { createProfileMediaHarness } from "./helpers/profile-media-harness.js";

const environment: Environment = {
  nodeEnv: "test",
  host: "127.0.0.1",
  port: 8888,
  logLevel: "silent",
  corsOrigins: ["http://localhost:3000"],
  requestBodyLimit: "1mb",
  shutdownTimeoutMs: 1000,
  mongodbUri: "mongodb://127.0.0.1:27017/findbuddy_test",
  mongodbMaxPoolSize: 10,
  mongodbMinPoolSize: 0,
  mongodbServerSelectionTimeoutMs: 1000,
  jwtAccessSecret: "test-access-secret-with-at-least-32-characters",
  jwtAccessTtlSeconds: 900,
  jwtIssuer: "findbuddy-api-test",
  jwtAudience: "findbuddy-clients-test",
  refreshTokenTtlSeconds: 3600,
  emailVerificationTtlSeconds: 1800,
  passwordResetTtlSeconds: 900,
  awsRegion: "us-east-1",
  awsS3Bucket: "findbuddy-test-media",
  mediaPublicBaseUrl: "https://media.findbuddy.test",
  mediaAllowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  mediaMaxImageBytes: 5 * 1024 * 1024,
  mediaPresignTtlSeconds: 300,
};

async function createTestContext() {
  const harness = await createProfileMediaHarness();
  const router = Router();
  router.use(
    createProfileRouter({
      service: harness.profileService,
      users: harness.auth.users,
      accessTokens: harness.auth.accessTokens,
    }),
  );
  router.use(
    createMediaRouter({
      service: harness.mediaService,
      users: harness.auth.users,
      accessTokens: harness.auth.accessTokens,
    }),
  );
  return {
    harness,
    app: createApp({
      environment,
      logger: pino({ enabled: false }),
      additionalRouter: router,
    }),
    authorization: `Bearer access:${harness.user.id}`,
  };
}

describe("profile routes", () => {
  it("protects /me and supports private update plus public retrieval", async () => {
    const { app, harness, authorization } = await createTestContext();
    const unauthorized = await request(app).get("/api/v1/me");
    expect(unauthorized.status).toBe(401);

    const updated = await request(app)
      .patch("/api/v1/me/profile")
      .set("authorization", authorization)
      .send({
        name: "Riya",
        city: "Delhi",
        pincode: "110001",
        womenOnlyVisibility: true,
      });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({
      email: harness.user.email,
      pincode: "110001",
      womenOnlyVisibility: true,
    });

    const publicResponse = await request(app).get(
      `/api/v1/users/${harness.user.id}/profile`,
    );
    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body.data.name).toBe("Riya");
    expect(publicResponse.body.data).not.toHaveProperty("email");
    expect(publicResponse.body.data).not.toHaveProperty("pincode");
    expect(publicResponse.body.data).not.toHaveProperty("womenOnlyVisibility");
  });
});

describe("media routes", () => {
  it("returns upload authorization only and confirms metadata through the adapter", async () => {
    const { app, harness, authorization } = await createTestContext();
    await harness.profileService.updateMe(harness.user.id, { name: "Riya" });

    const presigned = await request(app)
      .post("/api/v1/media/presign")
      .set("authorization", authorization)
      .send({ mimeType: "image/png", sizeBytes: 2048 });
    expect(presigned.status).toBe(201);
    expect(presigned.body.data).toMatchObject({
      uploadUrl: "https://upload.findbuddy.test/signed",
      requiredHeaders: { "content-type": "image/png" },
    });
    expect(presigned.body.data).not.toHaveProperty("file");
    expect(presigned.body.data).not.toHaveProperty("bytes");

    harness.setObjectMetadata({ mimeType: "image/png", sizeBytes: 2048 });
    const confirmed = await request(app)
      .post(`/api/v1/media/${presigned.body.data.mediaId}/confirm`)
      .set("authorization", authorization)
      .send({});
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.data.status).toBe("ACTIVE");
  });

  it("rejects embedded image data and requires authentication", async () => {
    const { app, authorization } = await createTestContext();
    const unauthorized = await request(app)
      .post("/api/v1/media/presign")
      .send({ mimeType: "image/png", sizeBytes: 10 });
    const embedded = await request(app)
      .post("/api/v1/media/presign")
      .set("authorization", authorization)
      .send({
        mimeType: "image/png",
        sizeBytes: 10,
        fileBase64: "not-accepted",
      });

    expect(unauthorized.status).toBe(401);
    expect(embedded.status).toBe(400);
    expect(embedded.body.error.code).toBe("VALIDATION_ERROR");
  });
});
