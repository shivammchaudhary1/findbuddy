# FindBuddy Backend Implementation Tasks

Status markers:

- `[ ]` Pending
- `[~]` In progress
- `[x]` Implemented and verified
- `[!]` Blocked with reason

## Step 1 — API Foundation

- [x] Scaffold `@findbuddy/api` in the pnpm/Turborepo workspace.
- [x] Add strict TypeScript source and bundled production-build configurations.
- [x] Add Express application/server separation.
- [x] Add typed, fail-fast environment parsing.
- [x] Add structured logging with sensitive-field redaction.
- [x] Add request IDs and safe request completion logs.
- [x] Add security headers, explicit CORS allowlist, and JSON body limits.
- [x] Add normalized success/error response envelopes.
- [x] Add centralized 404 and error middleware.
- [x] Add liveness and dependency-aware readiness endpoints.
- [x] Add graceful `SIGINT`/`SIGTERM` shutdown handling.
- [x] Add foundation tests for configuration, health, middleware, and errors.
- [x] Add API build output to Turborepo caching.
- [x] Install dependencies and update `pnpm-lock.yaml`.
- [x] Run lint, typecheck, tests, and build.

### Step 1 verification

- Full root `pnpm check` passed.
- API: 2 test files and 12 tests passed.
- Existing web: 5 test files and 22 tests passed.
- API and web production builds passed.
- Formatting, lint, and strict TypeScript checks passed.
- Verification ran on Node 22.16.0 because Node 26.10.0 is not installed on this machine; pnpm correctly reported the repository engine mismatch.

## Step 2 — Shared Contracts and Domain Primitives

- [x] Separate static website-data validation and types from backend domain schemas and DTOs.
- [x] Centralize locked roles, statuses, categories, pricing types, notification types, safety types, limits, prices, and Trust Score thresholds.
- [x] Add typed pagination queries, metadata, limits, and API response contracts.
- [x] Add service-list, service mutation, profile mutation, plan creation, and public trust schemas.
- [x] Add authoritative Free/Pro pricing validation with stable domain error codes.
- [x] Add active Pro entitlement resolution with expiry and invalid-date handling.
- [x] Add explicit public profile and service DTOs and privacy-safe mappers.
- [x] Preserve all existing web preview imports and behavior.
- [x] Add contract, validation, pricing, entitlement, pagination, and privacy tests.

### Step 2 verification

- Lint, formatting, and strict TypeScript checks passed.
- API: 3 test files and 21 tests passed.
- Existing web: 5 test files and 22 tests passed.
- API production build passed.
- Next production build passed using the supported `--webpack` builder.
- The standard root `pnpm check` passes through lint, typecheck, formatting, tests, and the API build, but the default Turbopack build currently cannot bind its sandboxed CSS-worker helper port (`EPERM`). This is an execution-environment limitation; the corrected shared modules compile successfully in the Webpack production build.
- Verification ran on Node 22.16.0 because Node 26.10.0 is not installed on this machine; the repository continues to report the pinned-engine mismatch.

## Step 3 — MongoDB Persistence Foundation

- [x] Add and configure Mongoose with fail-fast MongoDB environment validation and `.env` loading.
- [x] Add a process-wide connection manager with deduplicated connect/disconnect lifecycle handling.
- [x] Connect before accepting traffic and make readiness report the MongoDB connection state.
- [x] Close MongoDB during graceful API shutdown and after startup failures.
- [x] Establish strict schema, timestamp, index, transaction-session, status-visibility, and DTO-boundary conventions.
- [x] Disable automatic index creation in production so index changes are deployment-controlled.
- [x] Add guarded test-database URI handling and deterministic fixture builders.
- [x] Add an ordered, idempotent migration runner skeleton and production build entry.
- [x] Add connection, configuration, repository convention, model/index, fixture, migration, and opt-in live integration tests.

### Step 3 verification

- Repository-wide lint, formatting, strict TypeScript, and tests passed.
- API: 4 test files and 31 tests passed; the dedicated live MongoDB integration test safely skipped because `TEST_MONGODB_URI` is not configured and no local `mongod` is installed.
- Existing web: 5 test files and 22 tests passed.
- API server and migration-runner production bundles passed.
- The web production build passed with the supported `--webpack` builder.
- The standard root `pnpm check` passes through lint, typecheck, formatting, tests, and the API build. Its default Turbopack web build still cannot bind its CSS-worker helper port (`EPERM`) in this execution environment.
- Verification ran on Node 22.16.0 because Node 26.10.0 is not installed on this machine; the repository continues to report the pinned-engine mismatch.

## Step 4 — Users, Authentication, and Sessions

- [x] Add normalized email and strong-password request schemas plus shared auth request/response contracts.
- [x] Add User, RefreshToken, and single-use authentication action-token models and repositories.
- [x] Add production migrations for user uniqueness, refresh-family queries, and token TTL cleanup indexes.
- [x] Implement registration, login, refresh rotation, logout, email verification, forgot-password, and reset-password flows.
- [x] Hash passwords with Argon2id and keep password hashes excluded from default document selection.
- [x] Add short-lived signed access JWTs and cryptographically random, hash-only refresh/action tokens.
- [x] Add atomic refresh revocation, token-family reuse detection, expiry handling, logout revocation, and password-reset session revocation.
- [x] Enforce verified email and active account state during login and refresh.
- [x] Add web HTTP-only refresh cookies, production `Secure` flags, SameSite protection, double-submit CSRF, and cookie clearing/rotation.
- [x] Add mobile refresh-token response/body handling without duplicating authentication business logic.
- [x] Add bearer authentication, active-account, RBAC, and resource-ownership middleware foundations.
- [x] Add independent register, login, and password-recovery rate limits with normalized API errors.
- [x] Expand sensitive log redaction and attach authenticated user IDs to completion logs.
- [x] Document the web/mobile session and CSRF contract.

### Step 4 verification

- Repository-wide lint, formatting, strict TypeScript, and all runnable tests passed.
- API: 8 test files and 56 tests passed; the dedicated live MongoDB integration test safely skipped because `TEST_MONGODB_URI` is not configured and no local `mongod` is installed.
- Existing web: 5 test files and 22 tests passed.
- API server and migration-runner production bundles passed.
- The web production build passed with the supported `--webpack` builder.
- The standard root `pnpm check` passes through lint, typecheck, formatting, tests, and the API build. Its default Turbopack web build still cannot bind its CSS-worker helper port (`EPERM`) in this execution environment.
- Verification ran on Node 22.16.0 because Node 26.10.0 is not installed on this machine; the repository continues to report the pinned-engine mismatch.

## Step 5 — Profiles and Media

- [x] Add strict shared profile/media validation, private/public DTOs, and API response contracts.
- [x] Add Profile and Media models with ownership, discovery, uniqueness, and pending-cleanup indexes.
- [x] Add production migrations for all profile and media indexes.
- [x] Implement `GET /api/v1/me`, `PATCH /api/v1/me/profile`, and `GET /api/v1/users/:userId/profile`.
- [x] Support incomplete onboarding with a null private profile while requiring a name on initial profile creation.
- [x] Add explicit private/public profile mappers that exclude email, account state, pincode, and women-only settings from public output.
- [x] Prevent inactive accounts from exposing public profiles.
- [x] Add authenticated `POST /api/v1/media/presign` and `POST /api/v1/media/:mediaId/confirm` routes.
- [x] Add an AWS S3 storage adapter using the default IAM credential chain and short-lived presigned PUT URLs.
- [x] Enforce configured MIME types, byte limits, generated canonical object keys, ownership, exact S3 metadata verification, and pending-only activation.
- [x] Atomically activate confirmed media and assign it as the profile photo in a MongoDB transaction.
- [x] Reject filenames, embedded image data, and other unknown media intent fields.
- [x] Document the direct-to-S3 upload, bucket CORS, and public read-origin contract.

### Step 5 verification

- Repository-wide lint, formatting, strict TypeScript, and all runnable tests passed.
- API: 11 test files and 71 tests passed; the dedicated live MongoDB integration test safely skipped because `TEST_MONGODB_URI` is not configured and no local `mongod` is installed.
- Existing web: 5 test files and 22 tests passed.
- API server and migration-runner production bundles passed.
- The web production build passed with the supported `--webpack` builder.
- The standard root `pnpm check` passes through lint, typecheck, formatting, tests, and the API build. Its default Turbopack web build still cannot bind its CSS-worker helper port (`EPERM`) in this execution environment.
- Verification ran on Node 22.16.0 because Node 26.10.0 is not installed on this machine; the repository continues to report the pinned-engine mismatch.

## Next Step

- [ ] Configure isolated MongoDB and S3 test infrastructure for live adapter verification.
- [ ] Connect the authentication notification port to the selected transactional email provider; raw tokens are intentionally never logged or returned.
- [ ] Step 6 — Subscription Entitlements and Services.
