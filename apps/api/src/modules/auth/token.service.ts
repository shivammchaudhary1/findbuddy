import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

import { accountRoles } from "@findbuddy/constants";
import type { AccountRole } from "@findbuddy/types";

import type { AccessTokenClaims } from "./auth.types.js";

export interface AccessTokenService {
  sign(claims: AccessTokenClaims): Promise<string>;
  verify(token: string): Promise<AccessTokenClaims>;
}

export function createAccessTokenService(options: {
  secret: string;
  ttlSeconds: number;
  issuer: string;
  audience: string;
}): AccessTokenService {
  const key = new TextEncoder().encode(options.secret);

  return {
    sign: (claims) =>
      new SignJWT({ role: claims.accountRole, tokenType: "access" })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setSubject(claims.userId)
        .setIssuer(options.issuer)
        .setAudience(options.audience)
        .setIssuedAt()
        .setExpirationTime(`${options.ttlSeconds}s`)
        .sign(key),
    verify: async (token) => {
      const { payload } = await jwtVerify(token, key, {
        issuer: options.issuer,
        audience: options.audience,
        algorithms: ["HS256"],
      });
      if (
        payload.tokenType !== "access" ||
        typeof payload.sub !== "string" ||
        !accountRoles.includes(payload.role as AccountRole)
      ) {
        throw new Error("Invalid access token claims");
      }
      return {
        userId: payload.sub,
        accountRole: payload.role as AccountRole,
      };
    },
  };
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeTokenEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
