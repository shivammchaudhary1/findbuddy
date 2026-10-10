import { Router } from "express";
import pino from "pino";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { requireActiveAccount } from "../src/common/middleware/account-status.js";
import { authenticate } from "../src/common/middleware/authenticate.js";
import {
  requireOwnership,
  requireRole,
} from "../src/common/middleware/authorize.js";
import type { Environment } from "../src/config/env.js";
import { argon2PasswordHasher } from "../src/modules/auth/password.service.js";
import { createAccessTokenService } from "../src/modules/auth/token.service.js";
import { addVerifiedUser, createAuthHarness } from "./helpers/auth-harness.js";

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
  jwtAccessSecret: "security-test-secret-with-at-least-32-characters",
  jwtAccessTtlSeconds: 900,
  jwtIssuer: "findbuddy-security-test",
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

describe("authentication security primitives", () => {
  it("hashes and verifies passwords with Argon2id", async () => {
    const hash = await argon2PasswordHasher.hash("StrongPassword1!");
    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(
      argon2PasswordHasher.verify(hash, "StrongPassword1!"),
    ).resolves.toBe(true);
    await expect(
      argon2PasswordHasher.verify(hash, "WrongPassword1!"),
    ).resolves.toBe(false);
  });

  it("signs verified access claims and rejects tampered JWTs", async () => {
    const tokens = createAccessTokenService({
      secret: environment.jwtAccessSecret,
      ttlSeconds: environment.jwtAccessTtlSeconds,
      issuer: environment.jwtIssuer,
      audience: environment.jwtAudience,
    });
    const token = await tokens.sign({ userId: "user-1", accountRole: "ADMIN" });

    await expect(tokens.verify(token)).resolves.toEqual({
      userId: "user-1",
      accountRole: "ADMIN",
    });
    const [header, payload, signature] = token.split(".");
    const tamperedSignature = `${signature?.startsWith("A") ? "B" : "A"}${signature?.slice(1)}`;
    await expect(
      tokens.verify(`${header}.${payload}.${tamperedSignature}`),
    ).rejects.toThrow();
  });
});

describe("authentication and authorization middleware", () => {
  it("enforces bearer authentication, active status, roles, and ownership", async () => {
    const harness = createAuthHarness();
    const user = await addVerifiedUser(harness);
    const router = Router();
    router.get(
      "/protected/:ownerId",
      authenticate(harness.accessTokens),
      requireActiveAccount(harness.users),
      requireRole("USER", "ADMIN"),
      requireOwnership(
        (request) => {
          const ownerId = request.params.ownerId;
          return Array.isArray(ownerId) ? ownerId[0] : ownerId;
        },
        {
          allowRoles: ["ADMIN", "SUPER_ADMIN"],
        },
      ),
      (_request, response) => response.json({ success: true }),
    );
    const app = createApp({
      environment,
      logger: pino({ enabled: false }),
      additionalRouter: router,
    });

    const missing = await request(app).get(`/protected/${user.id}`);
    const wrongOwner = await request(app)
      .get("/protected/user-2")
      .set("authorization", `Bearer access:${user.id}`);
    const allowed = await request(app)
      .get(`/protected/${user.id}`)
      .set("authorization", `Bearer access:${user.id}`);
    harness.users.setStatus(user.id, "SUSPENDED");
    const suspended = await request(app)
      .get(`/protected/${user.id}`)
      .set("authorization", `Bearer access:${user.id}`);

    expect(missing.status).toBe(401);
    expect(wrongOwner.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect(suspended.status).toBe(403);
    expect(suspended.body.error.code).toBe("ACCOUNT_SUSPENDED");
  });
});
