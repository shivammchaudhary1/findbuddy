import { describe, expect, it } from "vitest";

import { parseEnvironment } from "../src/config/env.js";

describe("parseEnvironment", () => {
  it("provides safe local defaults", () => {
    const environment = parseEnvironment({
      MONGODB_URI: "mongodb://127.0.0.1:27017/findbuddy_local",
      JWT_ACCESS_SECRET: "test-access-secret-with-at-least-32-characters",
      AWS_S3_BUCKET: "findbuddy-local-media",
    });

    expect(environment).toMatchObject({
      nodeEnv: "development",
      host: "127.0.0.1",
      port: 8888,
      corsOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
      requestBodyLimit: "1mb",
      mongodbUri: "mongodb://127.0.0.1:27017/findbuddy_local",
      mongodbMaxPoolSize: 10,
      mongodbMinPoolSize: 0,
      mongodbServerSelectionTimeoutMs: 5000,
      jwtAccessTtlSeconds: 900,
      refreshTokenTtlSeconds: 2_592_000,
      emailVerificationTtlSeconds: 86_400,
      passwordResetTtlSeconds: 3600,
      awsRegion: "us-east-1",
      awsS3Bucket: "findbuddy-local-media",
      mediaPublicBaseUrl:
        "https://findbuddy-local-media.s3.us-east-1.amazonaws.com",
      mediaAllowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
      mediaMaxImageBytes: 5 * 1024 * 1024,
      mediaPresignTtlSeconds: 300,
    });
  });

  it("parses explicit values", () => {
    const environment = parseEnvironment({
      NODE_ENV: "test",
      HOST: "0.0.0.0",
      PORT: "9999",
      LOG_LEVEL: "silent",
      CORS_ORIGINS: "https://web.findbuddy.test, https://admin.findbuddy.test",
      REQUEST_BODY_LIMIT: "512kb",
      SHUTDOWN_TIMEOUT_MS: "5000",
      MONGODB_URI: "mongodb+srv://cluster.example/findbuddy_test",
      MONGODB_MAX_POOL_SIZE: "20",
      MONGODB_MIN_POOL_SIZE: "2",
      MONGODB_SERVER_SELECTION_TIMEOUT_MS: "3000",
      JWT_ACCESS_SECRET: "test-access-secret-with-at-least-32-characters",
      JWT_ACCESS_TTL: "10m",
      JWT_ISSUER: "issuer-test",
      JWT_AUDIENCE: "audience-test",
      REFRESH_TOKEN_TTL: "7d",
      EMAIL_VERIFICATION_TTL: "12h",
      PASSWORD_RESET_TTL: "30m",
      AWS_REGION: "ap-south-1",
      AWS_S3_BUCKET: "findbuddy-test-media",
      MEDIA_PUBLIC_BASE_URL: "https://media.findbuddy.test",
      MEDIA_ALLOWED_IMAGE_TYPES: "image/jpeg, image/webp",
      MEDIA_MAX_IMAGE_BYTES: "1048576",
      MEDIA_PRESIGN_TTL: "2m",
    });

    expect(environment).toEqual({
      nodeEnv: "test",
      host: "0.0.0.0",
      port: 9999,
      logLevel: "silent",
      corsOrigins: [
        "https://web.findbuddy.test",
        "https://admin.findbuddy.test",
      ],
      requestBodyLimit: "512kb",
      shutdownTimeoutMs: 5000,
      mongodbUri: "mongodb+srv://cluster.example/findbuddy_test",
      mongodbMaxPoolSize: 20,
      mongodbMinPoolSize: 2,
      mongodbServerSelectionTimeoutMs: 3000,
      jwtAccessSecret: "test-access-secret-with-at-least-32-characters",
      jwtAccessTtlSeconds: 600,
      jwtIssuer: "issuer-test",
      jwtAudience: "audience-test",
      refreshTokenTtlSeconds: 604_800,
      emailVerificationTtlSeconds: 43_200,
      passwordResetTtlSeconds: 1800,
      awsRegion: "ap-south-1",
      awsS3Bucket: "findbuddy-test-media",
      mediaPublicBaseUrl: "https://media.findbuddy.test",
      mediaAllowedImageTypes: ["image/jpeg", "image/webp"],
      mediaMaxImageBytes: 1_048_576,
      mediaPresignTtlSeconds: 120,
    });
  });

  it("requires explicit CORS origins in production", () => {
    expect(() =>
      parseEnvironment({
        NODE_ENV: "production",
        MONGODB_URI: "mongodb://127.0.0.1:27017/findbuddy_production",
        JWT_ACCESS_SECRET: "test-access-secret-with-at-least-32-characters",
        AWS_S3_BUCKET: "findbuddy-production-media",
      }),
    ).toThrow(/CORS_ORIGINS/);
  });

  it("rejects invalid ports, body limits, and MongoDB configuration", () => {
    const database = {
      MONGODB_URI: "mongodb://127.0.0.1:27017/findbuddy_local",
      JWT_ACCESS_SECRET: "test-access-secret-with-at-least-32-characters",
      AWS_S3_BUCKET: "findbuddy-local-media",
    };

    expect(() => parseEnvironment({ ...database, PORT: "70000" })).toThrow();
    expect(() =>
      parseEnvironment({ ...database, REQUEST_BODY_LIMIT: "unlimited" }),
    ).toThrow();
    expect(() =>
      parseEnvironment({ MONGODB_URI: "https://example.com" }),
    ).toThrow(/MONGODB_URI/);
    expect(() =>
      parseEnvironment({
        ...database,
        MONGODB_MIN_POOL_SIZE: "11",
        MONGODB_MAX_POOL_SIZE: "10",
      }),
    ).toThrow(/MONGODB_MIN_POOL_SIZE/);
  });
});
