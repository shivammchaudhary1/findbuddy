# Web implementation tasks

Status: WEB MVP IMPLEMENTATION COMPLETE — Phases 0–12 verified (frontend-only scope).

- [x] Batch 0: repository foundation (12 tasks).

Source of truth: ../CODEX_INSTRUCTIONS.md. All supplied BRD/HLD/LLD and four image references inspected. Existing code/ directory is empty. Preserve supplied documents and untracked assets.

# 36. PHASE 0 — REPOSITORY FOUNDATION

Tasks:

- [x] Inspect existing repository.
- [x] Confirm monorepo structure.
- [x] Configure Node `26.10.0`.
- [x] Configure pnpm workspace.
- [x] Configure Turborepo.
- [x] Configure root TypeScript.
- [x] Configure ESLint.
- [x] Configure Prettier.
- [x] Create shared config package where appropriate.
- [x] Scaffold `apps/web`.
- [x] Create root `data/website-data.json`.
- [x] Create `docs/WEB_IMPLEMENTATION_TASKS.md`.

### Gate

Run:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

Do not move forward until green.

---

# 37. PHASE 1 — BRAND + DESIGN SYSTEM

Tasks:

- [x] Add Poppins.
- [x] Add Inter.
- [x] Add approved color tokens.
- [x] Add spacing system.
- [x] Add radii.
- [x] Add shadows.
- [x] Add breakpoints.
- [x] Add logo assets.
- [x] Build Button.
- [x] Build Badge.
- [x] Build Avatar.
- [x] Build Input.
- [x] Build FilterChip.
- [x] Build base Card.
- [x] Build SectionHeader.
- [x] Build app container/layout primitives.

### Gate

Verify colors and typography visually.

Then run full quality checks.

---

# 38. PHASE 2 — DATA FOUNDATION

Tasks:

- [x] Define domain types.
- [x] Define Zod schemas.
- [x] Build valid `website-data.json`.
- [x] Implement JSON loader.
- [x] Implement centralized selectors.
- [x] Add service selectors.
- [x] Add buddy/profile selectors.
- [x] Add plan selectors.
- [x] Add booking selectors.
- [x] Add trust selectors.
- [x] Add chat selectors.
- [x] Add graceful missing-data handling.

### Gate

- JSON schema validation passes.
- No business data is hardcoded in components.
- lint/typecheck/build pass.

---

# 39. PHASE 3 — PUBLIC SHELL + HOME

Build:

- [x] header
- [x] responsive navigation
- [x] footer
- [x] hero
- [x] popular activities
- [x] featured/recommended buddies
- [x] popular plans
- [x] trust/safety
- [x] how it works
- [x] Pro teaser
- [x] final CTA

Use real content from `website-data.json`.

### Required UI check

- ~390px
- ~768px
- 1280px+
- 1440px+

Then quality gate.

---

# 40. PHASE 4 — EXPLORE + DISCOVERY

Build:

- [x] `/explore`
- [x] search
- [x] categories
- [x] filters
- [x] location
- [x] price
- [x] rating
- [x] verification
- [x] trust
- [x] results grid
- [x] responsive mobile filter UI
- [x] no-results state

Filtering can be local frontend logic based on `website-data.json`.

Do not invent server calls.

### Gate

Functional filter check + UI check + full quality checks.

---

# 41. PHASE 5 — BUDDY + SERVICES

Build:

- [x] buddy detail
- [x] service list per buddy
- [x] service detail
- [x] verified badge
- [x] rating
- [x] trust score
- [x] recommendation indicator
- [x] interests
- [x] languages
- [x] service fee presentation
- [x] availability
- [x] send request CTA

Maintain the moral pricing terminology rule.

### Gate

Review all pricing labels manually.

Then run quality checks.

---

# 42. PHASE 6 — PLANS

Build:

- [x] plans listing
- [x] filter/tabs where approved
- [x] plan detail
- [x] create plan form
- [x] join plan action
- [x] created/joined/past sections where represented in data
- [x] empty states

If interaction requires local temporary state, isolate it clearly and do not pretend persistence exists.

### Gate

Form validation + responsive UI + quality checks.

---

# 43. PHASE 7 — BOOKINGS

Build:

- [x] booking request form
- [x] booking summary
- [x] my bookings
- [x] booking detail
- [x] accepted/rejected/completed/cancelled UI states
- [x] fee display
- [x] date/time
- [x] user/service relationship

No real payment/backend call yet.

### Gate

Validate all booking-state views.

Then quality checks.

---

# 44. PHASE 8 — CHAT

Build:

- [x] conversation list
- [x] chat detail
- [x] responsive split layout
- [x] message bubbles
- [x] user status presentation where data provides it
- [x] no-conversation state

No fake network calls.

### Gate

Desktop + mobile web UI inspection.

Then quality checks.

---

# 45. PHASE 9 — PROFILE + PRO

Build:

- [x] user profile
- [x] my services
- [x] my plans
- [x] my bookings
- [x] subscription screen
- [x] upgrade to Pro UI
- [x] verification state
- [x] Trust Score
- [x] editable profile form if approved in static-demo scope

Use current user data from JSON.

### Gate

Check Free vs Pro UI conditions.

Then quality checks.

---

# 46. PHASE 10 — ADMIN

Build approved admin modules:

- [x] users
- [x] verification
- [x] services
- [x] plans
- [x] bookings
- [x] trust
- [x] reports
- [x] subscriptions

Use the same static data source.

Admin actions may be frontend demo interactions only until backend is connected.

Do not fabricate permanent mutation.

### Gate

Role/navigation UI check + full quality checks.

---

# 47. PHASE 11 — POLISH

Complete:

- [x] Polish A: block/report, trusted contacts, completed-booking reviews; visibility consistency.
- [x] Polish B: loading/error/metadata, content, image/accessibility and cleanup audit.

- [x] all skeletons
- [x] all empty states
- [x] error states
- [x] responsive issues
- [x] accessibility improvements
- [x] keyboard navigation
- [x] focus states
- [x] image optimization
- [x] metadata
- [x] page titles
- [x] favicons/logo
- [x] consistent content
- [x] consistent spacing
- [x] remove debug code
- [x] remove console logs
- [x] remove unused components
- [x] remove unused dependencies

### Gate

Full repository check.

---

# 48. PHASE 12 — FINAL WEB RELEASE CHECK

- [x] Root formatting, lint, strict typecheck, tests and production build pass.
- [x] All 22 unit/component tests pass.
- [x] All 32 browser tests pass against the production server, including 12 automated accessibility scans and keyboard checks.
- [x] Home, Explore, buddy/service details, Plans, Create Plan, Bookings, Messages, Profile, Subscription, Admin and 404 inspected across responsive layouts.
- [x] Final 48-route/viewport capture matrix at 390, 768, 1280 and 1440 pixels passes with no horizontal overflow, broken visible images or runtime errors.
- [x] Additional 320/1920 pixel viewport checks pass.
- [x] Data import boundary, pricing terminology, source asset preservation and Git hygiene reviewed.
- [x] Backend-dependent actions remain explicit previews; no hidden API or permanent mutations.

Run:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If the project has no tests initially, add meaningful tests for critical data selectors, pricing rules, and core interaction logic before final completion.

Then manually inspect:

```text
Home
Explore
Buddy detail
Service detail
Plans
Create Plan
Bookings
Messages
Profile
Subscription
Admin
404 / not-found
```

Check mobile, tablet, and desktop.

Only then mark:

```text
WEB MVP IMPLEMENTATION COMPLETE
```

---

## Checkpoint log

- Initial inspection: Node v26.10.0; pnpm 11.19.0. No existing app, tests, or dependencies. Backend and mobile reserved only.
- Batch 0: pnpm check passed (lint, typecheck, format, production build); no tests existed yet. Browser inspected at 390/768/1440, HTTP 200, no overflow or runtime errors. Screenshots: apps/web/.qa/phase0-*.png. Plain scaffold only; brand UI not yet implemented.

- Batch 1: pnpm check passed; 390/768/1440 screenshots visually inspected. Correct palette, Poppins/Inter, supplied FB symbol and composed full wordmark; no overflow, missing images, or runtime errors. Token and primitive preview only. Next: Phase 2.

- Batch 2: pnpm check passed, including 9 tests. JSON schema and relationships checked. Browser smoke at 390/768/1440 passes; unchanged brand preview confirmed. Resolved missing workspace dependency links with a full workspace install. Next: home and public shell.

- Batch 3: full pnpm check passed (9 tests). Home screenshots inspected at 390/768/1280/1440; no overflow, broken images, or runtime errors. Fixed JSX tag before completion. Corrected QA to load offscreen lazy images before asserting image health. Destination pages remain queued in their phases. Next: Explore.

- Batch 4: pnpm check passed (9 unit tests); 2 Playwright tests pass for combined filtering, no results, Pro-locked filters, and mobile navigation. Explore inspected at 390/768/1280/1440; no overflow, broken images, or runtime errors. Next: buddy and service details.

- Batch 5: pnpm check passed, pricing labels manually reviewed, 2 detail/request browser tests pass. Inspected profile, activity detail, and service cards at required widths. No overflow, missing images, runtime errors. Fixed test locator to distinguish Next route announcer from form alert. Request form implemented with Phase 5 CTA; booking list/detail follows in Phase 7.

- Batch 6: pnpm check passed (9 unit tests); 2 plan browser tests pass. Plan listing/detail/create inspected at responsive widths. No overflow, missing images, or runtime errors. Form validation and local-only join/create/reset checked. Next: bookings.

- Batch 7: pnpm check passed with 11 unit tests; booking browser test covers all five states and cancellation. Booking list/detail inspected at 390/768/1280/1440. No overflow, broken images, runtime errors. Future/unpaid completion and actor checks verified. External payment/SOS correctly unavailable. Next: chat.

- Batch 8: pnpm check passed; 2 chat browser tests pass. Message list/detail screenshots inspected on mobile/tablet/desktop. Session-only sending and reset verified. No fake online status. QA was corrected to skip images intentionally hidden by mobile layout; final capture passes. Next: profile and Pro, plus required login/register routes.

- Batch 9: pnpm check passed (15 unit/component tests), 3 account and 2 detail browser tests pass. Account, services, Pro, login/register inspected at 390/768/1280/1440. Fixed detail views to use current session data; Free/Pro entitlement rendering tested. Corrected stale test labels and awaited navigation before reload assertion. No overflow, missing images, or runtime errors. Next: admin.

- Batch 10: pnpm check passed (18 unit/component tests), 2 admin browser tests pass. All 8 modules and user detail captured at required widths; desktop/tablet/mobile layouts inspected. Fixed dialog focus restoration and mobile table action visibility. Admin role boundary, audit reasons, score clamping, immutable computed score tested. Next: polish A (approved safety/reviews and consistent visibility).

- Polish A: pnpm check passed (21 unit/component tests); safety, chat, request, booking/review and plan browser tests pass. Profile/safety controls, buddy page, existing review and unreviewed completed booking inspected across required widths. New reviews update only local ratings, with backend Trust Score recalculation explicitly unavailable. Fixed exact label test to use the select's accessible role/name. Next: polish B (presentation states, metadata, content and cleanup).

- Polish B: pnpm check passed (22 unit/component tests); 13 accessibility/keyboard browser checks and 3 core journeys pass. Home, chat, auth, 404 and responsive CTA changes inspected; 320px and 1920px overflow checks pass. Fixed chat timestamp contrast and inline auth-link distinction. CTA gradient uses a darker approved-token blend for text contrast. Added loading/error handling, per-route titles, source-symbol favicon, central home content and run instructions. Removed dev-output caching from production build outputs. No debug statements, type suppressions or unused UI components found. Next: Phase 12 production verification.

- Phase 12: all release checks passed on 2026-09-27. Production preview at http://127.0.0.1:3002. Screenshots: apps/web/.qa/release-*.png (ignored local QA evidence). Final responsive visual inspection passed; 404 returns HTTP 404. Source documents were preserved. No implementation blockers or critical TODOs remain in the agreed frontend-only scope. Backend integration and mobile remain future work. No further implementation batch pending.
