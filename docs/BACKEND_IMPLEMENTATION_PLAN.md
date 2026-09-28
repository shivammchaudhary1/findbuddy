# FindBuddy Backend Implementation Plan

**Status:** Planning approved for review; implementation not started  
**Target:** One Node.js + Express + TypeScript API shared by web and mobile  
**Architecture:** Modular monolith, REST JSON, Socket.IO, MongoDB Atlas  
**Source of truth:** BRD v1.0, locked HLD v1.0, locked LLD v1.0, then current explicit user instructions

## 1. Current Repository Baseline

- `apps/api` is reserved and contains only `.gitkeep`.
- The pnpm/Turborepo workspace, strict TypeScript base, ESLint, Prettier, and root quality commands already exist.
- The completed web preview reads from `data/website-data.json` through `apps/web/lib/data`.
- Existing shared packages contain preview-oriented types, validation, contracts, constants, and utilities.
- Backend work must expand shared packages without breaking the current web application.
- Mobile remains reserved; both clients will eventually consume the same API contracts and API client.

## 2. Implementation Principles

1. Build one modular monolith; do not introduce microservices.
2. Keep routes, controllers, services, repositories, models, schemas, and domain types separate.
3. Keep business rules in services/domain helpers, never in routes or controllers.
4. Use MongoDB Atlas as the production source of truth and Mongoose as the ODM.
5. Validate public input with Zod and map database records to explicit response DTOs.
6. Never return Mongoose documents directly from public endpoints.
7. Use centralized authentication, authorization, response, error, logging, and configuration boundaries.
8. Preserve compatibility with the static web preview until a dedicated client-integration step.
9. Add external providers behind adapters and do not commit credentials or provider-specific private data.
10. Implement and verify one bounded step at a time; do not mark a step complete before its gate passes.

## 3. Planned Backend Structure

```text
apps/api/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── common/
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── pagination/
│   │   ├── response/
│   │   ├── security/
│   │   ├── types/
│   │   └── validation/
│   ├── integrations/
│   │   ├── firebase/
│   │   ├── razorpay/
│   │   ├── s3/
│   │   └── verification/
│   ├── modules/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── chat/
│   │   ├── media/
│   │   ├── notifications/
│   │   ├── payments/
│   │   ├── plans/
│   │   ├── profiles/
│   │   ├── reviews/
│   │   ├── safety/
│   │   ├── services/
│   │   ├── subscriptions/
│   │   ├── trust-score/
│   │   ├── users/
│   │   └── verification/
│   └── docs/
├── scripts/
│   └── migrations/
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

Every domain module will follow the locked LLD pattern where applicable:

```text
module.routes.ts
module.controller.ts
module.service.ts
module.repository.ts
module.model.ts
module.schema.ts
module.types.ts
module.constants.ts
__tests__/
```

## 4. Step-by-Step Delivery Plan

### Step 0 — Backend Tracker and Contract Audit

Deliverables:

- Create `docs/BACKEND_IMPLEMENTATION_TASKS.md` from this plan.
- Inventory current shared types, schemas, constants, and web dependencies.
- Define which contracts are public API DTOs versus static preview data.
- Record provider decisions that remain intentionally unresolved.

Gate:

- No existing web import is broken.
- Every backend domain in the locked LLD appears in the tracker.

### Step 1 — API Foundation

Deliverables:

- Scaffold `@findbuddy/api` inside `apps/api`.
- Add Express/TypeScript entry points and graceful startup/shutdown.
- Add typed environment validation with fail-fast behavior.
- Add request IDs, security headers, CORS configuration, JSON limits, structured logging, not-found handling, and centralized error handling.
- Add normalized `ApiSuccess` and `ApiError` response helpers.
- Add `GET /health/live` and `GET /health/ready`.
- Add API scripts to the existing Turborepo quality pipeline.

Tests:

- App boot test.
- Liveness/readiness response tests.
- Validation, not-found, and central error-envelope tests.
- Graceful shutdown behavior where practical.

Gate:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Step 2 — Shared Contracts and Domain Primitives

Deliverables:

- Separate static `WebsiteData` schemas from backend request/response contracts.
- Add shared enums/constants for roles, account states, service categories, pricing, bookings, plans, subscriptions, payments, verification, reports, and recommendations.
- Add pagination and API envelope contracts.
- Add domain-safe pricing and entitlement helpers.
- Define explicit public DTOs that omit private database/provider fields.

Tests:

- Contract parsing tests.
- Free versus Pro pricing tests.
- Public DTO privacy tests.
- Existing web tests remain green.

Gate:

- No circular dependency among `constants`, `validation`, `types`, and `contracts`.
- Web preview remains buildable without the API.

### Step 3 — MongoDB Persistence Foundation

Deliverables:

- Add a singleton Mongoose connection manager.
- Make readiness reflect database availability.
- Establish repository conventions, timestamps, indexes, and soft-delete/status behavior.
- Add test database isolation and repeatable fixture builders.
- Create the migration runner skeleton under `apps/api/scripts/migrations`.

Tests:

- Connection lifecycle tests.
- Repository integration test against a dedicated test database strategy.
- Index/model validation tests.

Gate:

- No connection-per-request behavior.
- Tests cannot read or mutate staging/production data.

### Step 4 — Users, Authentication, and Sessions

Deliverables:

- Implement User and RefreshToken models.
- Implement register, login, refresh rotation, logout, email-verification contract, forgot-password contract, and reset-password contract.
- Hash passwords with Argon2id or an approved equivalent.
- Add short-lived access JWTs, hashed refresh tokens, token-family reuse detection, revocation, and account-status enforcement.
- Add web cookie and mobile bearer-token response strategies without duplicating auth logic.
- Add RBAC and resource-ownership middleware foundations.

Tests:

- Registration/login success and rejection paths.
- Refresh rotation, reuse detection, logout, expiry, and revoked-token paths.
- Suspended/blocked account behavior.
- Password/token values never appear in logs or responses.

Gate:

- Auth rate limits are active.
- Cookie security and CSRF requirements are documented and tested for the chosen web flow.

### Step 5 — Profiles and Media

Deliverables:

- Implement Profile and Media models/repositories/services.
- Implement `GET /me`, `PATCH /me/profile`, and public profile retrieval.
- Add explicit private/public profile mappers.
- Add S3 presign/confirm workflow behind a storage adapter.
- Enforce MIME type, size, ownership, generated object-key, and pending-to-active rules.

Tests:

- Profile ownership and validation.
- Private-field exclusion.
- Presign/confirm lifecycle with an adapter test double.

Gate:

- Images never pass through the Node API as stored binary data.

### Step 6 — Subscription Entitlements and Services

Deliverables:

- Implement Subscription model and centralized `isPro` entitlement resolution.
- Implement Service model, CRUD, ownership rules, status behavior, pagination, and discovery filters.
- Enforce Free ₹500/session limit and Pro-only hourly pricing on create and update.
- Implement automatic pausing policy for Pro-only services after entitlement expiry.

Tests:

- Free, Pro, expired, cancelled, and missing-subscription pricing matrix.
- Service ownership, inactive provider, moderation state, pagination, and filtering.
- Downgrade pausing behavior.

Gate:

- Pricing logic has one authoritative backend implementation.

### Step 7 — Plans and Join Requests

Deliverables:

- Implement Plan and PlanJoinRequest models.
- Implement plan CRUD, publish/cancel/complete rules, discovery, join requests, and creator accept/reject actions.
- Prevent duplicate join requests through a compound unique index.
- Add paid-plan payment readiness without falsely marking unverified payments as paid.

Tests:

- Plan and join-request state transitions.
- Creator/requester authorization.
- Duplicate and capacity-related behavior defined by the locked rules.

Gate:

- Invalid transitions are rejected centrally and consistently.

### Step 8 — Bookings

Deliverables:

- Implement Booking model and state machine.
- Implement create, retrieve, list-my-bookings, accept, reject, cancel, and complete routes.
- Enforce active accounts/services, no self-booking, ownership, and immutable service snapshots.
- Create booking domain events for downstream notifications and trust processing.

Tests:

- Complete booking transition matrix.
- Self-booking and inactive-service rejection.
- Snapshot immutability after service edits.
- Provider/consumer authorization.

Gate:

- Booking state rules exist only in the booking domain service/state machine.

### Step 9 — Reviews, Trust Score, and Recommendations

Deliverables:

- Implement Review, TrustScore, and TrustScoreEvent models.
- Enforce completed-booking and one-review-per-party rules.
- Add rating aggregation and auditable trust recalculation.
- Implement repeat-booking counting and configurable trust weights.
- Implement deterministic recommendation states with safe, explainable reasons.

Tests:

- Review eligibility and uniqueness.
- Score bounds, factor caps, penalties, repeat bookings, and manual adjustments.
- Recommendation threshold and high-severity safety cases.
- No private report information appears in recommendation responses.

Gate:

- Trust can be fully recalculated from source records plus the separate manual adjustment.

### Step 10 — Payments and Pro Subscription Lifecycle

Deliverables:

- Implement Payment persistence and Razorpay adapter.
- Implement service, plan, and Pro order/subscription creation paths.
- Implement raw-body webhook signature verification and idempotent event processing.
- Treat verified server-side webhooks as authoritative.
- Reconcile subscription activation, past-due, cancellation, expiry, and service pausing.

Tests:

- Signature success/failure.
- Duplicate webhook delivery.
- Payment/subscription state transitions.
- Client-reported success cannot activate payment or Pro status.

Gate:

- No payment side effect can be duplicated by retrying the same provider event.

### Step 11 — Identity Verification

Deliverables:

- Implement VerificationRequest model and provider-independent adapter.
- Restrict initiation to eligible active Pro users.
- Implement status and verified-webhook flow.
- Store only operational references and minimal lawful derived metadata.
- Trigger profile badge and trust recalculation after verified provider confirmation.

Tests:

- Pro entitlement requirement.
- Webhook verification/idempotency.
- Verification-to-profile/trust flow.
- Aadhaar numbers/images never appear in logs, public DTOs, or general profile records.

Gate:

- The API is not coupled to a specific verification vendor outside the adapter.

### Step 12 — Chat and Realtime

Deliverables:

- Implement Conversation and Message persistence.
- Implement paginated conversation/message REST reads.
- Add authenticated Socket.IO connection, join, and send flows.
- Derive participants from booking/plan relationships; never trust client participant lists.
- Add message rate limiting and domain events.

Tests:

- Socket authentication and authorization.
- Non-participant denial.
- Persistence, ordering, and pagination.
- Reconnect and duplicate-send behavior where applicable.

Gate:

- No Redis dependency is introduced for the single-instance MVP.

### Step 13 — Safety, Blocking, and Reports

Deliverables:

- Implement Report, Block, SafetyEvent, and TrustedContact models.
- Implement block/unblock, report, SOS event, check-in, and check-out routes.
- Apply block relationships to discovery/contact/booking/chat boundaries.
- Add public-place guidance as product content, not a safety guarantee.

Tests:

- Blocking effects across affected modules.
- Report authorization and rate limiting.
- Sensitive trusted-contact/safety metadata privacy.
- Only confirmed reports affect Trust Score.

Gate:

- SOS is represented honestly according to the connected provider capabilities; no fake emergency dispatch.

### Step 14 — Notifications and Background Jobs

Deliverables:

- Implement Notification and DeviceToken models.
- Create in-app notifications from domain events.
- Add FCM behind a push adapter.
- Implement booking reminders, subscription expiry reconciliation, trust recalculation, notification retry, and cleanup jobs.
- Protect scheduled execution so only one MVP instance runs recurring work.

Tests:

- Event-to-notification mapping.
- Device-token lifecycle.
- Job idempotency and retry boundaries.

Gate:

- Core domain transactions do not fail solely because push delivery fails.

### Step 15 — Admin and Audit Logging

Deliverables:

- Implement `/api/v1/admin` routes from the locked LLD.
- Add user status moderation, verification review, listing moderation, report resolution, subscription views, and Trust Score adjustment.
- Implement immutable AdminAuditLog records with actor, target, reason, before, and after states.
- Enforce ADMIN/SUPER_ADMIN boundaries.

Tests:

- Role matrix and denial tests.
- Required-reason tests.
- Atomic moderation/audit behavior where consistency is critical.
- Manual Trust Score adjustment remains separate and bounded 0–100.

Gate:

- Every required sensitive admin action produces an audit record.

### Step 16 — OpenAPI, Observability, and Security Hardening

Deliverables:

- Document every endpoint, request, response, auth rule, role, and error code in OpenAPI.
- Add structured request/error logging with correlation IDs and redaction.
- Finalize endpoint-specific rate limits, body limits, CORS, secure headers, and webhook raw-body handling.
- Add pagination limits and prevent unbounded queries.
- Add dependency, secret, and sensitive-data audits.

Tests:

- OpenAPI contract checks.
- Security middleware order.
- Log redaction.
- Rate-limit and pagination-boundary tests.

Gate:

- Production errors expose no stack traces or secrets.

### Step 17 — Docker, Nginx, CI/CD, and Deployment Readiness

Deliverables:

- Add production API Dockerfile and Docker Compose shape for API + Nginx.
- Add Nginx reverse proxy, WebSocket upgrade, body limits, and internal-port isolation.
- Add CI for lint, typecheck, tests, and build.
- Document local, staging, and production configuration.
- Add deployment health check and rollback procedure.
- Keep MongoDB, S3, Razorpay, FCM, and verification external to the EC2 host.

Tests:

- Container build and non-root/runtime checks where supported.
- Compose health behavior.
- Nginx REST and Socket.IO proxy checks.

Gate:

- A failed readiness check prevents a release from being considered successful.

### Step 18 — Web and Mobile Consumption

Deliverables:

- Implement `@findbuddy/api-client` from shared contracts.
- Replace the web JSON adapter feature-by-feature, not as one uncontrolled rewrite.
- Preserve a deliberate local preview/development strategy where still useful.
- Prepare the same client/contracts for future React Native use.
- Add end-to-end journeys against the real API.

Tests:

- Web auth/session integration.
- Core service, plan, booking, chat, subscription, safety, and admin journeys.
- API client behavior is platform-neutral where required.

Gate:

- Web and mobile do not duplicate request contracts or core business rules.

## 5. Checkpoint Rules for Every Step

At the end of every step:

1. Review the diff and confirm scope.
2. Run formatting, lint, strict typecheck, tests, and production build.
3. Run the relevant integration tests.
4. Check that existing web tests/build remain green when shared packages change.
5. Update `docs/BACKEND_IMPLEMENTATION_TASKS.md` with evidence and blockers.
6. Do not begin the next step while introduced failures remain.

## 6. Decisions Needed Only When Their Step Is Reached

The locked architecture does not name every external operational provider. Do not guess these prematurely.

- Transactional email provider and sender domain.
- Aadhaar-compliant identity-verification vendor and its approved data flow.
- Razorpay account mode/configuration and webhook URLs.
- AWS account, S3 bucket, region, IAM role, and upload limits.
- Firebase project and credential delivery method.
- Final public API domain and allowed web/mobile origins.
- MongoDB Atlas local/staging/production projects and network access.

Provider adapters and test doubles can be built before credentials are supplied. Real external calls must wait for the relevant approved configuration.

## 7. Explicitly Deferred

- Microservices.
- Redis until horizontal scaling creates a measured need.
- Kafka/RabbitMQ or a dedicated queue.
- Elasticsearch/OpenSearch.
- Kubernetes/ECS.
- Multi-region deployment.
- Backend features not present in the approved BRD/HLD/LLD.

## 8. Recommended First Implementation Batch

Begin with **Step 0 and Step 1 only**:

1. Create the backend task tracker and audit shared-contract impact.
2. Scaffold the API package.
3. Add typed environment configuration.
4. Add the Express application/server split.
5. Add request IDs, security, CORS, logging, response helpers, errors, and 404 handling.
6. Add liveness/readiness endpoints.
7. Add foundational tests.
8. Wire API commands into Turborepo.
9. Run the full repository quality gate.

MongoDB models and feature domains should start only after this foundation is green.
