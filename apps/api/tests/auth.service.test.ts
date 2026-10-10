import { describe, expect, it } from "vitest";

import { hashOpaqueToken } from "../src/modules/auth/token.service.js";
import { addVerifiedUser, createAuthHarness } from "./helpers/auth-harness.js";

const password = "StrongPassword1!";

describe("AuthService registration and login", () => {
  it("registers safely, hashes the password, and dispatches verification", async () => {
    const harness = createAuthHarness();
    const result = await harness.service.register({
      email: "new@example.com",
      password,
    });

    expect(result).toMatchObject({
      emailVerificationRequired: true,
      user: { email: "new@example.com", emailVerified: false },
    });
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("passwordHash");
    expect(harness.users.records[0]?.passwordHash).toBe(`hashed:${password}`);
    expect(harness.notifier.sendEmailVerification).toHaveBeenCalledOnce();
    const notification =
      harness.notifier.sendEmailVerification.mock.calls[0]?.[0];
    expect(notification?.token).toHaveLength(43);
    expect(harness.actionTokens.records[0]?.tokenHash).toBe(
      hashOpaqueToken(notification!.token),
    );
  });

  it("rejects duplicate registration without hashing a new password", async () => {
    const harness = createAuthHarness();
    await harness.users.create({
      email: "same@example.com",
      passwordHash: "existing",
    });

    await expect(
      harness.service.register({ email: "same@example.com", password }),
    ).rejects.toMatchObject({ code: "AUTH_EMAIL_ALREADY_EXISTS" });
    expect(harness.passwordHasher.hash).not.toHaveBeenCalled();
  });

  it("logs in a verified active user and rejects invalid or unverified credentials", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness, { password });

    const login = await harness.service.login({
      email: "verified@example.com",
      password,
      clientType: "MOBILE",
    });
    expect(login.session).toMatchObject({
      accessToken: "access:user-1",
      expiresInSeconds: 900,
      user: { id: "user-1", emailVerified: true },
    });
    expect(login.refreshToken).toHaveLength(43);

    await expect(
      harness.service.login({
        email: "verified@example.com",
        password: "wrong",
        clientType: "WEB",
      }),
    ).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS" });

    await harness.users.create({
      email: "unverified@example.com",
      passwordHash: `hashed:${password}`,
    });
    await expect(
      harness.service.login({
        email: "unverified@example.com",
        password,
        clientType: "WEB",
      }),
    ).rejects.toMatchObject({ code: "AUTH_EMAIL_NOT_VERIFIED" });
  });

  it.each([
    ["SUSPENDED", "ACCOUNT_SUSPENDED"],
    ["BLOCKED", "ACCOUNT_BLOCKED"],
  ] as const)("rejects %s accounts", async (status, code) => {
    const harness = createAuthHarness();
    const user = await addVerifiedUser(harness, { password });
    harness.users.setStatus(user.id, status);

    await expect(
      harness.service.login({
        email: user.email,
        password,
        clientType: "WEB",
      }),
    ).rejects.toMatchObject({ code });
  });
});

describe("AuthService session lifecycle", () => {
  it("rotates refresh tokens and revokes the family when an old token is reused", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness, { password });
    const login = await harness.service.login({
      email: "verified@example.com",
      password,
      clientType: "MOBILE",
    });
    const rotated = await harness.service.refresh(login.refreshToken);

    expect(rotated.refreshToken).not.toBe(login.refreshToken);
    expect(harness.refreshTokens.records).toHaveLength(2);
    expect(harness.refreshTokens.records[0]?.revokedAt).toBeInstanceOf(Date);

    await expect(
      harness.service.refresh(login.refreshToken),
    ).rejects.toMatchObject({ code: "AUTH_REFRESH_REUSE_DETECTED" });
    expect(harness.refreshTokens.records[1]?.revokedAt).toBeInstanceOf(Date);
  });

  it("rejects expired tokens", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness, { password });
    const login = await harness.service.login({
      email: "verified@example.com",
      password,
      clientType: "MOBILE",
    });
    harness.setTime(new Date("2026-01-10T14:00:00.000Z"));

    await expect(
      harness.service.refresh(login.refreshToken),
    ).rejects.toMatchObject({ code: "AUTH_TOKEN_EXPIRED" });
  });

  it("revokes active tokens on logout and rejects subsequent use", async () => {
    const harness = createAuthHarness();
    await addVerifiedUser(harness, { password });
    const login = await harness.service.login({
      email: "verified@example.com",
      password,
      clientType: "MOBILE",
    });

    await expect(
      harness.service.logout(login.refreshToken),
    ).resolves.toBeUndefined();
    await expect(
      harness.service.logout(login.refreshToken),
    ).resolves.toBeUndefined();
    await expect(
      harness.service.refresh(login.refreshToken),
    ).rejects.toMatchObject({ code: "AUTH_REFRESH_REUSE_DETECTED" });
  });

  it("enforces account status again during refresh", async () => {
    const harness = createAuthHarness();
    const user = await addVerifiedUser(harness, { password });
    const login = await harness.service.login({
      email: user.email,
      password,
      clientType: "MOBILE",
    });
    harness.users.setStatus(user.id, "BLOCKED");

    await expect(
      harness.service.refresh(login.refreshToken),
    ).rejects.toMatchObject({ code: "ACCOUNT_BLOCKED" });
  });
});

describe("AuthService verification and password recovery", () => {
  it("verifies email tokens once", async () => {
    const harness = createAuthHarness();
    await harness.service.register({ email: "new@example.com", password });
    const token =
      harness.notifier.sendEmailVerification.mock.calls[0]![0].token;

    await harness.service.verifyEmail(token);
    expect(harness.users.records[0]?.emailVerifiedAt).toBeInstanceOf(Date);
    await expect(harness.service.verifyEmail(token)).rejects.toMatchObject({
      code: "AUTH_INVALID_OR_EXPIRED_TOKEN",
    });
  });

  it("rejects expired action tokens", async () => {
    const harness = createAuthHarness();
    await harness.service.register({ email: "new@example.com", password });
    const token =
      harness.notifier.sendEmailVerification.mock.calls[0]![0].token;
    harness.setTime(new Date("2026-01-10T13:00:00.000Z"));

    await expect(harness.service.verifyEmail(token)).rejects.toMatchObject({
      code: "AUTH_INVALID_OR_EXPIRED_TOKEN",
    });
  });

  it("resets the password and revokes every session", async () => {
    const harness = createAuthHarness();
    const user = await addVerifiedUser(harness, { password });
    await harness.service.login({
      email: user.email,
      password,
      clientType: "MOBILE",
    });
    await harness.service.forgotPassword(user.email);
    const token = harness.notifier.sendPasswordReset.mock.calls[0]![0].token;

    await harness.service.resetPassword({
      token,
      password: "ReplacementPassword2@",
    });
    expect(harness.users.records[0]?.passwordHash).toBe(
      "hashed:ReplacementPassword2@",
    );
    expect(harness.refreshTokens.records[0]?.revokedAt).toBeInstanceOf(Date);
  });

  it("does not reveal whether a forgot-password email exists", async () => {
    const harness = createAuthHarness();
    await expect(
      harness.service.forgotPassword("missing@example.com"),
    ).resolves.toBeUndefined();
    expect(harness.notifier.sendPasswordReset).not.toHaveBeenCalled();
  });
});
