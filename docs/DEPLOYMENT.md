# Deployment

## Build

```sh
npm ci
npm run build:admin     # → dist/apps/admin
npm run build:mobile    # → dist/apps/mobile
# or
npm run build           # both
```

Default configuration is **production** (optimization, hashing, budgets).

### fileReplacements

| App    | Dev file                                      | Production replacement      |
| ------ | --------------------------------------------- | --------------------------- |
| admin  | `apps/admin/src/environments/environment.ts`  | `environment.production.ts` |
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

- Admin static host: `dist/apps/admin/browser` (SPA; `admin:serve-static` for local check).
- Mobile: web assets synced into native projects via Capacitor.

## CI outline

Workflow: `.github/workflows/ci.yml`

On **push** / **pull_request** to `main`, `dev`, `prod`:

1. Checkout
2. Setup **Node 22** + npm cache
3. `npm ci`
4. `npm run lint`
5. `npm run typecheck`
6. `npm run test`
7. `npm run build:admin`

Recommended follow-ups (not all required in the base workflow):

- `npm run lint:styles`
- `npm run depcruise`
- `npm run i18n:check`
- `npm run build:mobile`
- Playwright e2e with a preview URL / `BASE_URL`
- Upload `dist/apps/admin` as a deployment artifact
- Inject `SENTRY_DSN` and API URLs via CI secrets into env / build-time config

## Environments vs branches

| Branch | Typical deploy target                |
| ------ | ------------------------------------ |
| `dev`  | Staging                              |
| `main` | Integration / pre-prod (team choice) |
| `prod` | Production                           |

Align CDN / hosting project with the branch that triggers the deploy job.
