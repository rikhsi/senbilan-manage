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

Production must set `features.mockApi: false`, real `apiBaseUrl` (`https://api.senbilan.uz`), and Sentry flags as appropriate.

Local `nx serve` uses empty `apiBaseUrl` + root `proxy.conf.json` so `/admin` and `/v1` are proxied (CORS workaround). The Vite proxy is **not** part of production artifacts.

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

## Docker

The web app is a static SPA. `Dockerfile` builds `nx build web` and serves `dist/apps/web/browser` with nginx. The same image is used for every environment: on start, `docker/entrypoint.sh` writes `assets/config.json` from container env (`API_BASE_URL`, `SENTRY_*`). That file overrides the production defaults in `environment.production.ts`.

```sh
docker compose up --build
# http://localhost:8080
```

Copy `docker/env.example` to `.env` next to `docker-compose.yml` on the server (port, image tag, API URL). Do not commit that `.env`.

## GitLab CI

Workflow: `.gitlab-ci.yml`

| Stage  | When                                            | What                                                    |
| ------ | ----------------------------------------------- | ------------------------------------------------------- |
| verify | merge requests, `dev`, `main`, `prod`           | lint, typecheck, boundaries, i18n, tests, `build:web`   |
| image  | `dev`, `main`, `prod`                           | build and push `$CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG` |
| deploy | `dev` → staging; `main` and `prod` → production | SSH, `docker compose pull`, `up -d`                     |

Deploy jobs stay skipped until `DEPLOY_HOST` is set. If `main` must not hit production, delete that rule in `deploy:production`.

Configure in GitLab (not in the repo):

- Runner with the Docker executor and a privileged `docker:dind` service
- Container Registry enabled on the project
- CI/CD variables: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY` (masked). Scope them by environment when staging and production are different hosts
- On the server: Docker installed, the deploy user in the `docker` group, and the `.env` from `docker/env.example`

## GitHub CI outline

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

| Branch | GitLab environment |
| ------ | ------------------ |
| `dev`  | staging            |
| `main` | production         |
| `prod` | production         |

`main` and `prod` both roll out to production. Drop the `main` rule in `deploy:production` if that branch should only build an image.
