import { describe, expect, it } from "vitest";

import {
  privateProfileSchema,
  publicProfileSchema,
  updateProfileRequestSchema,
} from "@findbuddy/validation";

import { createProfileMediaHarness } from "./helpers/profile-media-harness.js";

describe("ProfileService", () => {
  it("returns an authenticated account with a null profile during onboarding", async () => {
    const harness = await createProfileMediaHarness();
    await expect(
      harness.profileService.getMe(harness.user.id),
    ).resolves.toEqual({
      profile: null,
    });
  });

  it("requires a name for initial creation and applies safe defaults", async () => {
    const harness = await createProfileMediaHarness();
    await expect(
      harness.profileService.updateMe(harness.user.id, { city: "Delhi" }),
    ).rejects.toMatchObject({ code: "PROFILE_NAME_REQUIRED" });

    const profile = await harness.profileService.updateMe(harness.user.id, {
      name: "Riya",
      city: "Delhi",
      pincode: "110001",
      womenOnlyVisibility: true,
    });
    expect(profile).toMatchObject({
      name: "Riya",
      city: "Delhi",
      pincode: "110001",
      womenOnlyVisibility: true,
      intent: "BOTH",
      interests: [],
      languages: [],
      email: harness.user.email,
    });
    expect(privateProfileSchema.parse(profile)).toEqual(profile);
  });

  it("maps public profiles without private account or location fields", async () => {
    const harness = await createProfileMediaHarness();
    await harness.profileService.updateMe(harness.user.id, {
      name: "Riya",
      pincode: "110001",
      womenOnlyVisibility: true,
      interests: ["Coffee"],
    });

    const publicProfile = await harness.profileService.getPublic(
      harness.user.id,
    );
    expect(publicProfile).toMatchObject({
      name: "Riya",
      interests: ["Coffee"],
    });
    expect(publicProfileSchema.parse(publicProfile)).toEqual(publicProfile);
    expect(publicProfile).not.toHaveProperty("email");
    expect(publicProfile).not.toHaveProperty("pincode");
    expect(publicProfile).not.toHaveProperty("womenOnlyVisibility");
    expect(publicProfile).not.toHaveProperty("accountStatus");
  });

  it("does not expose profiles belonging to inactive accounts", async () => {
    const harness = await createProfileMediaHarness();
    await harness.profileService.updateMe(harness.user.id, { name: "Riya" });
    harness.auth.users.setStatus(harness.user.id, "SUSPENDED");

    await expect(
      harness.profileService.getPublic(harness.user.id),
    ).rejects.toMatchObject({ code: "PROFILE_NOT_FOUND" });
  });

  it("rejects empty, unknown, and invalid profile updates", () => {
    expect(() => updateProfileRequestSchema.parse({})).toThrow();
    expect(() => updateProfileRequestSchema.parse({ admin: true })).toThrow();
    expect(() => updateProfileRequestSchema.parse({ age: 121 })).toThrow();
  });
});
