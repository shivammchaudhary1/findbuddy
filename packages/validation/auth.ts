import { z } from "zod";

export const authClientTypes = ["WEB", "MOBILE"] as const;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(254));
export const passwordSchema = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  clientType: z.enum(authClientTypes).default("WEB"),
});

export const refreshRequestSchema = z.object({
  clientType: z.enum(authClientTypes).default("WEB"),
  refreshToken: z.string().min(1).optional(),
});

export const logoutRequestSchema = refreshRequestSchema;

export const verifyEmailRequestSchema = z.object({
  token: z.string().min(32).max(512),
});

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(32).max(512),
  password: passwordSchema,
});
