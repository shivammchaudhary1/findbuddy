import "dotenv/config";

import { z } from "zod";

const corsOriginsSchema = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url()).min(1));

const durationSchema = z
  .string()
  .regex(/^\d+[smhd]$/, "Use a duration such as 15m, 1h, or 30d")
  .transform((value) => {
    const amount = Number.parseInt(value.slice(0, -1), 10);
    const unit = value.at(-1);
    const secondsByUnit = { s: 1, m: 60, h: 3600, d: 86_400 } as const;
    return amount * secondsByUnit[unit as keyof typeof secondsByUnit];
  })
  .pipe(z.number().int().positive());

const mimeTypesSchema = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((mimeType) => mimeType.trim().toLowerCase())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().regex(/^image\/[a-z0-9.+-]+$/)).min(1));

const rawEnvironmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    HOST: z.string().min(1).default("127.0.0.1"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(8888),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    CORS_ORIGINS: corsOriginsSchema.optional(),
    REQUEST_BODY_LIMIT: z
      .string()
      .regex(/^\d+(?:kb|mb)$/i, "Use a size such as 512kb or 1mb")
      .default("1mb"),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
    MONGODB_URI: z
      .string()
      .regex(
        /^mongodb(?:\+srv)?:\/\//,
        "MONGODB_URI must use mongodb:// or mongodb+srv://",
      ),
    MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(10),
    MONGODB_MIN_POOL_SIZE: z.coerce.number().int().min(0).default(0),
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(5000),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_ACCESS_TTL: durationSchema.default(900),
    JWT_ISSUER: z.string().min(1).default("findbuddy-api"),
    JWT_AUDIENCE: z.string().min(1).default("findbuddy-clients"),
    REFRESH_TOKEN_TTL: durationSchema.default(2_592_000),
    EMAIL_VERIFICATION_TTL: durationSchema.default(86_400),
    PASSWORD_RESET_TTL: durationSchema.default(3600),
    AWS_REGION: z.string().min(1).default("us-east-1"),
    AWS_S3_BUCKET: z.string().min(3),
    MEDIA_PUBLIC_BASE_URL: z.url().optional(),
    MEDIA_ALLOWED_IMAGE_TYPES: mimeTypesSchema.default([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]),
    MEDIA_MAX_IMAGE_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(5 * 1024 * 1024),
    MEDIA_PRESIGN_TTL: durationSchema.default(300),
  })
  .superRefine((environment, context) => {
    if (environment.NODE_ENV === "production" && !environment.CORS_ORIGINS) {
      context.addIssue({
        code: "custom",
        path: ["CORS_ORIGINS"],
        message: "CORS_ORIGINS is required in production",
      });
    }
    if (environment.MONGODB_MIN_POOL_SIZE > environment.MONGODB_MAX_POOL_SIZE) {
      context.addIssue({
        code: "custom",
        path: ["MONGODB_MIN_POOL_SIZE"],
        message: "MONGODB_MIN_POOL_SIZE cannot exceed MONGODB_MAX_POOL_SIZE",
      });
    }
  });

export type Environment = {
  nodeEnv: "development" | "test" | "production";
  host: string;
  port: number;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  corsOrigins: string[];
  requestBodyLimit: string;
  shutdownTimeoutMs: number;
  mongodbUri: string;
  mongodbMaxPoolSize: number;
  mongodbMinPoolSize: number;
  mongodbServerSelectionTimeoutMs: number;
  jwtAccessSecret: string;
  jwtAccessTtlSeconds: number;
  jwtIssuer: string;
  jwtAudience: string;
  refreshTokenTtlSeconds: number;
  emailVerificationTtlSeconds: number;
  passwordResetTtlSeconds: number;
  awsRegion: string;
  awsS3Bucket: string;
  mediaPublicBaseUrl: string;
  mediaAllowedImageTypes: string[];
  mediaMaxImageBytes: number;
  mediaPresignTtlSeconds: number;
};

export function parseEnvironment(
  source: Record<string, string | undefined> = process.env,
): Environment {
  const environment = rawEnvironmentSchema.parse(source);

  return {
    nodeEnv: environment.NODE_ENV,
    host: environment.HOST,
    port: environment.PORT,
    logLevel: environment.LOG_LEVEL,
    corsOrigins: environment.CORS_ORIGINS ?? [
      "http://127.0.0.1:3000",
      "http://localhost:3000",
    ],
    requestBodyLimit: environment.REQUEST_BODY_LIMIT,
    shutdownTimeoutMs: environment.SHUTDOWN_TIMEOUT_MS,
    mongodbUri: environment.MONGODB_URI,
    mongodbMaxPoolSize: environment.MONGODB_MAX_POOL_SIZE,
    mongodbMinPoolSize: environment.MONGODB_MIN_POOL_SIZE,
    mongodbServerSelectionTimeoutMs:
      environment.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    jwtAccessSecret: environment.JWT_ACCESS_SECRET,
    jwtAccessTtlSeconds: environment.JWT_ACCESS_TTL,
    jwtIssuer: environment.JWT_ISSUER,
    jwtAudience: environment.JWT_AUDIENCE,
    refreshTokenTtlSeconds: environment.REFRESH_TOKEN_TTL,
    emailVerificationTtlSeconds: environment.EMAIL_VERIFICATION_TTL,
    passwordResetTtlSeconds: environment.PASSWORD_RESET_TTL,
    awsRegion: environment.AWS_REGION,
    awsS3Bucket: environment.AWS_S3_BUCKET,
    mediaPublicBaseUrl:
      environment.MEDIA_PUBLIC_BASE_URL ??
      `https://${environment.AWS_S3_BUCKET}.s3.${environment.AWS_REGION}.amazonaws.com`,
    mediaAllowedImageTypes: environment.MEDIA_ALLOWED_IMAGE_TYPES,
    mediaMaxImageBytes: environment.MEDIA_MAX_IMAGE_BYTES,
    mediaPresignTtlSeconds: environment.MEDIA_PRESIGN_TTL,
  };
}
