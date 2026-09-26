# Senbilan Manage

Nx + Angular monorepo for **Senbilan Manage** — a web app and a Capacitor/Ionic mobile shell sharing Clean Architecture domain/application layers, a design system, vendor bridges, and feature libraries.

- **Node** `>=22.12` · **npm** `>=10`
- **Angular** ~22 · **Nx** 23 · **Vitest** · **Storybook** 10

## Apps

| Project   | Path           | Role                                           |
| --------- | -------------- | ---------------------------------------------- |
| `web`     | `apps/web`     | Web SPA (design system + optional Taiga/Ionic) |
| `mobile`  | `apps/mobile`  | Capacitor / Ionic mobile shell                 |
| `desktop` | `apps/desktop` | Electron thin shell around `web`               |

## Libraries (high level)

```
libs/
  core/domain          Pure domain (entities, VOs, policies) — no Angular/RxJS
  core/application     Use cases + ports (repositories, clock, storage, logger)
  infra/               Adapters: api, mock, storage, observability
  platform/            platform/core + mobile + desktop
  entities/            FSD entities (user, role, permission, notification)
  features/            FSD features (auth, dashboard, users, roles, …)
  design-system/       tokens, ui, icons, layout — vendor-free
  vendors/ui           Taiga / Ionic wrappers + CSS variable bridges
  shared/              util, ng, config, i18n, query, auth, theme, command, testing
```

Import only public APIs: `@senbilan/<group>/<name>` (see `tsconfig.base.json` paths).

Deep docs: [Architecture](docs/ARCHITECTURE.md) · [Design system](docs/DESIGN-SYSTEM.md) · [i18n](docs/I18N.md) · [Testing](docs/TESTING.md) · [Deployment](docs/DEPLOYMENT.md) · [Contributing](docs/CONTRIBUTING.md) · [AGENTS.md](AGENTS.md)

## Quick start

```sh
npm ci
npm start                 # nx serve web     → http://localhost:4200
npm run start:mobile      # nx serve mobile  → http://localhost:4300
npm run desktop           # Electron shell   → loads web on :4200 (start web first)
```

| Host    | Dev port | Notes                                     |
| ------- | -------- | ----------------------------------------- |
| web     | `4200`   | Browser + Electron renderer               |
| mobile  | `4300`   | Ionic/Capacitor preview                   |
| desktop | —        | No HTTP server; opens Electron → web:4200 |

Dev API calls use same-origin `/admin` and `/v1` paths; `proxy.conf.json` forwards them to `https://api.senbilan.uz` (no CORS on localhost). Production builds set `apiBaseUrl` to that host and call it directly.

### Mock API

Development environments set `features.mockApi: true` in:

- `apps/web/src/environments/environment.ts`
- `apps/mobile/src/environments/environment.ts`

Wire HTTP vs mock adapters in the app composition root based on `APP_CONFIG.features.mockApi`. Production envs set `mockApi: false`. Root `.env*` files mirror the same flags for tooling (`FEATURE_MOCK_API`).

```sh
# optional local overrides (gitignored)
cp .env.example .env.local
```

## Scripts

| Script                               | What it does                                                         |
| ------------------------------------ | -------------------------------------------------------------------- |
| `npm start` / `start:mobile`         | Serve web / mobile                                                   |
| `npm run build`                      | Build web + mobile                                                   |
| `npm run build:web` / `build:mobile` | Single app production build                                          |
| `npm run lint`                       | ESLint (incl. module boundaries) across projects                     |
| `npm run lint:styles`                | Stylelint for SCSS                                                   |
| `npm run typecheck`                  | `ngc` / `tsc --noEmit` across projects                               |
| `npm test`                           | Vitest unit tests                                                    |
| `npm run i18n:check`                 | Translation key parity check                                         |
| `npm run depcruise`                  | Dependency-cruiser architecture rules                                |
| `npm run storybook`                  | Storybook for `design-system-ui`                                     |
| `npm run verify`                     | format + lint + styles + typecheck + depcruise + i18n + test + build |
| `npm run graph`                      | Nx project graph                                                     |
| `npm run desktop` / `desktop:open`   | Electron shell                                                       |

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
Vendor kits (Taiga / Ionic): `@senbilan/vendors/ui` — not inside design-system.

## AI / agents

Any AI coding in this repo **must** follow [AGENTS.md](AGENTS.md) and `.cursor/rules/`.
