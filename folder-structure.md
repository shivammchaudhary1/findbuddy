# FindBuddy — Folder Structure

**Project:** FindBuddy  
**Architecture:** Monorepo  
**Package Manager:** pnpm  
**Monorepo Tooling:** Turborepo  
**Primary Goal:** Reuse the same backend, API contracts, types, validations, constants, utilities, and design tokens across both Web and Mobile.

---

# 1. Recommended Repository Structure

```text
findbuddy/
│
├── apps/
│   │
│   ├── api/                         # Node.js + Express Backend
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── common/
│   │   │   │   ├── middleware/
│   │   │   │   ├── errors/
│   │   │   │   ├── auth/
│   │   │   │   └── helpers/
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── profiles/
│   │   │   │   ├── services/
│   │   │   │   ├── bookings/
│   │   │   │   ├── plans/
│   │   │   │   ├── reviews/
│   │   │   │   ├── trust-score/
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── payments/
│   │   │   │   ├── verification/
│   │   │   │   ├── chat/
│   │   │   │   ├── notifications/
│   │   │   │   ├── safety/
│   │   │   │   ├── media/
│   │   │   │   └── admin/
│   │   │   │
│   │   │   ├── integrations/
│   │   │   │   ├── razorpay/
│   │   │   │   ├── aws-s3/
│   │   │   │   ├── firebase/
│   │   │   │   └── aadhaar/
│   │   │   │
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   │
│   │   ├── tests/
│   │   └── package.json
│   │
│   │
│   ├── web/                         # Next.js Web + Admin
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   ├── (auth)/
│   │   │   ├── dashboard/
│   │   │   └── admin/
│   │   │
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── profile/
│   │   │   ├── buddies/
│   │   │   ├── services/
│   │   │   ├── plans/
│   │   │   ├── bookings/
│   │   │   ├── chat/
│   │   │   └── trust/
│   │   │
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── package.json
│   │
│   │
│   └── mobile/                      # React Native / Expo
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (tabs)/
│       │   ├── buddy/
│       │   ├── service/
│       │   ├── booking/
│       │   ├── plan/
│       │   ├── chat/
│       │   └── profile/
│       │
│       ├── src/
│       │   ├── components/
│       │   ├── features/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── store/
│       │   └── utils/
│       │
│       └── package.json
│
│
├── packages/
│   │
│   ├── contracts/                   # Shared API contracts
│   │   ├── auth/
│   │   ├── users/
│   │   ├── services/
│   │   ├── bookings/
│   │   ├── plans/
│   │   ├── reviews/
│   │   └── index.ts
│   │
│   │
│   ├── api-client/                  # Shared Web + Mobile API client
│   │   ├── src/
│   │   │   ├── auth.api.ts
│   │   │   ├── users.api.ts
│   │   │   ├── services.api.ts
│   │   │   ├── bookings.api.ts
│   │   │   ├── plans.api.ts
│   │   │   └── client.ts
│   │   └── package.json
│   │
│   │
│   ├── validation/                  # Shared Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── profile.schema.ts
│   │   ├── service.schema.ts
│   │   ├── booking.schema.ts
│   │   └── plan.schema.ts
│   │
│   │
│   ├── types/                       # Shared TypeScript types
│   │   ├── user.ts
│   │   ├── booking.ts
│   │   ├── service.ts
│   │   ├── plan.ts
│   │   └── api.ts
│   │
│   │
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── service-categories.ts
│   │   ├── booking-status.ts
│   │   └── subscription.ts
│   │
│   │
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   └── format.ts
│   │
│   │
│   ├── config/
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── prettier/
│   │
│   └── design-tokens/               # Shared branding for Web + Mobile
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       ├── radius.ts
│       └── shadows.ts
│
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   ├── aws/
│   └── scripts/
│
├── docs/
│   ├── BRD.md
│   ├── HLD.md
│   ├── LLD.md
│   └── API.md
│
├── .github/
│   └── workflows/
│       ├── api.yml
│       ├── web.yml
│       └── mobile.yml
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── .gitignore
```

---

# 2. Core Sharing Strategy

The same backend will serve both Web and Mobile.

```text
React Native Mobile
        │
        │
        ├──────────────┐
        │              │
        ▼              ▼
   api.findbuddy.com
        ▲
        │
        │
Next.js Web App
```

Both clients use the same:

- Node.js + Express backend.
- MongoDB Atlas database.
- AWS S3 media storage.
- Razorpay payments.
- Firebase notifications.
- Verification integrations.
- Trust Score engine.
- Booking logic.
- Plan logic.
- Reviews and ratings.
- Chat backend.

---

# 3. Shared Packages

Both Web and Mobile should consume:

```text
@findbuddy/api-client
@findbuddy/contracts
@findbuddy/validation
@findbuddy/types
@findbuddy/constants
@findbuddy/utils
@findbuddy/design-tokens
```

Example:

```ts
import { createBooking } from "@findbuddy/api-client";
import type { Booking } from "@findbuddy/types";
import { bookingSchema } from "@findbuddy/validation";
```

This avoids duplicating:

- API calls.
- Request/response types.
- Validation logic.
- Status enums.
- Constants.
- Common formatters.
- Branding tokens.

---

# 4. What Should Be Shared

The following should be shared between Web and Mobile:

```text
API contracts
API client
TypeScript types
Zod validation schemas
Enums
Constants
Business-rule-safe helpers
Currency formatting
Date helpers
Colors
Typography tokens
Spacing
Radius
Shadows
```

---

# 5. What Should NOT Be Shared Directly

Web and Mobile UI rendering should remain separate.

Do not force-share components like:

```text
Web Button
Mobile Button
Web Modal
Mobile Bottom Sheet
Web Navbar
Mobile Bottom Navigation
```

Reason:

- Next.js uses DOM/CSS.
- React Native uses native views.
- Interaction patterns differ.
- Accessibility and responsive behavior differ.

Instead, share the **design system tokens** used to build them.

---

# 6. Shared Design Tokens

Example:

```ts
// packages/design-tokens/colors.ts

export const colors = {
  background: "#0A0F1C",
  surface: "#111827",
  primary: "#7C3AED",
  secondary: "#A855F7",
  accent: "#C4B5FD",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  success: "#22C55E",
};
```

Both platforms can import the same values while implementing their own components.

---

# 7. Backend Module Pattern

Every backend domain should follow a consistent module structure.

Example:

```text
modules/bookings/
├── booking.routes.ts
├── booking.controller.ts
├── booking.service.ts
├── booking.repository.ts
├── booking.model.ts
├── booking.schema.ts
├── booking.types.ts
├── booking.constants.ts
└── __tests__/
```

Responsibilities:

- `routes` → route declarations and middleware.
- `controller` → request/response handling.
- `service` → business logic.
- `repository` → database queries.
- `model` → Mongoose schema/indexes.
- `schema` → validation.
- `types` → module-specific types.
- `constants` → module constants.
- `tests` → unit/integration tests.

---

# 8. Final Recommended Top-Level Structure

```text
findbuddy/
├── apps/
│   ├── api/
│   ├── web/
│   └── mobile/
│
├── packages/
│   ├── api-client/
│   ├── contracts/
│   ├── validation/
│   ├── types/
│   ├── constants/
│   ├── utils/
│   ├── design-tokens/
│   └── config/
│
├── infra/
├── docs/
├── .github/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

This structure keeps FindBuddy:

- Clean.
- Modern.
- Reusable.
- Type-safe.
- Easy to maintain.
- Cost-efficient.
- Ready for Web and Mobile from the same backend.
- Scalable without forcing microservices during MVP.
