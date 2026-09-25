# Architecture

Senbilan Manage combines **Clean Architecture** (core) with **Feature-Sliced Design** (presentation) inside an Nx monorepo.

## Layers

```
┌─────────────────────────────────────────────────────────┐
│  apps/*          composition roots (providers, routes)  │
├─────────────────────────────────────────────────────────┤
│  features/*      screens, routes, feature UI            │
│  entities/*      entity UI + entity-scoped state        │
├─────────────────────────────────────────────────────────┤
│  design-system/* UI primitives, tokens, icons, layout   │
│  shared/*        util, i18n, query, auth, theme, config │
├─────────────────────────────────────────────────────────┤
│  infra/*         HTTP, mock, storage, observability     │
│  platform/*      Capacitor / platform adapters          │
├─────────────────────────────────────────────────────────┤
│  core/application   use cases + ports (interfaces)      │
│  core/domain        entities, VOs, policies, Result     │
└─────────────────────────────────────────────────────────┘
```

### Dependency rule

Dependencies point **inward**:

1. **Domain** depends on nothing framework-related (only `kind:util` / itself).
2. **Application** depends on domain (+ util). Defines **ports**; never imports `infra`, UI, Angular, RxJS, NgRx, TanStack.
3. **Infrastructure / platform** implement ports and may use Angular HTTP, Capacitor, Sentry, etc.
4. **Features / entities** compose UI + state; call use cases / repositories via DI; never reach into another feature’s internals.
5. **Apps** are the only place that wire concrete adapters (`provideX`, `environment`).

Enforced by:

- `@nx/enforce-module-boundaries` in `eslint.config.mjs` (`depConstraints`)
- `dependency-cruiser` (`.dependency-cruiser.cjs`) — circular deps, public API, core framework-free

## Nx tags

Every project has two axes:

### `layer:*` (FSD / placement)

| Tag              | Projects                                         |
| ---------------- | ------------------------------------------------ |
| `layer:core`     | `core-domain`, `core-application`                |
| `layer:shared`   | design-system + most `shared/*`, `platform/core` |
| `layer:infra`    | `infra/*`, `platform/mobile`                     |
| `layer:entities` | `entities/*`                                     |
| `layer:features` | `features/*`                                     |
| `layer:app`      | `admin`, `mobile`                                |
| `layer:e2e`      | `admin-e2e`                                      |

### `kind:*` (technical role — used by ESLint constraints)

| Tag                   | Meaning                         | May depend on                                                                 |
| --------------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| `kind:domain`         | Pure domain                     | `kind:util`                                                                   |
| `kind:application`    | Use cases + ports               | `kind:domain`, `kind:util`                                                    |
| `kind:util`           | Pure TS helpers                 | `kind:util`                                                                   |
| `kind:util-ng`        | Angular helpers                 | util, util-ng, domain, application                                            |
| `kind:tokens`         | Design tokens                   | _(none)_                                                                      |
| `kind:i18n`           | Transloco setup / helpers       | util, util-ng, application, domain                                            |
| `kind:ui`             | Design-system UI                | tokens, ui, util, util-ng, i18n                                               |
| `kind:platform`       | Platform abstractions           | util, util-ng, application, domain                                            |
| `kind:state`          | Auth/theme/query/command stores | application, domain, util, util-ng, i18n, platform, state                     |
| `kind:infrastructure` | Adapters                        | application, domain, util, util-ng, platform, infrastructure                  |
| `kind:entity`         | FSD entity libs                 | application, domain, ui, tokens, util, util-ng, i18n, state                   |
| `kind:feature`        | FSD feature libs                | entity, ui, tokens, state, application, domain, util, util-ng, i18n, platform |
| `kind:testing`        | Test helpers                    | `*`                                                                           |
| `kind:app`            | Applications                    | `*`                                                                           |

Optional platform tags: `platform:web`, `platform:mobile`.

## Ports & adapters

Ports live in `@senbilan/core/application` as **abstract classes** (DI-friendly), e.g.:

- `UserRepository`, `RoleRepository`, `AuthRepository`, …
- `ClockPort`, `KeyValueStoragePort`, `SessionStoragePort`, `LoggerPort`

Adapters live in:

| Lib                             | Responsibility                             |
| ------------------------------- | ------------------------------------------ |
| `@senbilan/infra/api`           | Real HTTP implementations                  |
| `@senbilan/infra/mock`          | In-memory / MSW-backed mocks for local/dev |
| `@senbilan/infra/storage`       | Browser / Capacitor storage                |
| `@senbilan/infra/observability` | Sentry / logging adapters                  |
| `@senbilan/platform/mobile`     | Capacitor-specific services                |

Apps choose adapters from `environment.features.mockApi` and `provideAppConfig(environment)`.

## State strategy

See [ADR 0001](adr/0001-state-management.md).

| Concern                                                      | Tool                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Component / local UI state                                   | Angular **Signals**                                                        |
| Cross-feature client state (session, theme, command palette) | **@ngrx/signals** `signalStore`                                            |
| Server/cache state (lists, detail, stale-while-revalidate)   | **TanStack Query** (`@tanstack/angular-query-experimental`)                |
| Streams / interop (HTTP events, router, third-party)         | **RxJS** — convert at the edge with `toSignal` / `rxResource` where needed |

**Rules of thumb**

- Do not put remote lists only in a SignalStore — use TanStack Query.
- Do not put ephemeral form values in TanStack Query — use Signals / Reactive Forms.
- Domain/application stay Promise-based and framework-free; Angular layers adapt.

## Public API rule

- Libraries export only through `src/index.ts`.
- Apps and other libs import `@senbilan/...` path aliases — never deep paths into `libs/.../src/lib/...`.

## Related

- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [AGENTS.md](../AGENTS.md)
