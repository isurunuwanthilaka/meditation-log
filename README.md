# meditation-log

Cross-platform meditation journal with:
- **Web**: Next.js app deployable to Vercel
- **Mobile**: Expo React Native app for Android/iOS
- **Shared package**: cross-platform schemas/types
- **Pricing**: single paid plan at **$1/month** (no add-ons or tiers)

## Monorepo layout

- `/apps/web` - Next.js web app + API routes
- `/apps/mobile` - Expo app for Android/iOS
- `/packages/shared` - shared domain schemas and types

## Quick start

```bash
npm install
npm run dev:web
```

In another terminal:

```bash
npm run dev:mobile
```

## Environment variables

### Web (`apps/web`)

- `POSTGRES_URL` (optional): if set, API routes persist logs in Postgres (recommended on Vercel).
- If not set, logs use in-memory storage for local development.

### Mobile (`apps/mobile`)

- `EXPO_PUBLIC_API_BASE_URL` (required): base URL of the deployed web/API app, e.g. `https://your-vercel-app.vercel.app`

## Vercel deployment

1. Import this repository in Vercel.
2. Keep root as repository root (uses `vercel.json`) or set root directory to `apps/web`.
3. Add `POSTGRES_URL` in Vercel environment variables to enable persistent storage.
4. Deploy to get preview and production URLs.

## Mobile build and release

Use Expo Application Services (EAS):

```bash
cd apps/mobile
npx eas login
npx eas init
npx eas build --platform android --profile preview
npx eas build --platform ios --profile preview
npx eas submit --platform android --profile production
npx eas submit --platform ios --profile production
```

Update `apps/mobile/app.json` and `apps/mobile/eas.json` values with your real app identifiers and EAS project ID before release.

## Validation scripts

```bash
npm run lint
npm run typecheck
npm test
npm run mobile:check
```
