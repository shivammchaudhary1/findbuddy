import { z } from "zod";
import {
  bookingStatuses,
  pricingTypes,
  recommendationStates,
} from "@findbuddy/constants";

const id = z.string().min(1);
const nonnegative = z.number().min(0);
const link = z.object({ label: z.string(), href: z.string() });
export const profileSchema = z.object({
  _id: id,
  userId: id,
  name: z.string().min(1),
  age: z.number().int().positive(),
  city: z.string(),
  pincode: z.string(),
  gender: z.string(),
  bio: z.string().max(1000),
  interests: z.array(z.string()),
  languages: z.array(z.string()),
  intent: z.enum(["OFFER", "BOOK", "BOTH"]),
  image: z.url(),
  averageRating: z.number().min(0).max(5),
  ratingCount: nonnegative.int(),
  isIdentityVerified: z.boolean(),
  womenOnlyVisibility: z.boolean(),
});
export const serviceSchema = z
  .object({
    _id: id,
    providerId: id,
    category: id,
    title: z.string().min(1).max(120),
    description: z.string().max(2000),
    price: nonnegative,
    pricingType: z.enum(pricingTypes),
    city: z.string(),
    pincode: z.string(),
    locationText: z.string(),
    availability: z.array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
      }),
    ),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "REMOVED"]),
    image: z.url(),
  })
  .refine((s) => s.pricingType !== "FREE" || s.price === 0, {
    message: "Free activities must have a zero fee.",
  });
export const planSchema = z
  .object({
    _id: id,
    creatorId: id,
    title: z.string().min(3).max(120),
    description: z.string().max(2000),
    date: z.iso.datetime(),
    locationText: z.string().min(2),
    city: z.string(),
    peopleRequired: z.number().int().min(2).max(100),
    pricingType: z.enum(["FREE", "PAID"]),
    price: nonnegative,
    image: z.url(),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),
  })
  .refine((p) => (p.pricingType === "FREE" ? p.price === 0 : p.price > 0), {
    message: "Paid plans need a positive fee; free plans need a zero fee.",
  });
export const bookingSchema = z.object({
  _id: id,
  serviceId: id,
  providerId: id,
  consumerId: id,
  scheduledAt: z.iso.datetime(),
  status: z.enum(bookingStatuses),
  serviceSnapshot: z.object({
    title: z.string(),
    category: id,
    pricingType: z.enum(pricingTypes),
    price: nonnegative,
  }),
  paymentRequired: z.boolean(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  locationText: z.string(),
});
export const trustSchema = z.object({
  userId: id,
  computedScore: z.number().min(0).max(100),
  manualAdjustment: z.number(),
  finalScore: z.number().min(0).max(100),
  completedBookings: nonnegative.int(),
  repeatBookings: nonnegative.int(),
  recommendation: z.enum(recommendationStates),
  reasons: z.array(z.string()),
});
export const subscriptionSchema = z.object({
  _id: id,
  userId: id,
  planCode: z.literal("PRO_MONTHLY_299"),
  amount: nonnegative,
  currency: z.literal("INR"),
  status: z.enum(["PENDING", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED"]),
  currentPeriodEnd: z.iso.datetime(),
});
export const websiteSchema = z.object({
  site: z.object({
    name: z.string(),
    tagline: z.string(),
    business: z.string(),
    heroTitle: z.string(),
    heroDescription: z.string(),
    heroImage: z.url(),
    heroImageAlt: z.string(),
    city: z.string(),
    demoNotice: z.string(),
    safetyNote: z.string(),
    proPrice: nonnegative,
    home: z.object({
      heroEyebrow: z.string(),
      heroLead: z.string(),
      heroTail: z.string(),
      heroAccent: z.string(),
      heroNote: z.string(),
      heroNoteSub: z.string(),
      activitiesTitle: z.string(),
      activitiesDescription: z.string(),
      buddiesTitle: z.string(),
      buddiesDescription: z.string(),
      plansTitle: z.string(),
      plansDescription: z.string(),
      safetyEyebrow: z.string(),
      safetyTitle: z.string(),
      safetyDescription: z.string(),
      howTitle: z.string(),
      howDescription: z.string(),
      proTitle: z.string(),
      proSubtitle: z.string(),
      proDescription: z.string(),
      ctaEyebrow: z.string(),
      ctaTitle: z.string(),
      ctaSubtitle: z.string(),
      valueItems: z
        .array(z.object({ title: z.string(), description: z.string() }))
        .length(4),
    }),
    proBenefits: z.array(z.string()),
    howItWorks: z.array(
      z.object({ title: z.string(), description: z.string() }),
    ),
  }),
  navigation: z.object({
    main: z.array(link),
    account: z.array(link),
    admin: z.array(link),
  }),
  currentUser: z.object({ userId: id }),
  users: z.array(
    z.object({
      _id: id,
      email: z.email(),
      accountRole: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
      accountStatus: z.enum(["ACTIVE", "SUSPENDED", "BLOCKED", "DELETED"]),
    }),
  ),
  profiles: z.array(profileSchema),
  categories: z.array(z.object({ id, name: z.string(), image: z.url() })),
  services: z.array(serviceSchema),
  plans: z.array(planSchema),
  planJoinRequests: z.array(
    z.object({
      _id: id,
      planId: id,
      requesterId: id,
      status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"]),
    }),
  ),
  bookings: z.array(bookingSchema),
  reviews: z.array(
    z.object({
      _id: id,
      bookingId: id,
      reviewerId: id,
      revieweeId: id,
      overallRating: z.number().int().min(1).max(5),
      behaviourRating: z.number().int().min(1).max(5),
      punctualityRating: z.number().int().min(1).max(5),
      profileAccuracyRating: z.number().int().min(1).max(5),
      wouldBookAgain: z.boolean(),
      comment: z.string(),
      status: z.enum(["ACTIVE", "REMOVED"]),
      createdAt: z.iso.datetime(),
    }),
  ),
  trustScores: z.array(trustSchema),
  subscriptions: z.array(subscriptionSchema),
  conversations: z.array(
    z.object({
      _id: id,
      type: z.enum(["BOOKING", "PLAN"]),
      referenceId: id,
      participantIds: z.array(id).min(2),
    }),
  ),
  messages: z.array(
    z.object({
      _id: id,
      conversationId: id,
      senderId: id,
      text: z.string().min(1).max(2000),
      createdAt: z.iso.datetime(),
      type: z.literal("TEXT"),
    }),
  ),
  notifications: z.array(
    z.object({
      _id: id,
      userId: id,
      title: z.string(),
      body: z.string(),
      href: z.string(),
      read: z.boolean(),
    }),
  ),
  reports: z.array(
    z.object({
      _id: id,
      reporterId: id,
      reportedUserId: id,
      category: z.string(),
      description: z.string(),
      severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
      status: z.enum([
        "OPEN",
        "UNDER_REVIEW",
        "CONFIRMED",
        "DISMISSED",
        "RESOLVED",
      ]),
    }),
  ),
  verificationRequests: z.array(
    z.object({
      _id: id,
      userId: id,
      status: z.enum(["INITIATED", "PENDING", "VERIFIED", "FAILED", "EXPIRED"]),
    }),
  ),
  trustedContacts: z.array(
    z.object({ userId: id, name: z.string(), contactValue: z.string() }),
  ),
  safetyEvents: z.array(
    z.object({
      userId: id,
      type: z.enum(["SOS", "MEETUP_CHECK_IN", "MEETUP_CHECK_OUT"]),
    }),
  ),
  blocks: z.array(z.object({ blockerId: id, blockedUserId: id })),
  trustScoreEvents: z.array(
    z.object({
      userId: id,
      delta: z.number(),
      reason: z.string(),
      actorAdminId: id,
      createdAt: z.iso.datetime(),
    }),
  ),
  adminAuditLogs: z.array(
    z.object({
      _id: id,
      adminId: id,
      action: z.string(),
      reason: z.string(),
      targetType: z.string(),
      targetId: id,
      before: z.record(z.string(), z.unknown()),
      after: z.record(z.string(), z.unknown()),
      createdAt: z.iso.datetime(),
    }),
  ),
});
