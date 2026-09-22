# Agents

This project is built and maintained by coding agents, with separate web, mobile, and shared workspaces.

## Layout

- `apps/web` — Next.js app + API routes (create/list/delete meditation logs). Has its own `AGENTS.md`.
- `apps/mobile` — Expo React Native app consuming the same API. Has its own `AGENTS.md`.
- `packages/shared` — Zod schemas/types (`MeditationLog`, `MeditationLogInput`) shared by both apps.
- Root `index.html` / `app.js` / `styles.css` are the original static MVP, superseded by `apps/web`. `vercel.json` builds `apps/web`, not these — treat them as dead, don't extend them.

Setup, env vars, and deployment steps: `README.md`.

## Agent responsibilities

- Implement product requirements with minimal, focused code changes.
- Keep meditation log create/list/delete working across web and mobile.
- Preserve the pricing model: $1/month, single plan, no additional tiers or add-ons.
- Update `handoff.md` after meaningful changes so the next agent can continue quickly.
- Before finishing any change, run `npm run lint` and `npm test` from the repo root (add `npm run typecheck` too when touching types) and fix anything they catch. These are also required GitHub Actions checks (`.github/workflows/ci.yml`) on every PR into `main` — a PR can't merge until they're green.
