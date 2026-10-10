import { Router } from "express";
import pino from "pino";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createApp } from "../src/app.js";
import { AppError } from "../src/common/errors/app-error.js";
import type { Environment } from "../src/config/env.js";

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
  refreshTokenTtlSeconds: 2_592_000,
  emailVerificationTtlSeconds: 86_400,
  passwordResetTtlSeconds: 3600,
  awsRegion: "us-east-1",
  awsS3Bucket: "findbuddy-test-media",
  mediaPublicBaseUrl: "https://media.findbuddy.test",
  mediaAllowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  mediaMaxImageBytes: 5 * 1024 * 1024,
  mediaPresignTtlSeconds: 300,
};

function testApp(
  options: Parameters<typeof createApp>[0] = {
    environment,
    logger: pino({ enabled: false }),
  },
) {
  return createApp(options);
}

describe("FindBuddy API foundation", () => {
  it("returns liveness with the normalized success envelope and request id", async () => {
    const response = await request(testApp())
      .get("/health/live")
      .set("x-request-id", "test-request-1");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBe("test-request-1");
    expect(response.body).toMatchObject({
      success: true,
      data: { status: "alive" },
    });
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("reports a failed dependency through readiness", async () => {
    const response = await request(
      testApp({
        environment,
        logger: pino({ enabled: false }),
        readinessCheck: async () => ({
          ready: false,
          checks: { api: "ready", database: "not_ready" },
        }),
      }),
    ).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: "not_ready",
        checks: { api: "ready", database: "not_ready" },
      },
    });
  });

  it("keeps readiness failures private and reports unavailable", async () => {
    const response = await request(
      testApp({
        environment,
        logger: pino({ enabled: false }),
        readinessCheck: async () => {
          throw new Error("private database failure");
        },
      }),
    ).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: "not_ready",
        checks: { api: "ready", dependency: "not_ready" },
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(
      "private database failure",
    );
  });

  it("returns the normalized not-found error without a stack trace", async () => {
    const response = await request(testApp()).get("/missing");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route GET /missing was not found",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("stack");
  });

  it("normalizes application, validation, and unknown errors", async () => {
    const router = Router();
    router.get("/conflict", () => {
      throw new AppError({
        statusCode: 409,
        code: "TEST_CONFLICT",
        message: "Conflict",
      });
    });
    router.get("/validation-error", () => {
      z.object({ required: z.string() }).parse({});
    });
    router.get("/unknown-error", () => {
      throw new Error("private failure detail");
    });

    const app = testApp({
      environment,
      logger: pino({ enabled: false }),
      additionalRouter: router,
    });

    const conflict = await request(app).get("/conflict");
    const validation = await request(app).get("/validation-error");
    const unknown = await request(app).get("/unknown-error");

    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe("TEST_CONFLICT");
    expect(validation.status).toBe(400);
    expect(validation.body.error.code).toBe("VALIDATION_ERROR");
    expect(unknown.status).toBe(500);
    expect(unknown.body).toEqual({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    });
    expect(JSON.stringify(unknown.body)).not.toContain(
      "private failure detail",
    );
  });

  it("does not reflect unsafe incoming request ids", async () => {
    const response = await request(testApp())
      .get("/health/live")
      .set("x-request-id", "unsafe request id");

    expect(response.headers["x-request-id"]).not.toBe("unsafe request id");
    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("applies the configured CORS allowlist", async () => {
    const allowed = await request(testApp())
      .get("/health/live")
      .set("origin", "http://localhost:3000");
    const unlisted = await request(testApp())
      .get("/health/live")
      .set("origin", "https://unlisted.example");

    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    expect(unlisted.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("normalizes malformed and oversized JSON bodies", async () => {
    const router = Router();
    router.post("/echo", (_request, response) => response.sendStatus(204));
    const app = testApp({
      environment: { ...environment, requestBodyLimit: "10kb" },
      logger: pino({ enabled: false }),
      additionalRouter: router,
    });

    const malformed = await request(app)
      .post("/echo")
      .set("content-type", "application/json")
      .send('{"broken":');
    const oversized = await request(app)
      .post("/echo")
      .set("content-type", "application/json")
      .send(JSON.stringify({ value: "x".repeat(11_000) }));

    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe("MALFORMED_JSON");
    expect(oversized.status).toBe(413);
    expect(oversized.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });
});
