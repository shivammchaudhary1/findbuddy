# FindBuddy web preview

Next.js web frontend for the approved FindBuddy MVP. Node **26.10.0**, pnpm **11.19.0**.

```sh
pnpm install
pnpm dev
```

Open `http://127.0.0.1:3000`. The sample member is Arjun. Visit `/admin` and choose **Open sample admin** to inspect moderation. This explicit preview switch is not authentication.

```sh
pnpm check
pnpm --filter @findbuddy/web exec playwright test
```

Browser tests use an installed Chrome browser. `pnpm check` runs lint, strict TypeScript, formatting, unit/component tests, and production build. Run a built preview with `pnpm --filter @findbuddy/web start` after stopping the dev server.

All sample content and records originate in `data/website-data.json`, validated through the typed adapter in `apps/web/lib/data`. In-memory actions reset on reload. No API, authentication, payment collection, identity verification provider, notifications, emergency dispatch, or server persistence is connected. Review ratings update locally; authoritative Trust Score recalculation awaits the backend.

The original FB symbol is preserved in `apps/web/public/brand`. `Logo` supplies both symbol-only and full wordmark compositions. Typography, palette, and theme tokens follow the supplied references. Remote stock photos use Next.js image optimization; first-time image/font fetching needs internet access.

Progress and verification evidence are recorded in `docs/WEB_IMPLEMENTATION_TASKS.md`. Backend/mobile/infra directories are reserved for later work.
