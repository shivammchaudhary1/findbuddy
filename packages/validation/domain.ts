import { z } from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  mediaKinds,
  planPricingTypes,
  pricingTypes,
  profileIntents,
  recommendationStates,
  serviceCategories,
  TRUST_SCORE_MAX,
  TRUST_SCORE_MIN,
} from "@findbuddy/constants";

export const domainIdSchema = z.string().min(1);
export const nonnegativeAmountSchema = z.number().finite().min(0);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

const queryBooleanSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const availabilitySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .refine((availability) => availability.startTime < availability.endTime, {
    message: "Availability end time must be after start time",
    path: ["endTime"],
  });

export const createServiceRequestSchema = z
  .object({
    category: z.enum(serviceCategories),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(2000),
    pricingType: z.enum(pricingTypes),
    price: nonnegativeAmountSchema,
    city: z.string().trim().min(1).optional(),
    pincode: z.string().trim().min(1).optional(),
    availability: z.array(availabilitySchema).optional(),
  })
  .refine((service) => service.pricingType !== "FREE" || service.price === 0, {
    message: "Free activities must have a zero fee",
    path: ["price"],
  });

export const updateServiceRequestSchema = z.object({
  category: z.enum(serviceCategories).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  pricingType: z.enum(pricingTypes).optional(),
  price: nonnegativeAmountSchema.optional(),
  city: z.string().trim().min(1).optional(),
  pincode: z.string().trim().min(1).optional(),
  availability: z.array(availabilitySchema).optional(),
});

export const serviceListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  category: z.enum(serviceCategories).optional(),
  city: z.string().trim().min(1).optional(),
  maxPrice: z.coerce.number().finite().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verifiedOnly: queryBooleanSchema.optional(),
  minTrust: z.coerce
    .number()
    .min(TRUST_SCORE_MIN)
    .max(TRUST_SCORE_MAX)
    .optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
});

export const updateProfileRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    age: z.number().int().positive().max(120).optional(),
    gender: z.string().trim().min(1).max(50).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    pincode: z.string().trim().min(1).max(20).optional(),
    bio: z.string().trim().max(1000).optional(),
    interests: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
    languages: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
    intent: z.enum(profileIntents).optional(),
    womenOnlyVisibility: z.boolean().optional(),
  })
  .strict()
  .refine((profile) => Object.keys(profile).length > 0, {
    message: "At least one profile field is required",
  });

export const mediaPresignRequestSchema = z
  .object({
    kind: z.enum(mediaKinds).default("PROFILE_IMAGE"),
    mimeType: z.string().trim().toLowerCase().min(1).max(100),
    sizeBytes: z.number().int().positive(),
  })
  .strict();

export const mediaIdParamsSchema = z.object({
  mediaId: domainIdSchema,
});

export const userIdParamsSchema = z.object({
  userId: domainIdSchema,
});

export const publicProfileSchema = z.object({
  id: domainIdSchema,
  userId: domainIdSchema,
  name: z.string().min(1),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  profilePhotoUrl: z.url().optional(),
  interests: z.array(z.string()),
  languages: z.array(z.string()),
  intent: z.enum(profileIntents),
  averageRating: z.number().min(0).max(5),
  ratingCount: z.number().int().min(0),
  isIdentityVerified: z.boolean(),
});

export const privateProfileSchema = publicProfileSchema.extend({
  email: z.email(),
  accountRole: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  accountStatus: z.enum(["ACTIVE", "SUSPENDED", "BLOCKED", "DELETED"]),
  emailVerified: z.boolean(),
  pincode: z.string().optional(),
  womenOnlyVisibility: z.boolean().optional(),
});

export const publicServiceSchema = z.object({
  id: domainIdSchema,
  providerId: domainIdSchema,
  category: z.enum(serviceCategories),
  title: z.string().min(1),
  description: z.string(),
  pricingType: z.enum(pricingTypes),
  price: nonnegativeAmountSchema,
  city: z.string().optional(),
  availability: z.array(availabilitySchema),
});

export const publicTrustSummarySchema = z.object({
  userId: domainIdSchema,
  trustScore: z.number().min(TRUST_SCORE_MIN).max(TRUST_SCORE_MAX),
  completedBookings: z.number().int().min(0),
  repeatBookings: z.number().int().min(0),
  recommendation: z.enum(recommendationStates),
  reasons: z.array(z.string()),
});

export const createPlanRequestSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(2000).optional(),
    date: z.iso.datetime(),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    locationText: z.string().trim().min(2),
    city: z.string().trim().min(1).optional(),
    pincode: z.string().trim().min(1).optional(),
    peopleRequired: z.number().int().min(1),
    pricingType: z.enum(planPricingTypes),
    price: nonnegativeAmountSchema.optional(),
  })
  .refine(
    (plan) =>
      plan.pricingType === "FREE"
        ? (plan.price ?? 0) === 0
        : (plan.price ?? 0) > 0,
    {
      message: "Paid plans need a positive fee; free plans need a zero fee",
      path: ["price"],
    },
  );
