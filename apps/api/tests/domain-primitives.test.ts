import { describe, expect, expectTypeOf, it } from "vitest";

import {
  FREE_SERVICE_LIMIT,
  MAX_PAGE_SIZE,
  accountRoles,
  bookingStatuses,
  serviceCategories,
} from "@findbuddy/constants";
import type { ListServicesResponse } from "@findbuddy/contracts";
import type { PublicProfileDto, PublicServiceDto } from "@findbuddy/types";
import {
  createPaginationMeta,
  hasActiveProEntitlement,
  toPublicProfileDto,
  toPublicServiceDto,
  validateServicePricing,
} from "@findbuddy/utils";
import {
  createServiceRequestSchema,
  paginationQuerySchema,
  publicProfileSchema,
  publicServiceSchema,
  serviceListQuerySchema,
  websiteSchema,
} from "@findbuddy/validation";

describe("shared domain constants and contracts", () => {
  it("keeps locked roles, categories, and booking states centralized", () => {
    expect(accountRoles).toEqual(["USER", "ADMIN", "SUPER_ADMIN"]);
    expect(serviceCategories).toContain("COFFEE_BUDDY");
    expect(serviceCategories).toContain("CUSTOM");
    expect(bookingStatuses).toEqual([
      "REQUESTED",
      "ACCEPTED",
      "REJECTED",
      "CANCELLED",
      "COMPLETED",
    ]);
  });

  it("keeps preview validation separate from backend request schemas", () => {
    expect(websiteSchema).toBeDefined();
    expect(
      createServiceRequestSchema.safeParse({
        category: "COFFEE_BUDDY",
        title: "Coffee and conversation",
        description: "Meet at a public café.",
        pricingType: "PER_SESSION",
        price: 400,
        city: "Mumbai",
      }).success,
    ).toBe(true);
    expect(
      createServiceRequestSchema.safeParse({
        category: "UNAPPROVED_CATEGORY",
        title: "Unknown",
        description: "Not part of the locked category list.",
        pricingType: "PER_SESSION",
        price: 100,
      }).success,
    ).toBe(false);
  });

  it("parses and bounds pagination and service-list query values", () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(paginationQuerySchema.parse({ page: "2", limit: "25" })).toEqual({
      page: 2,
      limit: 25,
    });
    expect(
      paginationQuerySchema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success,
    ).toBe(false);
    expect(
      serviceListQuerySchema.parse({
        verifiedOnly: "false",
        minTrust: "75",
      }),
    ).toMatchObject({ verifiedOnly: false, minTrust: 75 });
  });

  it("provides a typed paginated API response", () => {
    const response: ListServicesResponse = {
      success: true,
      data: [],
      meta: createPaginationMeta({ page: 2, limit: 20, total: 41 }),
    };

    expect(response.meta).toEqual({
      page: 2,
      limit: 20,
      total: 41,
      totalPages: 3,
    });
    expectTypeOf(response.data).toEqualTypeOf<PublicServiceDto[]>();
    expect(() =>
      createPaginationMeta({ limit: MAX_PAGE_SIZE + 1, total: 0 }),
    ).toThrow(/between 1 and/);
  });
});

describe("pricing and subscription domain rules", () => {
  it("enforces the complete Free pricing boundary", () => {
    expect(
      validateServicePricing({
        isPro: false,
        pricingType: "PER_SESSION",
        price: FREE_SERVICE_LIMIT,
      }),
    ).toEqual({ valid: true });
    expect(
      validateServicePricing({
        isPro: false,
        pricingType: "PER_SESSION",
        price: FREE_SERVICE_LIMIT + 1,
      }),
    ).toMatchObject({ valid: false, code: "FREE_USER_PRICE_LIMIT" });
    expect(
      validateServicePricing({
        isPro: false,
        pricingType: "PER_HOUR",
        price: 100,
      }),
    ).toMatchObject({
      valid: false,
      code: "PRO_REQUIRED_FOR_HOURLY_PRICING",
    });
    expect(
      validateServicePricing({
        isPro: false,
        pricingType: "FREE",
        price: 1,
      }),
    ).toMatchObject({ valid: false, code: "FREE_PRICE_MUST_BE_ZERO" });
  });

  it("allows Pro pricing and rejects invalid numeric values", () => {
    expect(
      validateServicePricing({
        isPro: true,
        pricingType: "PER_HOUR",
        price: 800,
      }),
    ).toEqual({ valid: true });
    expect(
      validateServicePricing({
        isPro: true,
        pricingType: "PER_SESSION",
        price: Number.NaN,
      }),
    ).toMatchObject({ valid: false, code: "INVALID_PRICE" });
  });

  it("derives Pro entitlement from active status and validity dates", () => {
    const now = new Date("2026-09-28T12:00:00.000Z");

    expect(
      hasActiveProEntitlement(
        {
          status: "ACTIVE",
          currentPeriodEnd: "2026-10-28T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(true);
    expect(
      hasActiveProEntitlement(
        {
          status: "ACTIVE",
          currentPeriodEnd: "2026-09-28T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(false);
    expect(
      hasActiveProEntitlement(
        {
          status: "CANCELLED",
          currentPeriodEnd: "2026-10-28T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(false);
    expect(
      hasActiveProEntitlement(
        { status: "ACTIVE", currentPeriodEnd: "not-a-date" },
        now,
      ),
    ).toBe(false);
  });
});

describe("public DTO privacy boundaries", () => {
  it("maps a profile without private account, location, or safety fields", () => {
    const internalProfile = {
      _id: "profile-1",
      userId: "user-1",
      name: "Riya S.",
      age: 24,
      gender: "WOMAN",
      city: "Mumbai",
      pincode: "400050",
      bio: "Coffee and movie enthusiast.",
      profilePhotoUrl: "https://cdn.example/profile-1.jpg",
      interests: ["Coffee", "Movies"],
      languages: ["Hindi", "English"],
      intent: "BOTH" as const,
      averageRating: 4.9,
      ratingCount: 12,
      isIdentityVerified: true,
      womenOnlyVisibility: true,
      email: "private@example.com",
      passwordHash: "private-password-hash",
      trustedContact: "+91-private",
      providerReference: "private-kyc-reference",
    };

    const dto = toPublicProfileDto(internalProfile);

    expect(publicProfileSchema.parse(dto)).toEqual(dto);
    expectTypeOf(dto).toEqualTypeOf<PublicProfileDto>();
    expect(dto).not.toHaveProperty("pincode");
    expect(dto).not.toHaveProperty("womenOnlyVisibility");
    expect(dto).not.toHaveProperty("email");
    expect(dto).not.toHaveProperty("passwordHash");
    expect(dto).not.toHaveProperty("trustedContact");
    expect(dto).not.toHaveProperty("providerReference");
  });

  it("maps a service without internal location or moderation fields", () => {
    const internalService = {
      _id: "service-1",
      providerId: "user-1",
      category: "COFFEE_BUDDY" as const,
      title: "Coffee Buddy",
      description: "Meet for coffee at a public café.",
      pricingType: "PER_SESSION" as const,
      price: 400,
      city: "Mumbai",
      pincode: "400050",
      status: "ACTIVE",
      internalModerationNote: "private",
      availability: [{ dayOfWeek: 6, startTime: "10:00", endTime: "12:00" }],
    };

    const dto = toPublicServiceDto(internalService);

    expect(publicServiceSchema.parse(dto)).toEqual(dto);
    expect(dto).not.toHaveProperty("pincode");
    expect(dto).not.toHaveProperty("status");
    expect(dto).not.toHaveProperty("internalModerationNote");
  });
});
