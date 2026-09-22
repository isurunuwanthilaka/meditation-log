# Handoff

## What was implemented
- Initialized monorepo structure for web, mobile, and shared packages.
- Added shared schemas/types for meditation logs.
- Added Next.js API routes and web UI for creating/listing/deleting logs.
- Added Expo mobile client that consumes the same API.
- Added Vercel and EAS deployment configuration and CI workflow.
- Preserved and carried forward the single-plan pricing requirement ($1/month, no tiers/add-ons).

## Next steps
- Configure real Postgres credentials on Vercel.
- Set `EXPO_PUBLIC_API_BASE_URL` for mobile runtime.
- Replace placeholder EAS project ID and verify store submission metadata.

## "Still Hour" design implementation (web)
- Implemented the `design/` handoff (Organic design system) as the production web app, replacing
  the old unstyled `meditation-log-client.tsx` with five real routes under `apps/web/app/(app)/`:
  `/` (home), `/practice` (timer), `/streak`, `/feed`, `/you`. The `(app)` route group carries the
  shared header/footer chrome; `/login` stays outside it so the auth screen keeps its own layout.
- Ported the Organic tokens/components (colors, type, radii, shadows, `.btn`/`.card`/`.tag`/`.seg`/
  `.field`+`.input`) into `apps/web/app/globals.css`, alongside Tailwind (still used by the login
  screen). Fonts (Caprasimo, Figtree) load via `next/font/google` in `app/layout.tsx`, exposed as
  `--font-caprasimo`/`--font-figtree` and consumed by `--font-heading`/`--font-body`.
- Practice's timer, Streak's grid/streak math, and Feed's composer/bows are real, not mocked:
  sessions are `MeditationLog` rows via the existing `/api/logs`; new `/api/settings`
  (daily goal + reminder/share/bell toggles) and `/api/feed` (+`/api/feed/[id]/bow`) back the new
  screens, stored via `lib/settings-store.ts` / `lib/feed-store.ts` (same in-memory-or-Postgres
  pattern as `lib/log-store.ts`; Postgres path untested against a real database — only the
  in-memory fallback was exercised locally).
- Ownership scoping is unchanged: everything (logs, settings, feed authorship/bows) is still keyed
  by the anonymous `x-owner-id` localStorage UUID (`lib/use-owner-id.ts`), not the Supabase user id
  — that predates this change. Supabase auth (`lib/member.ts`) is used only for display identity
  (name/initials/member-since on `/you`, author name on feed posts) and gating access via the
  existing middleware. Reconciling the two identity schemes (so data follows the account, not the
  browser) is still open.
- Fixed an off-by-one in the design prototype's streak-grid math (`lib/streak.ts`): the prototype's
  formula actually ended the grid on tomorrow and started mid-week, not on a Sunday. Implemented the
  grid per the documented intent (starts on a Sunday 84 days back, ends today) instead of copying the
  prototype's arithmetic.
- Added a "Sign out" link to the footer (wired to the existing, previously-unused `signOut` server
  action) since the design didn't include an account menu and one was otherwise unreachable.
- `design/` is now gitignored (reference material, not shipped code).
- New tests: `apps/web/tests/streak.test.ts`, `settings-store.test.ts`, `feed-store.test.ts`.
  `npm run lint`, `npm run typecheck`, and `npm test` all pass from the repo root.
- Not verified: real visual rendering in a browser (no browser tool was available in this session).
  Verified instead via `curl` against a dev server (with Supabase env/middleware temporarily and
  reversibly stubbed) — confirmed 200s, correct markup/classes, and working API round-trips for
  logs/settings/feed/bow. A human should still eyeball the five screens against the design once
  Supabase credentials are available.
