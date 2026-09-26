# FindBuddy — Low-Level Design (LLD)

**Product:** FindBuddy  
**Business Entity:** The Logic Machines  
**Document:** Low-Level Design  
**Version:** 1.0 — LOCKED FOR MVP  
**Based on:** FindBuddy MVP/BRD + HLD v1.0

---

# 1. LLD Goal

This document defines implementation-level structure for the locked FindBuddy MVP.

The LLD covers:

- Backend module structure.
- Data models.
- API contracts.
- Authentication.
- Authorization.
- Free vs Pro pricing rules.
- Booking state machine.
- Plans.
- Chat.
- Payments.
- Subscription.
- Aadhaar verification abstraction.
- Trust Score.
- Recommendation logic.
- Ratings/reviews.
- Safety/reporting.
- Notifications.
- Admin operations.
- Deployment/runtime implementation.

---

# 2. Backend Source Structure

```text
apps/api/src/
├── app.ts
├── server.ts
│
├── config/
│   ├── env.ts
│   ├── database.ts
│   ├── logger.ts
│   └── constants.ts
│
├── common/
│   ├── errors/
│   ├── middleware/
│   ├── auth/
│   ├── validation/
│   ├── pagination/
│   ├── response/
│   ├── security/
│   └── types/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── profiles/
│   ├── services/
│   ├── plans/
│   ├── bookings/
│   ├── chat/
│   ├── payments/
│   ├── subscriptions/
│   ├── verification/
│   ├── trust-score/
│   ├── reviews/
│   ├── safety/
│   ├── notifications/
│   ├── media/
│   └── admin/
│
├── integrations/
│   ├── razorpay/
│   ├── firebase/
│   ├── s3/
│   └── verification/
│
└── docs/
    └── openapi.ts
```

Each business module follows:

```text
module/
├── module.routes.ts
├── module.controller.ts
├── module.service.ts
├── module.repository.ts
├── module.model.ts
├── module.schema.ts
├── module.types.ts
├── module.constants.ts
└── __tests__/
```

---

# 3. Backend Layer Rules

## Route

Responsible for:

- HTTP route declaration.
- Middleware composition.
- Validation middleware.
- Controller binding.

Must not contain business logic.

## Controller

Responsible for:

- Read validated input.
- Call service.
- Return normalized response.

Must not directly query MongoDB.

## Service

Responsible for:

- Business rules.
- Permissions that depend on domain state.
- Transaction orchestration.
- Cross-module calls.

## Repository

Responsible for:

- MongoDB/Mongoose queries.
- Persistence-specific behavior.

## Model

Responsible for:

- Schema.
- Indexes.
- Persistence validation.

---

# 4. Shared API Contract

All API responses follow:

```ts
type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

Pagination:

```ts
type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
```

---

# 5. User Model

Collection:

```text
users
```

Schema:

```ts
type User = {
  _id: ObjectId;
  email: string;
  passwordHash: string;

  accountRole: "USER" | "ADMIN" | "SUPER_ADMIN";
  accountStatus: "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DELETED";

  emailVerifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
};
```

Indexes:

```text
email unique
accountStatus
createdAt
```

Important:

Pro membership is not permanently encoded into `accountRole`.

Pro status comes from subscription entitlement.

---

# 6. Profile Model

Collection:

```text
profiles
```

```ts
type Profile = {
  _id: ObjectId;
  userId: ObjectId;

  name: string;
  age?: number;
  gender?: string;
  city?: string;
  pincode?: string;
  bio?: string;

  profilePhotoMediaId?: ObjectId;

  interests: string[];
  languages: string[];

  intent: "OFFER" | "BOOK" | "BOTH";

  womenOnlyVisibility?: boolean;

  averageRating: number;
  ratingCount: number;

  isIdentityVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
};
```

Indexes:

```text
userId unique
city
pincode
isIdentityVerified
averageRating
```

---

# 7. Subscription Model

Collection:

```text
subscriptions
```

```ts
type Subscription = {
  _id: ObjectId;
  userId: ObjectId;

  planCode: "PRO_MONTHLY_299";
  amount: number;
  currency: "INR";

  provider: "RAZORPAY";
  providerSubscriptionId?: string;

  status:
    | "PENDING"
    | "ACTIVE"
    | "PAST_DUE"
    | "CANCELLED"
    | "EXPIRED";

  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;

  createdAt: Date;
  updatedAt: Date;
};
```

Index:

```text
userId + status
providerSubscriptionId unique sparse
```

Pro check:

```ts
isPro =
  subscription.status === "ACTIVE" &&
  subscription.currentPeriodEnd > now;
```

---

# 8. Free vs Pro Pricing Rules

Locked business rule:

## Free User

- Can create free service.
- Can create paid service.
- Maximum paid price: **₹500 per service/session**.
- Cannot use `PER_HOUR`.

## Pro User

- Can use `PER_HOUR`.
- Can use `PER_SESSION`.
- Can offer `FREE`.
- Can set price above ₹500.

Central function:

```ts
validateServicePricing({
  isPro,
  pricingType,
  price
})
```

Pseudo logic:

```ts
if (pricingType === "FREE") {
  require price === 0;
}

if (!isPro) {
  reject pricingType === "PER_HOUR";

  if (pricingType === "PER_SESSION" && price > 500) {
    throw FREE_USER_PRICE_LIMIT;
  }
}

if (isPro) {
  allow PER_HOUR;
  allow PER_SESSION;
}
```

This validation must run on both create and update.

Frontend validation is convenience only; backend is authoritative.

---

# 9. Service Model

Collection:

```text
services
```

```ts
type BuddyService = {
  _id: ObjectId;
  providerId: ObjectId;

  category:
    | "GYM_BUDDY"
    | "CLUB_BUDDY"
    | "COFFEE_BUDDY"
    | "MOVIE_PARTNER"
    | "TRAVEL_BUDDY"
    | "ONLY_LISTENING"
    | "SHOPPING_BUDDY"
    | "GAMING_BUDDY"
    | "EVENT_BUDDY"
    | "CUSTOM";

  title: string;
  description: string;

  pricingType: "FREE" | "PER_SESSION" | "PER_HOUR";
  price: number;

  city?: string;
  pincode?: string;

  availability?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];

  status: "DRAFT" | "ACTIVE" | "PAUSED" | "REMOVED";

  createdAt: Date;
  updatedAt: Date;
};
```

Indexes:

```text
providerId + status
category + city + status
pincode + category + status
price
createdAt
```

---

# 10. Plan Model

Collection:

```text
plans
```

```ts
type Plan = {
  _id: ObjectId;
  creatorId: ObjectId;

  title: string;
  description?: string;

  date: Date;
  time?: string;

  locationText: string;
  city?: string;
  pincode?: string;

  peopleRequired: number;

  pricingType: "FREE" | "PAID";
  price?: number;

  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

  createdAt: Date;
  updatedAt: Date;
};
```

Index:

```text
creatorId + createdAt
city + date + status
pincode + date + status
```

---

# 11. Plan Join Request Model

Collection:

```text
planJoinRequests
```

```ts
type PlanJoinRequest = {
  _id: ObjectId;
  planId: ObjectId;
  requesterId: ObjectId;

  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

  createdAt: Date;
  updatedAt: Date;
};
```

Unique compound index:

```text
planId + requesterId
```

---

# 12. Booking Model

Collection:

```text
bookings
```

```ts
type Booking = {
  _id: ObjectId;

  serviceId: ObjectId;
  providerId: ObjectId;
  consumerId: ObjectId;

  scheduledAt: Date;

  status:
    | "REQUESTED"
    | "ACCEPTED"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED";

  serviceSnapshot: {
    title: string;
    category: string;
    pricingType: "FREE" | "PER_SESSION" | "PER_HOUR";
    price: number;
  };

  paymentRequired: boolean;
  paymentId?: ObjectId;

  completedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
};
```

Indexes:

```text
providerId + status + scheduledAt
consumerId + status + scheduledAt
serviceId + createdAt
```

Rules:

- Provider cannot book their own service.
- Booking user and provider must be active accounts.
- Removed/paused service cannot receive new booking.
- Price is copied into `serviceSnapshot`.
- Historical booking amount does not change if provider later edits service.

---

# 13. Booking State Transitions

Allowed transitions:

```text
REQUESTED -> ACCEPTED
REQUESTED -> REJECTED
REQUESTED -> CANCELLED

ACCEPTED -> CANCELLED
ACCEPTED -> COMPLETED
```

Invalid transition example:

```text
REJECTED -> COMPLETED
```

State transition logic exists in one service:

```ts
bookingStateMachine.transition(current, next)
```

Do not scatter status rules across controllers.

---

# 14. Review Model

Collection:

```text
reviews
```

```ts
type Review = {
  _id: ObjectId;

  bookingId: ObjectId;
  reviewerId: ObjectId;
  revieweeId: ObjectId;

  overallRating: number;
  behaviourRating: number;
  punctualityRating: number;
  profileAccuracyRating: number;
  wouldBookAgain: boolean;

  comment?: string;

  status: "ACTIVE" | "REMOVED";

  createdAt: Date;
  updatedAt: Date;
};
```

Constraints:

- Review only after completed booking.
- One review per reviewer per booking.
- Reviewer must be booking participant.

Unique index:

```text
bookingId + reviewerId
```

After review:

- Update profile rating aggregate.
- Trigger Trust Score recalculation.

---

# 15. Trust Score Data Model

## Current Score

Collection:

```text
trustScores
```

```ts
type TrustScore = {
  _id: ObjectId;
  userId: ObjectId;

  computedScore: number;
  manualAdjustment: number;
  finalScore: number;

  factors: {
    bookingCompletion: number;
    rating: number;
    repeatBookings: number;
    verification: number;
    cancellations: number;
    complaints: number;
    platformBehaviour: number;
  };

  calculatedAt: Date;
  updatedAt: Date;
};
```

`finalScore`:

```ts
clamp(computedScore + manualAdjustment, 0, 100)
```

## Score Event

Collection:

```text
trustScoreEvents
```

```ts
type TrustScoreEvent = {
  _id: ObjectId;
  userId: ObjectId;

  source:
    | "BOOKING"
    | "REVIEW"
    | "REPEAT_BOOKING"
    | "VERIFICATION"
    | "CANCELLATION"
    | "REPORT"
    | "ADMIN"
    | "SYSTEM";

  referenceId?: ObjectId;

  delta?: number;
  reason: string;

  actorAdminId?: ObjectId;

  createdAt: Date;
};
```

All Admin changes must create an event.

---

# 16. Initial Trust Score Algorithm

This is implementation logic, not a guarantee of user safety.

Initial neutral score:

```text
50
```

Suggested computed components:

```text
Booking completion history        max +15
Average rating                    max +15
Repeat bookings                   max +10
Identity verification             max +10
Low cancellation behavior         max +5
Positive platform behavior        max +5

Cancellation penalties            down to -10
Confirmed complaint penalties     down to -25
Safety / suspicious behavior      down to -30
```

Then:

```text
computedScore = clamp(50 + positives - penalties, 0, 100)
finalScore = clamp(computedScore + manualAdjustment, 0, 100)
```

Important:

- Exact weights live in configuration/constants.
- Scores are recalculated from source data when needed.
- Admin adjustment is separately auditable.
- Subscription payment alone does not directly buy points.
- Successful identity verification may add verification points.

---

# 17. Repeat Booking Logic

A repeat booking is counted when:

- Same provider and consumer.
- Previous booking is `COMPLETED`.
- New booking is also eventually `COMPLETED`.

A provider with repeated successful bookings receives positive repeat-booking contribution.

Prevent abuse:

- Cancelled/rejected bookings do not count.
- Multiple incomplete requests do not count.
- Score calculation can cap repeat-booking contribution.

---

# 18. Recommendation Engine

Input:

```ts
type RecommendationInput = {
  trustScore: number;
  isIdentityVerified: boolean;
  averageRating: number;
  completedBookings: number;
  repeatBookings: number;
  cancellationRate: number;
  confirmedComplaintCount: number;
  activeHighSeveritySafetyFlag: boolean;
};
```

Output:

```ts
type BookingRecommendation = {
  state:
    | "RECOMMENDED"
    | "PROCEED_WITH_CAUTION"
    | "NOT_RECOMMENDED";

  reasons: string[];
};
```

Initial rules:

```text
NOT_RECOMMENDED
- Active high-severity safety restriction; OR
- Trust Score below configured low threshold.

RECOMMENDED
- Trust Score at/above configured high threshold;
- No active high-severity safety restriction;
- Sufficient positive history.

PROCEED_WITH_CAUTION
- New account / limited history; OR
- Score between thresholds; OR
- Not verified with limited booking history.
```

Suggested initial thresholds:

```text
High threshold: 75
Low threshold: 40
```

These thresholds are server-side configuration and can be changed without a mobile release.

---

# 19. Verification Model

Collection:

```text
verificationRequests
```

```ts
type VerificationRequest = {
  _id: ObjectId;
  userId: ObjectId;

  type: "AADHAAR_IDENTITY";

  provider: string;
  providerReference: string;

  status:
    | "INITIATED"
    | "PENDING"
    | "VERIFIED"
    | "FAILED"
    | "EXPIRED";

  initiatedAt: Date;
  verifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
};
```

Do not store unnecessary full Aadhaar details in profile/user records.

---

# 20. Identity Verification Provider Interface

```ts
interface IdentityVerificationProvider {
  initiateVerification(input: {
    userId: string;
    callbackUrl: string;
  }): Promise<{
    providerReference: string;
    redirectUrl?: string;
  }>;

  getVerificationStatus(
    providerReference: string
  ): Promise<"PENDING" | "VERIFIED" | "FAILED" | "EXPIRED">;

  verifyWebhook(
    headers: Record<string, string>,
    rawBody: string
  ): Promise<boolean>;
}
```

This keeps FindBuddy independent of a single KYC vendor.

---

# 21. Payment Model

Collection:

```text
payments
```

```ts
type Payment = {
  _id: ObjectId;

  userId: ObjectId;

  purpose:
    | "SERVICE_BOOKING"
    | "PLAN"
    | "PRO_SUBSCRIPTION";

  referenceId: ObjectId;

  provider: "RAZORPAY";

  amount: number;
  currency: "INR";

  providerOrderId?: string;
  providerPaymentId?: string;

  status:
    | "CREATED"
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";

  createdAt: Date;
  updatedAt: Date;
};
```

Indexes:

```text
referenceId + purpose
providerOrderId
providerPaymentId
```

---

# 22. Razorpay Webhook Processing

Endpoint:

```text
POST /api/v1/webhooks/razorpay
```

Processing:

1. Read raw request body.
2. Verify Razorpay signature.
3. Extract event id.
4. Check idempotency.
5. Update payment/subscription.
6. Emit internal domain action.
7. Return 2xx.

Webhook event ids must be stored or otherwise protected from duplicate processing.

---

# 23. Chat Models

## Conversation

Collection:

```text
conversations
```

```ts
type Conversation = {
  _id: ObjectId;

  type: "BOOKING" | "PLAN";
  referenceId: ObjectId;

  participantIds: ObjectId[];

  createdAt: Date;
  updatedAt: Date;
};
```

## Message

Collection:

```text
messages
```

```ts
type Message = {
  _id: ObjectId;
  conversationId: ObjectId;
  senderId: ObjectId;

  type: "TEXT";
  text: string;

  createdAt: Date;
};
```

Indexes:

```text
conversationId + createdAt
participantIds
```

---

# 24. Socket.IO Events

Client -> server:

```text
conversation:join
message:send
```

Server -> client:

```text
conversation:joined
message:new
message:error
```

Authorization:

- Validate authenticated socket.
- Validate user is participant of referenced booking/plan conversation.
- Never trust client-provided participant list.

---

# 25. Notification Models

Collection:

```text
notifications
```

```ts
type Notification = {
  _id: ObjectId;
  userId: ObjectId;

  type:
    | "BOOKING_REQUEST"
    | "BOOKING_ACCEPTED"
    | "BOOKING_REJECTED"
    | "PLAN_JOIN_REQUEST"
    | "PLAN_JOIN_ACCEPTED"
    | "PLAN_JOIN_REJECTED"
    | "CHAT_MESSAGE"
    | "BOOKING_REMINDER"
    | "REVIEW_REQUEST"
    | "VERIFICATION_STATUS"
    | "SUBSCRIPTION_STATUS";

  title: string;
  body: string;

  referenceType?: string;
  referenceId?: ObjectId;

  readAt?: Date;

  createdAt: Date;
};
```

---

# 26. Device Token Model

Collection:

```text
deviceTokens
```

```ts
type DeviceToken = {
  _id: ObjectId;
  userId: ObjectId;
  platform: "ANDROID" | "WEB";
  token: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

Unique:

```text
token
```

---

# 27. Safety Models

## Report

Collection:

```text
reports
```

```ts
type Report = {
  _id: ObjectId;

  reporterId: ObjectId;
  reportedUserId: ObjectId;

  bookingId?: ObjectId;
  planId?: ObjectId;

  category: string;
  description?: string;

  severity: "LOW" | "MEDIUM" | "HIGH";

  status:
    | "OPEN"
    | "UNDER_REVIEW"
    | "CONFIRMED"
    | "DISMISSED"
    | "RESOLVED";

  reviewedByAdminId?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
};
```

## Block

Collection:

```text
blocks
```

```ts
type Block = {
  _id: ObjectId;
  blockerId: ObjectId;
  blockedUserId: ObjectId;
  createdAt: Date;
};
```

Unique:

```text
blockerId + blockedUserId
```

## Safety Event

Collection:

```text
safetyEvents
```

```ts
type SafetyEvent = {
  _id: ObjectId;
  userId: ObjectId;
  bookingId?: ObjectId;

  type:
    | "SOS"
    | "MEETUP_CHECK_IN"
    | "MEETUP_CHECK_OUT";

  metadata?: Record<string, unknown>;

  createdAt: Date;
};
```

Sensitive metadata must be minimized.

---

# 28. Trusted Contact

Profile-linked trusted-contact information should be stored separately from public profile fields.

Collection:

```text
trustedContacts
```

```ts
type TrustedContact = {
  _id: ObjectId;
  userId: ObjectId;

  name: string;
  contactValue: string;

  createdAt: Date;
  updatedAt: Date;
};
```

This information is private.

---

# 29. Media Model

Collection:

```text
media
```

```ts
type Media = {
  _id: ObjectId;
  ownerUserId: ObjectId;

  kind: "PROFILE_IMAGE";
  storage: "S3";

  bucket: string;
  objectKey: string;
  mimeType: string;
  sizeBytes: number;

  status: "PENDING" | "ACTIVE" | "DELETED";

  createdAt: Date;
  updatedAt: Date;
};
```

Upload flow:

1. `POST /media/presign`
2. API validates mime/size intent.
3. API creates pending media record.
4. API creates presigned S3 URL.
5. Client uploads directly.
6. Client confirms upload.
7. API verifies object metadata.
8. Media becomes ACTIVE.

---

# 30. Core API Route Map

Base:

```text
/api/v1
```

## Auth

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/verify-email
POST   /auth/forgot-password
POST   /auth/reset-password
```

## Me/Profile

```text
GET    /me
PATCH  /me/profile
GET    /users/:userId/profile
```

## Services

```text
POST   /services
GET    /services
GET    /services/:serviceId
PATCH  /services/:serviceId
DELETE /services/:serviceId
GET    /me/services
```

## Bookings

```text
POST   /bookings
GET    /bookings/:bookingId
GET    /me/bookings
PATCH  /bookings/:bookingId/accept
PATCH  /bookings/:bookingId/reject
PATCH  /bookings/:bookingId/cancel
PATCH  /bookings/:bookingId/complete
```

## Reviews

```text
POST   /bookings/:bookingId/reviews
GET    /users/:userId/reviews
```

## Plans

```text
POST   /plans
GET    /plans
GET    /plans/:planId
PATCH  /plans/:planId
DELETE /plans/:planId
POST   /plans/:planId/join
PATCH  /plans/:planId/join-requests/:requestId/accept
PATCH  /plans/:planId/join-requests/:requestId/reject
```

## Chat

```text
GET    /conversations
GET    /conversations/:conversationId/messages
```

## Trust

```text
GET    /users/:userId/trust
GET    /users/:userId/recommendation
```

## Subscription

```text
GET    /me/subscription
POST   /subscriptions/pro
POST   /subscriptions/:id/cancel
```

## Verification

```text
POST   /verification/aadhaar/initiate
GET    /verification/status
```

## Media

```text
POST   /media/presign
POST   /media/:mediaId/confirm
```

## Safety

```text
POST   /users/:userId/block
DELETE /users/:userId/block
POST   /reports
POST   /safety/sos
POST   /bookings/:bookingId/check-in
POST   /bookings/:bookingId/check-out
```

## Notifications

```text
GET    /notifications
PATCH  /notifications/:id/read
```

---

# 31. Admin API Route Map

Base:

```text
/api/v1/admin
```

```text
GET    /users
GET    /users/:userId
PATCH  /users/:userId/status

GET    /verifications
PATCH  /verifications/:id/approve
PATCH  /verifications/:id/reject

GET    /services
PATCH  /services/:id/remove

GET    /plans
PATCH  /plans/:id/remove

GET    /bookings

GET    /trust/:userId
POST   /trust/:userId/adjust

GET    /reports
PATCH  /reports/:id

GET    /subscriptions
```

Admin actions create audit logs.

---

# 32. Admin Audit Log

Collection:

```text
adminAuditLogs
```

```ts
type AdminAuditLog = {
  _id: ObjectId;

  adminId: ObjectId;
  action: string;

  targetType: string;
  targetId?: ObjectId;

  reason?: string;

  before?: Record<string, unknown>;
  after?: Record<string, unknown>;

  createdAt: Date;
};
```

Mandatory for:

- Trust Score adjustment.
- Verification decision.
- User suspension/block.
- Report resolution.
- Service/plan moderation.

---

# 33. Validation Rules

Examples:

## Registration

```text
email: valid normalized email
password: minimum secure password policy
```

## Profile

```text
name: required
age: numeric if provided
pincode: normalized string if provided
bio: bounded length
```

## Service

```text
title: required
description: bounded
price: >= 0
pricingType: enum
free-user business restrictions enforced server-side
```

## Review

```text
ratings: integer 1..5
wouldBookAgain: boolean
```

All public request validation uses Zod.

---

# 34. Security Middleware Order

Typical protected request:

```text
requestId
-> securityHeaders
-> rateLimit
-> bodyParser
-> authentication
-> accountStatusCheck
-> authorization
-> schemaValidation
-> controller
-> errorHandler
```

Webhook routes may require raw-body processing before JSON parsing.

---

# 35. Rate Limiting

MVP rate limiting is application-level.

Separate limits for:

- Login.
- Register.
- Password reset.
- Chat send.
- Report submission.
- Payment-order creation.
- Verification initiation.

No Redis-backed global limiter while only one API instance exists.

---

# 36. Refresh Token Model

Collection:

```text
refreshTokens
```

```ts
type RefreshToken = {
  _id: ObjectId;
  userId: ObjectId;

  tokenHash: string;
  familyId: string;

  expiresAt: Date;
  revokedAt?: Date;

  createdAt: Date;
};
```

Refresh rotation:

- New refresh token on refresh.
- Old token revoked.
- Reuse detection can revoke token family.

---

# 37. Login Session Behavior

Web:

- Refresh token in secure HTTP-only cookie.
- Access token kept short-lived.
- CSRF protection where cookie-based authenticated mutation requires it.

Mobile:

- Refresh token stored using secure device storage.
- Access token held in memory where practical.

---

# 38. Internal Domain Events

Use lightweight in-process domain events, not Kafka.

Examples:

```text
booking.created
booking.accepted
booking.completed
review.created
verification.verified
subscription.activated
report.confirmed
trust.recalculate
```

Consumers:

- Notifications.
- Trust calculation.
- Rating aggregation.

This reduces coupling while keeping one process.

---

# 39. Transaction Boundaries

MongoDB transaction/session should be used only where multiple writes must succeed atomically.

Examples:

- Booking completion + related state updates where needed.
- Admin moderation + audit log where consistency is critical.
- Payment/subscription transitions where multiple documents change.

Avoid transactions for simple single-document writes.

---

# 40. Idempotency

Required for:

- Payment webhook.
- Verification webhook.
- Sensitive payment-order creation where retries can duplicate operations.

Idempotency key format:

```text
provider/event-id
```

or request-level client idempotency key when supported.

---

# 41. Background Jobs

MVP has no separate queue infrastructure.

Jobs:

- Booking reminder.
- Subscription expiry reconciliation.
- Notification retries.
- Trust Score recalculation.
- Cleanup of expired refresh tokens / pending media.

Implementation:

- Scheduled job runner within backend deployment, protected so only one instance executes jobs.
- Once multiple API instances exist, move scheduled jobs to a dedicated worker/queue.

---

# 42. Frontend Web Structure

```text
apps/web/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── dashboard/
│   └── admin/
├── components/
├── features/
│   ├── auth/
│   ├── profile/
│   ├── services/
│   ├── plans/
│   ├── bookings/
│   ├── chat/
│   ├── trust/
│   └── admin/
├── lib/
│   ├── api/
│   ├── auth/
│   └── query/
└── middleware.ts
```

Rules:

- Feature-based UI modules.
- API logic not duplicated across pages.
- Server-state through TanStack Query.
- Shared typed API contracts from `packages/contracts`.

---

# 43. Mobile Structure

```text
apps/mobile/
├── app/
│   ├── (auth)/
│   ├── (tabs)/
│   ├── service/
│   ├── booking/
│   ├── plan/
│   ├── chat/
│   └── profile/
├── src/
│   ├── features/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── utils/
└── app.json
```

Use:

- Expo Router navigation.
- TanStack Query for API.
- Zustand for small local app state only.
- SecureStore for sensitive session token storage.

---

# 44. Environment Variables

Example API environment contract:

```text
NODE_ENV
PORT

MONGODB_URI

JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_TTL
JWT_REFRESH_TTL

WEB_ORIGIN
API_PUBLIC_URL

AWS_REGION
AWS_S3_BUCKET

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET

FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY

VERIFICATION_PROVIDER
VERIFICATION_API_KEY
VERIFICATION_WEBHOOK_SECRET
```

Startup should fail fast if required variables are missing.

---

# 45. Nginx Configuration Responsibilities

Nginx:

- Terminates origin HTTPS as configured.
- Reverse proxies to API container.
- Sets proxy headers.
- Supports WebSocket upgrade.
- Applies reasonable request body limit.
- Does not expose internal application port.

Socket.IO path must support upgrade headers.

---

# 46. Docker Compose Production Shape

Conceptual:

```yaml
services:
  api:
    build: ../../apps/api
    restart: unless-stopped
    env_file:
      - .env.production
    expose:
      - "8888"

  nginx:
    image: nginx:stable-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
```

MongoDB is external.

---

# 47. Database Connection Rules

Mongoose:

- Singleton database connection per API process.
- Appropriate connection pool.
- Fail readiness if DB unavailable.
- Do not open one DB connection per request.

Production indexes are explicitly reviewed.

---

# 48. S3 Object Key Convention

Example:

```text
users/{userId}/profile/{uuid}.{ext}
```

Never use user-provided filenames as canonical keys.

Presign response:

```json
{
  "mediaId": "...",
  "uploadUrl": "...",
  "objectKey": "users/.../profile/..."
}
```

---

# 49. API Logging

Per request:

```text
requestId
method
route
status
durationMs
userId if authenticated
```

Error log:

```text
requestId
errorCode
safe message
stack in server logs
```

Sensitive values are redacted.

---

# 50. Important Error Codes

```text
AUTH_INVALID_CREDENTIALS
AUTH_EMAIL_NOT_VERIFIED
AUTH_TOKEN_EXPIRED
ACCOUNT_SUSPENDED

SERVICE_NOT_FOUND
SERVICE_NOT_ACTIVE
FREE_USER_PRICE_LIMIT
PRO_REQUIRED_FOR_HOURLY_PRICING

BOOKING_NOT_FOUND
BOOKING_INVALID_STATE
BOOKING_SELF_NOT_ALLOWED

PLAN_NOT_FOUND
PLAN_JOIN_ALREADY_EXISTS

REVIEW_NOT_ALLOWED
REVIEW_ALREADY_EXISTS

PAYMENT_FAILED
PAYMENT_SIGNATURE_INVALID

VERIFICATION_FAILED
VERIFICATION_PRO_REQUIRED

TRUST_SCORE_ADJUSTMENT_INVALID

FORBIDDEN
VALIDATION_ERROR
INTERNAL_ERROR
```

---

# 51. Admin Trust Score Adjustment Endpoint

```text
POST /api/v1/admin/trust/:userId/adjust
```

Body:

```json
{
  "delta": 5,
  "reason": "Manual verification completed"
}
```

Rules:

- Admin authentication required.
- Reason required.
- Event written to `trustScoreEvents`.
- Admin audit log written.
- Final score clamped 0..100.
- Response returns new score breakdown.

---

# 52. Recommendation Endpoint

```text
GET /api/v1/users/:userId/recommendation
```

Example:

```json
{
  "success": true,
  "data": {
    "state": "RECOMMENDED",
    "trustScore": 87,
    "reasons": [
      "Identity verified",
      "Strong completed booking history",
      "Positive ratings"
    ]
  }
}
```

No private complaint details are exposed to another user.

---

# 53. Service Creation Example

Request:

```json
{
  "category": "COFFEE_BUDDY",
  "title": "Coffee Buddy",
  "description": "Available for a coffee meetup.",
  "pricingType": "PER_SESSION",
  "price": 400,
  "city": "Indore",
  "pincode": "452001"
}
```

Backend:

1. Authenticate user.
2. Load entitlement.
3. Validate schema.
4. Apply Free/Pro pricing rule.
5. Save service.
6. Return service.

---

# 54. Booking Creation Example

Request:

```json
{
  "serviceId": "...",
  "scheduledAt": "2026-10-04T18:30:00.000Z"
}
```

Backend:

1. Authenticate.
2. Load service.
3. Confirm service active.
4. Prevent self-booking.
5. Check provider active.
6. Copy service snapshot.
7. Determine if payment is required.
8. Create booking as `REQUESTED`.
9. Create notification.

---

# 55. Review to Trust Flow

```text
Booking COMPLETED
    |
Review submitted
    |
Review validated
    |
Review saved
    |
Profile rating aggregate updated
    |
Trust score recalculation
    |
Recommendation changes if applicable
```

---

# 56. Verification to Trust Flow

```text
Pro subscription ACTIVE
    |
User initiates Aadhaar verification
    |
External provider
    |
Verified webhook
    |
verificationRequest = VERIFIED
    |
profile.isIdentityVerified = true
    |
Trust score recalculated
    |
Verified badge visible
```

---

# 57. Report to Trust / Moderation Flow

```text
User submits report
    |
Admin reviews
    |
Confirmed?
  /      \
No        Yes
|          |
Dismiss    mark CONFIRMED
            |
        moderation action
            |
        trust recalculation
```

Only confirmed reports should produce the configured confirmed-complaint penalty.

---

# 58. Subscription Expiry

When Pro expires:

- Verified identity history remains a historical fact.
- Pro-only entitlements stop.
- User cannot create/update service into a Pro-only pricing rule.
- Existing historical bookings remain unchanged.
- Existing service listings that violate Free pricing must be handled by a defined downgrade policy.

Locked downgrade policy for MVP:

- Pro-only listings become `PAUSED` on entitlement expiry.
- User can reactivate after upgrading or editing to Free-compatible pricing.

---

# 59. Account Blocking

If account becomes `SUSPENDED` or `BLOCKED`:

- Login/session authorization rejects protected actions.
- Active public services are hidden/paused by moderation process.
- User cannot create bookings/plans/messages.
- Admin retains access to audit/review data.

Historical records are not deleted automatically.

---

# 60. Soft Delete Strategy

Use status-based soft deletion for:

- Services.
- Plans.
- Reviews under moderation.
- User account lifecycle.

Do not physically delete business/audit records merely because content is no longer public.

---

# 61. Data Privacy Boundaries

Public profile can expose only fields intended for discovery.

Private fields:

- Email.
- Trusted contact.
- Refresh token data.
- KYC provider references.
- Internal reports.
- Admin audit information.
- Payment provider details.

Public API DTOs must not serialize database models directly.

Use explicit response mappers.

---

# 62. Testing Requirements Before Merge

Backend PR must pass:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Critical business logic tests required for:

- Free ₹500 limit.
- Pro hourly pricing.
- Trust calculation.
- Admin adjustments.
- Recommendation thresholds.
- Booking states.
- Review eligibility.
- Webhook signature logic.

---

# 63. Git Strategy

Recommended:

```text
main        production-ready
develop     integration/staging
feature/*   individual work
fix/*       bug fixes
```

Pull request required before merging into protected branches.

No direct production hot-editing on EC2.

---

# 64. Deployment Steps

Production API:

```text
Git push
  |
CI passes
  |
Deploy workflow
  |
EC2 pulls release
  |
docker compose build/pull
  |
docker compose up -d
  |
/health/ready
```

If health check fails:

- Deployment considered failed.
- Previous stable release should be retained for rollback.

---

# 65. Rollback

Each deployment tagged:

```text
release-YYYYMMDD-N
```

or semantic release tag.

Rollback:

```text
checkout/pull previous release
docker compose build
docker compose up -d
health check
```

Database migrations must remain backward-aware.

---

# 66. Database Migration Strategy

MongoDB is schema-flexible, but schema changes still require controlled migrations.

Create:

```text
apps/api/scripts/migrations/
```

Each migration:

- Has id/version.
- Is repeat-safe where possible.
- Logs completion.
- Is tested against staging data.

Do not rely on application startup to perform destructive migrations automatically.

---

# 67. API Documentation

Swagger/OpenAPI available in non-public or appropriately protected form:

```text
/docs
```

Every endpoint documents:

- Auth requirement.
- Request.
- Response.
- Error codes.
- Role restrictions.

Shared contract package should align with API schemas.

---

# 68. Performance Targets for MVP

Targets, not SLAs:

- Normal API response: aim for <500 ms excluding external providers.
- Paginated lists only.
- MongoDB indexed queries.
- No unbounded `.find({})`.
- Chat history paginated.
- Images not streamed through Node API.

---

# 69. Deferred Infrastructure

Explicitly not part of MVP:

- Kubernetes.
- ECS.
- Kafka.
- RabbitMQ.
- Redis.
- Elasticsearch/OpenSearch.
- Dedicated notification microservice.
- Dedicated chat microservice.
- Multi-region deployment.

They may be introduced only after measured need.

---

# 70. Final Locked Implementation Summary

```text
MOBILE
React Native + Expo + TypeScript
        |
        |
WEB / ADMIN
Next.js + TypeScript + Cloudflare Workers (vinext)
        |
        v
REST + Socket.IO
        |
AWS EC2
Nginx + Docker
Node.js + Express + TypeScript
        |
        +------ MongoDB Atlas
        |
        +------ AWS S3
        |
        +------ Razorpay
        |
        +------ Firebase FCM
        |
        +------ Aadhaar Verification Provider
```

The implementation should proceed using this LLD unless a documented architecture change is approved.
