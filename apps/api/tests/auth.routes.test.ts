import { Router } from "express";
import pino from "pino";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import type { Environment } from "../src/config/env.js";
import { createAuthRouter } from "../src/modules/auth/auth.routes.js";
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

function createTestApp(
  harness: ReturnType<typeof createAuthHarness>,
  rateLimits?: Parameters<typeof createAuthRouter>[0]["rateLimits"],
  appEnvironment: Environment = environment,
) {
  const router = Router();
  router.use(
    "/api/v1/auth",
    createAuthRouter({
      service: harness.service,
      environment: appEnvironment,
      rateLimits,
    }),
  );
  return createApp({
    environment: appEnvironment,
    logger: pino({ enabled: false }),
    additionalRouter: router,
  });
}

describe("authentication routes", () => {
  it("normalizes registration input and never returns password or token values", async () => {
    const harness = createAuthHarness();
    const response = await request(createTestApp(harness))
      .post("/api/v1/auth/register")
      .send({ email: "  NEW@Example.COM ", password: "StrongPassword1!" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        emailVerificationRequired: true,
        user: { email: "new@example.com" },
      },
    });
    expect(JSON.stringify(response.body)).not.toMatch(
      /StrongPassword|passwordHash|refreshToken|verification.*token/i,
    );
  });

  it("returns a refresh token to mobile but uses secure web cookies", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness);
    const app = createTestApp(harness);

    const mobile = await request(app).post("/api/v1/auth/login").send({
      email: "verified@example.com",
      password: "StrongPassword1!",
      clientType: "MOBILE",
    });
    expect(mobile.status).toBe(200);
    expect(mobile.body.data.refreshToken).toHaveLength(43);
    expect(mobile.headers["set-cookie"]).toBeUndefined();

    const web = await request(app).post("/api/v1/auth/login").send({
      email: "verified@example.com",
      password: "StrongPassword1!",
      clientType: "WEB",
    });
    expect(web.status).toBe(200);
    expect(web.body.data.refreshToken).toBeUndefined();
    const cookies = readSetCookies(web.headers["set-cookie"]);
    expect(cookies).toHaveLength(2);
    expect(
      cookies.find((cookie) => cookie.startsWith("findbuddy_refresh=")),
    ).toMatch(/HttpOnly;.*SameSite=Strict/);
    expect(
      cookies.find((cookie) => cookie.startsWith("findbuddy_csrf=")),
    ).not.toMatch(/HttpOnly/);
  });

  it("requires double-submit CSRF for web refresh and rotates its cookies", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness);
    const app = createTestApp(harness);
    const login = await request(app).post("/api/v1/auth/login").send({
      email: "verified@example.com",
      password: "StrongPassword1!",
      clientType: "WEB",
    });
    const cookies = readSetCookies(login.headers["set-cookie"]);
    const cookieHeader = cookies
      .map((cookie) => cookie.split(";", 1)[0])
      .join("; ");

    const rejected = await request(app)
      .post("/api/v1/auth/refresh")
      .set("cookie", cookieHeader)
      .send({ clientType: "WEB" });
    expect(rejected.status).toBe(403);
    expect(rejected.body.error.code).toBe("AUTH_CSRF_INVALID");

    const csrf = cookieHeader.match(/findbuddy_csrf=([^;]+)/)?.[1];
    const refreshed = await request(app)
      .post("/api/v1/auth/refresh")
      .set("cookie", cookieHeader)
      .set("x-csrf-token", csrf!)
      .send({ clientType: "WEB" });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.refreshToken).toBeUndefined();
    expect(readSetCookies(refreshed.headers["set-cookie"])).toHaveLength(2);
  });

  it("marks production session cookies Secure", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness);
    const app = createTestApp(harness, undefined, {
      ...environment,
      nodeEnv: "production",
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "verified@example.com",
      password: "StrongPassword1!",
      clientType: "WEB",
    });

    expect(readSetCookies(response.headers["set-cookie"])).toEqual([
      expect.stringContaining("Secure"),
      expect.stringContaining("Secure"),
    ]);
  });

  it("applies normalized authentication rate-limit errors", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness);
    const app = createTestApp(harness, { login: 1, windowMs: 60_000 });
    const body = {
      email: "verified@example.com",
      password: "wrong-password",
      clientType: "MOBILE",
    };

    const first = await request(app).post("/api/v1/auth/login").send(body);
    const second = await request(app).post("/api/v1/auth/login").send(body);
    expect(first.status).toBe(401);
    expect(second.status).toBe(429);
    expect(second.body.error.code).toBe("AUTH_RATE_LIMITED");
    expect(second.headers["ratelimit"]).toBeDefined();
  });

  it("uses a generic forgot-password response for existing and missing users", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness);
    const app = createTestApp(harness);

    const existing = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "verified@example.com" });
    const missing = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "missing@example.com" });

    expect(existing.status).toBe(202);
    expect(missing.status).toBe(202);
    expect(existing.body).toEqual(missing.body);
  });
});

function readSetCookies(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter((item): item is string => typeof item === "string");
  return typeof value === "string" ? [value] : [];
}
