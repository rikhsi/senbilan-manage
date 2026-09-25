# Deployment

## Build

```sh
npm ci
npm run build:web     # → dist/apps/web
npm run build:mobile    # → dist/apps/mobile
# or
npm run build           # both
```

Default configuration is **production** (optimization, hashing, budgets).

### fileReplacements

| App    | Dev file                                      | Production replacement      |
| ------ | --------------------------------------------- | --------------------------- |
| web    | `apps/web/src/environments/environment.ts`    | `environment.production.ts` |
| mobile | `apps/mobile/src/environments/environment.ts` | `environment.production.ts` |

Production must set `features.mockApi: false`, real `apiBaseUrl`, and Sentry flags as appropriate.

Root `.env.production` is for CI/tooling inject — **do not** commit secrets. Use `.env.local` locally (gitignored).

## Mobile (Capacitor)

```sh
npm run build:mobile
npm run cap:sync
npm run cap:open:android   # or cap:open:ios
```

## Artifacts

- Web static host: `dist/apps/web/browser` (SPA; `nx run web:serve-static` for local check).
- Mobile: web assets synced into native projects via Capacitor.
- Desktop: Electron loads `dist/apps/web/browser` (see `apps/desktop`).

## CI outline

Workflow: `.github/workflows/ci.yml`

On **push** / **pull_request** to `main`, `dev`, `prod`:

1. Checkout
2. Setup **Node 22** + npm cache
3. `npm ci`
4. `npm run lint` / `lint:styles`
5. `npm run typecheck` / `depcruise` / `i18n:check`
6. `npm run test`
7. `npm run build:web`
8. `build-storybook` + `storybook:a11y`

Recommended follow-ups:

- `npm run build:mobile`
- Upload `dist/apps/web` as a deployment artifact
- Inject `SENTRY_DSN` and API URLs via CI secrets into env / build-time config

## Environments vs branches

| Branch | Typical deploy target                |
| ------ | ------------------------------------ |
| `dev`  | Staging                              |
| `main` | Integration / pre-prod (team choice) |
| `prod` | Production                           |

Align CDN / hosting project with the branch that triggers the deploy job.
