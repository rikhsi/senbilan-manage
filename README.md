# Senbilan Manage

Nx + Angular monorepo for **Senbilan Manage** — an admin web app and a Capacitor/Ionic mobile shell sharing Clean Architecture domain/application layers, a design system, and feature libraries.

- **Node** `>=22.12` · **npm** `>=10`
- **Angular** ~22 · **Nx** 23 · **Vitest** · **Playwright** · **Storybook** 10

## Apps

| Project     | Path             | Role                                 |
| ----------- | ---------------- | ------------------------------------ |
| `admin`     | `apps/admin`     | Web admin (Taiga UI + design system) |
| `mobile`    | `apps/mobile`    | Capacitor / Ionic mobile shell       |
| `admin-e2e` | `apps/admin-e2e` | Playwright e2e against admin         |

## Libraries (high level)

```
libs/
  core/domain          Pure domain (entities, VOs, policies) — no Angular/RxJS
  core/application     Use cases + ports (repositories, clock, storage, logger)
  infra/               Adapters: api, mock, storage, observability
  platform/            platform/core + platform/mobile (Capacitor)
  entities/            FSD entities (user, role, permission, notification)
  features/            FSD features (auth, dashboard, users, roles, …)
  design-system/       tokens, ui, icons, layout
  shared/              util, ng, config, i18n, query, auth, theme, command, testing
```

Import only public APIs: `@senbilan/<group>/<name>` (see `tsconfig.base.json` paths).

Deep docs: [Architecture](docs/ARCHITECTURE.md) · [Design system](docs/DESIGN-SYSTEM.md) · [i18n](docs/I18N.md) · [Testing](docs/TESTING.md) · [Deployment](docs/DEPLOYMENT.md) · [Contributing](docs/CONTRIBUTING.md) · [AGENTS.md](AGENTS.md)

## Quick start

```sh
npm ci
npm start                 # nx serve admin  → http://localhost:4200
npm run start:mobile      # nx serve mobile
```

### Mock API

Development environments set `features.mockApi: true` in:

- `apps/admin/src/environments/environment.ts`
- `apps/mobile/src/environments/environment.ts`

Wire HTTP vs mock adapters in the app composition root based on `APP_CONFIG.features.mockApi`. Production envs set `mockApi: false`. Root `.env*` files mirror the same flags for tooling (`FEATURE_MOCK_API`).

```sh
# optional local overrides (gitignored)
cp .env.example .env.local
```

## Scripts

| Script                                 | What it does                                                         |
| -------------------------------------- | -------------------------------------------------------------------- |
| `npm start` / `start:mobile`           | Serve admin / mobile                                                 |
| `npm run build`                        | Build admin + mobile                                                 |
| `npm run build:admin` / `build:mobile` | Single app production build                                          |
| `npm run lint`                         | ESLint (incl. module boundaries) across projects                     |
| `npm run lint:styles`                  | Stylelint for SCSS                                                   |
| `npm run typecheck`                    | `ngc` / `tsc --noEmit` across projects                               |
| `npm test`                             | Vitest unit tests                                                    |
| `npm run test:e2e`                     | Playwright (`admin-e2e`)                                             |
| `npm run i18n:check`                   | Translation key parity check                                         |
| `npm run depcruise`                    | Dependency-cruiser architecture rules                                |
| `npm run storybook`                    | Storybook for `design-system-ui`                                     |
| `npm run verify`                       | format + lint + styles + typecheck + depcruise + i18n + test + build |
| `npm run graph`                        | Nx project graph                                                     |

Affected variants: `affected:lint`, `affected:test`, `affected:build`, `affected:typecheck`.

Capacitor: `cap:sync`, `cap:open:android`, `cap:open:ios`.

## Branch strategy

| Branch | Purpose                                                         |
| ------ | --------------------------------------------------------------- |
| `main` | Default integration / default Nx base (`nx.json` `defaultBase`) |
| `dev`  | Active development / staging-bound                              |
| `prod` | Production release line                                         |

Work on short-lived feature branches; open PRs into `dev` (or `main` per team convention). CI runs on push/PR to `main`, `dev`, and `prod`.

## Environment files

| File                          | Committed?          | Use                                  |
| ----------------------------- | ------------------- | ------------------------------------ |
| `.env.example`                | yes                 | Template for tooling / CI inject     |
| `.env.development`            | yes                 | Local/dev tooling defaults           |
| `.env.production`             | yes                 | Production placeholders (no secrets) |
| `.env.local` / `.env.*.local` | **no** (gitignored) | Machine-specific overrides           |

Angular apps do **not** read root `.env` at runtime. They use:

- `apps/*/src/environments/environment.ts` (development)
- `apps/*/src/environments/environment.production.ts` (production via `fileReplacements`)

Typed as `AppConfig` from `@senbilan/shared/config`.

## Design system & Storybook

```sh
npm run storybook          # design-system-ui
npm run build-storybook
```

SCSS: `@use 'ds' as ds;` — see [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md).

## AI / agents

Any AI coding in this repo **must** follow [AGENTS.md](AGENTS.md) and `.cursor/rules/`.
