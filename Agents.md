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

## Workflow for a new feature

1. **Branch first.** Before writing any code, create and check out a new branch off `dev`
   (e.g. `git checkout -b <feature-name> dev`). Don't commit feature work directly to `dev`.
2. **Implement the feature.**
3. **Write tests after the feature works**, covering the behavior just added.
4. **Run the checks** from the repo root: `npm run lint`, `npm run typecheck`, `npm test`. Fix
   anything they catch. These are also the required GitHub Actions checks (`.github/workflows/ci.yml`)
   on every PR — a PR can't merge until they're green.
5. **Only once lint/typecheck/test are all passing**, the agent is authorized to push the feature
   branch to GitHub and open a PR from it into `dev` (not `main`). `dev` is the integration branch;
   promoting `dev` to `main` is a separate, later step.
