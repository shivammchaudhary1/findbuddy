# FindBuddy — Codex / Coding Agent Master Instructions

**File purpose:** Root-level execution contract for ChatGPT/Codex coding agents working on FindBuddy.  
**Primary implementation target:** Web application first.  
**Current backend status:** Not connected.  
**Data source until backend integration:** `data/website-data.json` ONLY.  
**Node version:** `26.10.0`  
**Package manager:** `pnpm`  
**Monorepo:** `pnpm workspaces + Turborepo`

---

# 0. READ THIS FIRST — NON-NEGOTIABLE RULES

You are the implementation agent for **FindBuddy**.

Your job is to turn the approved product idea, UI references, brand identity, folder structure, HLD, LLD, and this task plan into a production-quality **Next.js web application**.

You have full implementation control, but you do **not** have permission to invent product requirements, change the visual direction, add random features, or restructure the repository outside the agreed architecture.

## You MUST follow these rules

1. **Do not hallucinate requirements.**
2. **Do not add features that are not documented.**
3. **Do not redesign the approved UI style.**
4. **Do not create a backend yet.**
5. **Do not use mock API routes as a hidden backend.**
6. **Do not scatter hardcoded data across components.**
7. **ALL temporary application data must live in:**
   ```text
   data/website-data.json
   ```
8. Components must read data through a centralized typed data layer.
9. Use the approved shared folder structure.
10. Use TypeScript in strict mode.
11. Use reusable components and feature boundaries.
12. Avoid large monolithic components.
13. Avoid unnecessary dependencies.
14. Do not use `any` unless there is a documented unavoidable reason.
15. Do not suppress TypeScript or ESLint errors to make checks pass.
16. Do not use `@ts-ignore` or `eslint-disable` as a shortcut.
17. Do not change lint/build configuration simply to hide failures.
18. Do not commit generated build output.
19. Do not duplicate design tokens.
20. Do not invent random colors, font families, radii, spacing systems, or shadows.
21. Do not place new files in random locations.
22. Never mark a task complete before its implementation and quality gate pass.
23. Before changing an existing file, inspect it and understand its responsibility.
24. Preserve clean Git diffs and avoid unrelated refactors.
25. When something is unclear and cannot be inferred from approved documents, use a clearly marked TODO rather than inventing behavior.

---

# 1. PRODUCT

## Product Name

**FindBuddy**

## Business

**The Logic Machines**

## Core product actions

The web MVP revolves around:

- Find a Buddy
- Become a Buddy
- Create / Join a Plan
- Build Trust

A single user can both:

- offer buddy services
- book buddy services
- create plans
- join plans

Do not turn FindBuddy into a dating application.

The product must feel:

- social
- friendly
- trustworthy
- modern
- premium
- youthful
- safe
- activity-oriented

---

# 2. IMPLEMENTATION PRIORITY

## FIRST TARGET: WEB APPLICATION

Build the complete Next.js web experience first.

Do **not** start mobile implementation until the web version is complete and the user explicitly asks for mobile development.

The architecture must still remain compatible with the future React Native app.

---

# 3. APPROVED MONOREPO STRUCTURE

Follow this repository structure.

```text
findbuddy/
│
├── apps/
│   ├── api/                         # Reserved for later backend implementation
│   │
│   ├── web/                         # CURRENT PRIMARY IMPLEMENTATION
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── mobile/                      # Reserved for later React Native implementation
│
├── packages/
│   ├── contracts/
│   ├── api-client/
│   ├── validation/
│   ├── types/
│   ├── constants/
│   ├── utils/
│   ├── config/
│   └── design-tokens/
│
├── data/
│   └── website-data.json            # ONLY DATA SOURCE UNTIL BACKEND IS CONNECTED
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
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .nvmrc
├── .node-version
└── .gitignore
```

The root-level `data/` directory is explicitly approved for the pre-backend implementation.

Do not create alternate data files such as:

```text
mock-data.ts
dummy.json
users.json
plans.json
services.json
seed.ts
data.ts
```

unless explicitly requested later.

---

# 4. NODE AND PACKAGE MANAGEMENT

The required Node version is:

```text
26.10.0
```

Create:

```text
.nvmrc
.node-version
```

with:

```text
26.10.0
```

Use:

```text
pnpm
```

Do not use npm or yarn for repository dependency management.

The repository should support commands from root.

Recommended root scripts:

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "pnpm lint && pnpm typecheck && pnpm format:check && pnpm build"
  }
}
```

Use the actual package configuration required by the implemented project; do not blindly copy configuration if it is incompatible.

---

# 5. WEB TECHNOLOGY

Use:

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- CSS custom properties
- central global theme CSS
- TanStack Query where asynchronous server-state architecture is useful
- Zod
- Lucide icons
- accessible headless primitives where required
- lightweight modern UI primitives only when they do not visually override the approved design

Preferred UI primitive approach:

- Radix UI primitives where needed
- custom FindBuddy components styled using the approved tokens

Avoid bringing in a full opinionated design system that changes the approved design language.

---

# 6. CSS / DESIGN SYSTEM RULES

## Central styling

The application must use a central design system.

Primary theme location:

```text
packages/design-tokens/
```

Web CSS theme:

```text
apps/web/app/globals.css
```

Use CSS variables for theme tokens.

Example:

```css
:root {
  --fb-bg-primary: #0a0f1c;
  --fb-bg-secondary: #111827;
  --fb-surface: #1a2235;
  --fb-border: #2a3348;

  --fb-purple: #7c3aed;
  --fb-violet: #a855f7;
  --fb-lavender: #c4b5fd;

  --fb-text-primary: #f8fafc;
  --fb-text-secondary: #94a3b8;

  --fb-success: #22c55e;
}
```

Use Tailwind theme mapping to these central values.

### DO NOT

- write arbitrary hex colors inside individual components
- create competing palettes
- use random gradients
- add random neon/glass effects
- use unrelated border radii
- use inline CSS unless absolutely necessary for dynamic values

---

# 7. APPROVED COLOR PALETTE

The approved FindBuddy visual direction is the **dark navy + purple + lavender** design.

Use this palette as the source of truth.

| Token | Color |
|---|---|
| Background Primary | `#0A0F1C` |
| Background Secondary | `#111827` |
| Surface / Card | `#1A2235` |
| Border / Divider | `#2A3348` |
| Brand Purple | `#7C3AED` |
| Secondary Violet | `#A855F7` |
| Accent Lavender | `#C4B5FD` |
| Text Primary | `#F8FAFC` |
| Text Secondary | `#94A3B8` |
| Success Green | `#22C55E` |

Primary CTA gradient may use:

```text
#7C3AED → #A855F7
```

Keep gradients subtle and controlled.

---

# 8. APPROVED TYPOGRAPHY

Use:

## Primary / Headings

**Poppins**

Recommended:

- 600 SemiBold
- 700 Bold

## Body / Interface

**Inter**

Recommended:

- 400 Regular
- 500 Medium
- 600 SemiBold

Use `next/font` where possible.

Suggested scale:

```text
Display / Hero: 56–72 desktop
H1: 40–48
H2: 30–36
H3: 22–28
Body Large: 18
Body: 16
Body Small: 14
Caption: 12
```

Responsive sizing should use fluid CSS/clamp where appropriate.

Do not use decorative fonts.

---

# 9. LOGO / BRAND ASSETS

Use the approved **FB monogram**:

- combined `F` + `B`
- rounded geometric form
- purple / lavender gradient
- friendly and minimal

There should be two logo variants available in the project:

1. **Full logo**
   ```text
   FB symbol + FindBuddy wordmark
   ```

2. **Symbol-only logo**
   ```text
   FB monogram
   ```

Expected asset locations:

```text
apps/web/public/brand/findbuddy-logo.*
apps/web/public/brand/findbuddy-symbol.*
```

Do not redraw or reinterpret the logo unless the source assets are missing.

---

# 10. APPROVED UI DIRECTION

The approved UI reference is:

- dark background
- navy surfaces
- purple CTAs
- lavender highlights
- large photography
- rounded cards
- clean premium spacing
- minimal borders
- subtle shadow/glow only where necessary
- strong hierarchy
- friendly people-first presentation

The mobile reference already approved included:

- Splash
- Onboarding
- Home / Explore
- Buddy profile
- Create Plan
- Browse services
- Booking request
- Chat
- Plans
- Profile / menu

The web implementation must adapt the same visual language to desktop/tablet/mobile web.

The desktop layout should include the approved concepts:

- top navbar
- large hero
- activity discovery
- buddy cards
- filters
- service/profile detail
- plans
- user dashboard
- chat

Do not create an unrelated SaaS dashboard appearance.

---

# 11. IMPORTANT TERMINOLOGY

Avoid language that makes the platform feel exploitative.

Do not display:

```text
₹300/session person
rent a person
hire a friend
```

Preferred terminology:

```text
Starting fee ₹300
Activity fee ₹300
₹300 per activity
Service fee
Hosted by
Send request
Join plan
```

A price belongs to the **service/activity listing**, not to the person's human value.

---

# 12. DATA POLICY — CRITICAL

Until the backend is connected:

```text
data/website-data.json
```

is the **ONLY source of application data**.

This includes all temporary data for:

- users
- profiles
- services
- plans
- categories
- ratings
- reviews
- trust scores
- verified status
- recommendation state
- bookings
- conversations
- messages
- notifications
- subscription state
- current user
- site content
- navigation content where useful

## Never duplicate the same business data inside React components.

---

# 13. WEBSITE DATA STRUCTURE

Keep `website-data.json` organized and backend-ready.

Suggested high-level shape:

```json
{
  "site": {},
  "navigation": {},
  "currentUser": {},
  "users": [],
  "profiles": [],
  "categories": [],
  "services": [],
  "plans": [],
  "bookings": [],
  "reviews": [],
  "trustScores": [],
  "conversations": [],
  "messages": [],
  "notifications": []
}
```

Do not use these fields blindly if approved BRD/HLD/LLD requires a different field name.

The HLD/LLD domain terminology has priority.

---

# 14. CENTRAL DATA ACCESS LAYER

Components must not import `website-data.json` everywhere.

Create a typed data-access boundary such as:

```text
apps/web/lib/data/
├── index.ts
├── users.ts
├── services.ts
├── plans.ts
├── bookings.ts
├── trust.ts
└── chat.ts
```

Example concept:

```ts
export function getFeaturedBuddies() {}
export function getServiceById(id: string) {}
export function getPopularPlans() {}
export function getUserProfile(id: string) {}
```

This allows the JSON implementation to be replaced later by the real API without rewriting UI components.

---

# 15. SHARED TYPES AND VALIDATION

Use shared packages.

```text
packages/types
packages/contracts
packages/validation
packages/constants
packages/design-tokens
```

Example:

```ts
import type { BuddyService } from "@findbuddy/types";
import { serviceSchema } from "@findbuddy/validation";
```

Validate the root JSON shape during development.

If invalid data exists, fail clearly instead of silently rendering broken UI.

---

# 16. RESPONSIVE WEB REQUIREMENT

The web application must be fully responsive.

Required ranges:

- mobile web
- tablet
- laptop
- desktop
- wide desktop

Do not design only for 1440px.

Avoid horizontal overflow.

Navigation should adapt gracefully.

Card grids must adapt based on viewport.

---

# 17. ACCESSIBILITY

Required:

- semantic HTML
- keyboard navigation
- visible focus states
- labels for form elements
- buttons are real buttons
- links are real links
- accessible dialogs
- alt text for images
- sufficient contrast
- correct heading hierarchy
- no click-only divs
- reduced-motion respect where animation exists

---

# 18. IMAGE USAGE

Use optimized Next.js images.

Requirements:

- `next/image`
- defined aspect ratios
- no layout shift
- responsive sizes
- meaningful alt text
- appropriate `priority` only for above-the-fold images

Do not embed large base64 images.

---

# 19. ROUTE PLAN — WEB MVP

Build the web version around these routes.

```text
/
 /explore
 /services
 /services/[id]
 /buddies/[id]
 /plans
 /plans/[id]
 /plans/create
 /bookings
 /bookings/[id]
 /messages
 /messages/[id]
 /profile
 /profile/services
 /profile/plans
 /profile/bookings
 /profile/subscription

 /login
 /register

 /admin
 /admin/users
 /admin/services
 /admin/plans
 /admin/bookings
 /admin/reports
 /admin/verifications
 /admin/trust
 /admin/subscriptions
```

Do not implement admin functionality beyond the approved MVP responsibilities.

---

# 20. PUBLIC HOME PAGE

Main sections:

1. Header / navigation
2. Hero
3. Popular activities
4. Featured / recommended buddies
5. Popular plans
6. Trust / safety explanation
7. How FindBuddy works
8. Pro membership teaser
9. Final CTA
10. Footer

Do not invent fake market statistics.

---

# 21. EXPLORE PAGE

Must include:

- search
- category filters
- city/location
- price filtering
- rating
- verified status
- trust score where approved
- availability where data exists
- buddy/service result cards

The page should visually follow the approved dark Explore layout.

---

# 22. BUDDY / SERVICE DETAIL EXPERIENCE

Do not make a person's profile itself feel priced.

Separate:

```text
Person Profile
```

from:

```text
Offered Services / Activities
```

The profile should show:

- image
- name
- verified badge where applicable
- location
- rating
- trust information
- interests
- languages
- about
- services offered

Each service card contains its own:

- title
- description
- fee
- pricing model
- availability
- request CTA

---

# 23. PLANS EXPERIENCE

Plans include:

- browse plans
- created by me
- joined
- past where applicable
- create plan
- plan detail
- join request action

Examples already discussed:

- coffee meetup
- movie
- football
- group trip
- house party
- club plan

Do not add unrelated event categories.

---

# 24. CHAT EXPERIENCE

Build a polished frontend-only chat using `website-data.json`.

Must support UI states for:

- conversation list
- active conversation
- timestamps
- message bubbles
- empty state
- responsive desktop split-pane

Do not pretend messages persist to a backend.

If local interaction is implemented for demo purposes, keep temporary state clearly isolated.

---

# 25. TRUST UI

Show trust responsibly.

Examples:

```text
Trust Score 87/100
Verified
18 completed bookings
6 repeat bookings
4.8 rating
```

Recommendation states:

```text
Recommended
Proceed with Caution
Not Recommended
```

Never present trust score as a guarantee.

---

# 26. PRO MEMBERSHIP UI

Price:

```text
₹299/month
```

Approved benefits include:

- Aadhaar-based identity verification eligibility
- Verified badge
- better profile visibility
- advanced filters
- priority requests
- detailed Trust Score
- verified-only matching/filtering
- additional safety options
- priority support
- per-hour service pricing
- service pricing above the Free user's ₹500/service limit

Do not invent additional Pro features.

---

# 27. FREE USER PRICING RULE — UI

Free user:

- can offer a free service
- can offer a paid service
- maximum: `₹500 per service/activity`
- cannot use per-hour pricing

Pro:

- can use per-hour pricing
- can set prices above ₹500
- can use per-activity/per-session equivalent approved terminology

UI validation must reflect the rule, but the future backend remains authoritative.

---

# 28. ADMIN WEB

Admin UI should use the same brand system but prioritize clarity.

Admin modules:

- Users
- Verification
- Services
- Plans
- Bookings
- Trust Score
- Safety & Reports
- Subscriptions

Do not build analytics charts unless required by approved data/product scope.

---

# 29. ERROR / EMPTY / LOADING STATES

Every major feature must have intentional states.

Required:

- loading skeleton
- empty state
- no search results
- error state
- disabled action state
- unavailable data state

Examples:

```text
No services found
No plans yet
No messages yet
No bookings yet
```

---

# 30. COMPONENT QUALITY

Suggested categories:

```text
components/ui/
components/layout/
components/brand/
components/cards/
components/feedback/
```

Examples:

- Button
- Input
- SearchInput
- Badge
- Avatar
- VerifiedBadge
- Rating
- TrustScore
- ServiceCard
- BuddyCard
- PlanCard
- EmptyState
- SectionHeader
- FilterChip
- Dialog
- Sheet
- Skeleton

Do not over-abstract components before repeated usage exists.

---

# 31. CODE QUALITY

Mandatory:

```text
TypeScript strict mode
ESLint
Prettier
type checking
production build
```

Prefer:

- explicit return types for important domain helpers
- small pure functions
- predictable naming
- clear imports
- no circular dependencies
- no hidden side effects
- no nested callback mess
- no copy-pasted logic

---

# 32. REQUIRED QUALITY COMMANDS

At each checkpoint run the applicable commands.

At minimum:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

Where tests exist:

```bash
pnpm test
```

Before a phase is considered complete:

```bash
pnpm check
```

must pass.

If there is no root `check` script yet, create it.

---

# 33. UI QUALITY CHECKS

Automated build success is not enough.

After each UI batch:

1. Start the web app.
2. Inspect affected pages visually.
3. Check at least:
   - mobile width
   - tablet width
   - desktop width
4. Verify:
   - no overlap
   - no overflow
   - no cropped text
   - proper spacing
   - logo correct
   - font correct
   - colors correct
   - cards consistent
   - CTA hierarchy correct
   - image ratios correct
   - empty states correct
5. Compare against approved UI references.

If browser automation/screenshots are available, use them.

Do not claim a UI check was completed if it was not actually inspected.

---

# 34. AGENT EXECUTION LOOP — CRITICAL

Do NOT attempt the entire project in one uncontrolled coding pass.

Work in controlled batches.

## Batch size

Complete either:

- **10–12 clearly scoped tasks**, OR
- **2–3 closely related sections/features**

Then STOP implementation and run a checkpoint.

## Checkpoint procedure

After each batch:

```text
1. Review changed files
2. Run formatter/check
3. Run lint
4. Run typecheck
5. Run tests if applicable
6. Run production build
7. Start application
8. Perform visual/UI check
9. Fix every introduced issue
10. Re-run failed checks
11. Mark completed tasks only after all applicable checks pass
12. Review remaining task list
13. Start next batch
```

Never continue piling work on top of failing checks.

---

# 35. TASK STATUS FORMAT

Maintain a task tracker in:

```text
docs/WEB_IMPLEMENTATION_TASKS.md
```

Use:

```markdown
- [ ] Pending task
- [~] In progress task
- [x] Completed + verified task
- [!] Blocked task — reason
```

`[x]` is allowed only after the task's implementation passes its quality gate.

---

# 36. PHASE 0 — REPOSITORY FOUNDATION

Tasks:

- [ ] Inspect existing repository.
- [ ] Confirm monorepo structure.
- [ ] Configure Node `26.10.0`.
- [ ] Configure pnpm workspace.
- [ ] Configure Turborepo.
- [ ] Configure root TypeScript.
- [ ] Configure ESLint.
- [ ] Configure Prettier.
- [ ] Create shared config package where appropriate.
- [ ] Scaffold `apps/web`.
- [ ] Create root `data/website-data.json`.
- [ ] Create `docs/WEB_IMPLEMENTATION_TASKS.md`.

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

- [ ] Add Poppins.
- [ ] Add Inter.
- [ ] Add approved color tokens.
- [ ] Add spacing system.
- [ ] Add radii.
- [ ] Add shadows.
- [ ] Add breakpoints.
- [ ] Add logo assets.
- [ ] Build Button.
- [ ] Build Badge.
- [ ] Build Avatar.
- [ ] Build Input.
- [ ] Build FilterChip.
- [ ] Build base Card.
- [ ] Build SectionHeader.
- [ ] Build app container/layout primitives.

### Gate

Verify colors and typography visually.

Then run full quality checks.

---

# 38. PHASE 2 — DATA FOUNDATION

Tasks:

- [ ] Define domain types.
- [ ] Define Zod schemas.
- [ ] Build valid `website-data.json`.
- [ ] Implement JSON loader.
- [ ] Implement centralized selectors.
- [ ] Add service selectors.
- [ ] Add buddy/profile selectors.
- [ ] Add plan selectors.
- [ ] Add booking selectors.
- [ ] Add trust selectors.
- [ ] Add chat selectors.
- [ ] Add graceful missing-data handling.

### Gate

- JSON schema validation passes.
- No business data is hardcoded in components.
- lint/typecheck/build pass.

---

# 39. PHASE 3 — PUBLIC SHELL + HOME

Build:

- header
- responsive navigation
- footer
- hero
- popular activities
- featured/recommended buddies
- popular plans
- trust/safety
- how it works
- Pro teaser
- final CTA

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

- `/explore`
- search
- categories
- filters
- location
- price
- rating
- verification
- trust
- results grid
- responsive mobile filter UI
- no-results state

Filtering can be local frontend logic based on `website-data.json`.

Do not invent server calls.

### Gate

Functional filter check + UI check + full quality checks.

---

# 41. PHASE 5 — BUDDY + SERVICES

Build:

- buddy detail
- service list per buddy
- service detail
- verified badge
- rating
- trust score
- recommendation indicator
- interests
- languages
- service fee presentation
- availability
- send request CTA

Maintain the moral pricing terminology rule.

### Gate

Review all pricing labels manually.

Then run quality checks.

---

# 42. PHASE 6 — PLANS

Build:

- plans listing
- filter/tabs where approved
- plan detail
- create plan form
- join plan action
- created/joined/past sections where represented in data
- empty states

If interaction requires local temporary state, isolate it clearly and do not pretend persistence exists.

### Gate

Form validation + responsive UI + quality checks.

---

# 43. PHASE 7 — BOOKINGS

Build:

- booking request form
- booking summary
- my bookings
- booking detail
- accepted/rejected/completed/cancelled UI states
- fee display
- date/time
- user/service relationship

No real payment/backend call yet.

### Gate

Validate all booking-state views.

Then quality checks.

---

# 44. PHASE 8 — CHAT

Build:

- conversation list
- chat detail
- responsive split layout
- message bubbles
- user status presentation where data provides it
- no-conversation state

No fake network calls.

### Gate

Desktop + mobile web UI inspection.

Then quality checks.

---

# 45. PHASE 9 — PROFILE + PRO

Build:

- user profile
- my services
- my plans
- my bookings
- subscription screen
- upgrade to Pro UI
- verification state
- Trust Score
- editable profile form if approved in static-demo scope

Use current user data from JSON.

### Gate

Check Free vs Pro UI conditions.

Then quality checks.

---

# 46. PHASE 10 — ADMIN

Build approved admin modules:

- users
- verification
- services
- plans
- bookings
- trust
- reports
- subscriptions

Use the same static data source.

Admin actions may be frontend demo interactions only until backend is connected.

Do not fabricate permanent mutation.

### Gate

Role/navigation UI check + full quality checks.

---

# 47. PHASE 11 — POLISH

Complete:

- all skeletons
- all empty states
- error states
- responsive issues
- accessibility improvements
- keyboard navigation
- focus states
- image optimization
- metadata
- page titles
- favicons/logo
- consistent content
- consistent spacing
- remove debug code
- remove console logs
- remove unused components
- remove unused dependencies

### Gate

Full repository check.

---

# 48. PHASE 12 — FINAL WEB RELEASE CHECK

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

# 49. TESTING PRIORITIES

At minimum test:

## Unit

- service filtering
- category filtering
- free-user price limit helpers
- Pro entitlement helpers
- trust display mapping
- recommendation-state mapping
- JSON selectors

## Component

- BuddyCard
- ServiceCard
- PlanCard
- TrustScore
- filters
- pricing display
- empty state

## End-to-end / browser where configured

Critical user journeys:

```text
Home → Explore → Buddy → Service
Home → Plans → Plan detail
Explore → Filters
Profile → Subscription
Messages → Conversation
Admin → User detail
```

---

# 50. NO-HALLUCINATION PROTOCOL

Before implementing a requirement:

```text
1. Check this file.
2. Check BRD.
3. Check HLD.
4. Check LLD.
5. Check folder-structure.md.
6. Check approved UI assets/references in repository.
7. Check existing source code.
```

If there is a conflict:

Priority order:

```text
Most recent explicit user instruction
→ current master instruction file
→ final BRD
→ locked HLD
→ locked LLD
→ folder-structure.md
→ older notes
```

If still unresolved:

Do NOT invent.

Add:

```ts
// TODO(product-decision): <short explanation>
```

and continue with unaffected tasks.

---

# 51. NO TOKEN / TIME WASTAGE RULE

Avoid:

- repeatedly explaining what you are about to do
- rewriting already-correct files
- opening unrelated files
- refactoring unaffected modules
- generating unnecessary documentation
- generating duplicate components
- introducing new libraries without need
- creating speculative architecture
- premature backend code
- premature mobile implementation

Focus only on the current batch.

---

# 52. BEFORE EACH BATCH

Read:

```text
docs/WEB_IMPLEMENTATION_TASKS.md
```

Select the next cohesive 10–12 tasks or 2–3 sections.

Inspect the relevant files before editing.

Then implement.

---

# 53. AFTER EACH BATCH

Update:

```text
docs/WEB_IMPLEMENTATION_TASKS.md
```

Record:

- tasks completed
- checks executed
- blockers
- next batch

Do not produce fake completion claims.

---

# 54. UI REFERENCE COMPLIANCE CHECKLIST

Before completing each major visual page ask:

- Does it look like the approved FindBuddy dark UI?
- Is the navy background correct?
- Are purple/lavender accents consistent?
- Are Poppins and Inter applied correctly?
- Is the FB logo correct?
- Are cards rounded consistently?
- Is whitespace generous?
- Are photos prominent?
- Does it feel social rather than corporate?
- Are prices attached to services, not people?
- Is trust visible but not overclaimed?
- Are CTAs obvious?
- Is the page responsive?
- Are hover/focus/active states polished?

If not, fix before completion.

---

# 55. DATA REPLACEMENT READINESS

The web frontend must be designed so that backend integration later requires replacing the data adapter, not rewriting views.

Target architecture:

```text
UI Component
      ↓
Feature hook / selector
      ↓
Data interface
      ↓
website-data.json   ← NOW

Later:

UI Component
      ↓
Feature hook
      ↓
API client
      ↓
Node/Express API
```

This separation is mandatory.

---

# 56. GIT / CHANGE HYGIENE

- Keep changes scoped.
- Do not modify unrelated files.
- Use meaningful commit-ready chunks.
- Do not store secrets.
- Do not commit `.env`.
- Provide `.env.example` only when environment variables exist.
- Do not commit `.next`, `node_modules`, build artifacts, or local caches.

---

# 57. FINAL DEFINITION OF DONE

The FindBuddy web version is done only when:

- approved routes exist
- approved UI is implemented
- approved brand system is consistent
- data comes from `data/website-data.json`
- no random hardcoded business datasets exist
- responsive design is verified
- accessibility basics are implemented
- lint passes
- Prettier passes
- typecheck passes
- tests pass
- production build passes
- UI inspection passes
- task tracker is complete
- no critical TODO remains
- no debug code remains
- no hidden backend exists
- no unapproved feature was added

---

# 58. STARTING INSTRUCTION FOR CODEX

When this file is first provided to you, do the following:

```text
1. Read this entire file.
2. Read the BRD, HLD, LLD and folder-structure.md.
3. Inspect the current repository.
4. Inspect all approved UI/logo references available in the repo.
5. Create/update docs/WEB_IMPLEMENTATION_TASKS.md.
6. Compare current repo state against Phase 0.
7. Select the first batch of no more than 10–12 tasks.
8. Implement only that batch.
9. Run the full applicable checkpoint.
10. Fix failures.
11. Mark only verified tasks complete.
12. Continue batch-by-batch until the full web MVP is complete.
```

Do not ask for confirmation between normal implementation batches unless:

- a required product decision is genuinely missing
- a destructive action is required
- credentials/external account access are required
- an approved asset is absent and cannot safely be substituted

Otherwise proceed autonomously.

---

# 59. FINAL PRINCIPLE

**Quality over speed, but do not waste work.**

Build FindBuddy once, cleanly.

The application should look intentional, modern and premium, while keeping the codebase simple enough to maintain and cheap enough to operate.

Do not drift from the approved product.

Do not drift from the approved UI.

Do not invent data architecture.

Do not bypass quality checks.

**Implement → verify → mark complete → review tasks → continue.**
