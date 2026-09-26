# AGENTS.md — strict coding rules for Senbilan Manage

Any human or AI assistant editing this repository **must** follow these rules. Prefer matching existing patterns in neighboring files over inventing new ones. If a rule conflicts with a short-term shortcut, **keep the rule**.

Docs of record: `docs/ARCHITECTURE.md`, `docs/DESIGN-SYSTEM.md`, `docs/I18N.md`, `docs/TESTING.md`, `docs/CONTRIBUTING.md`, `docs/platform/*`, `docs/adr/*`.

**When you implement architecture, platform hosts (Electron / Capacitor / PWA), or cross-cutting features, update those docs in the same change** so the next human or AI can follow the rules without rediscovering tribal knowledge.

---

## 1. Folder structure (put code in the right place)

| Need                                     | Put it in                                 | Import as                                      |
| ---------------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| Entity / VO / policy / `Result`          | `libs/core/domain`                        | `@senbilan/core/domain`                        |
| Use case + port (abstract repo)          | `libs/core/application`                   | `@senbilan/core/application`                   |
| HTTP / mock / OpenAPI / storage / Sentry | `libs/infra/*`                            | `@senbilan/infra/...`                          |
| Capacitor / device                       | `libs/platform/*`                         | `@senbilan/platform/...`                       |
| Reusable pure TS                         | `libs/shared/util`                        | `@senbilan/shared/util`                        |
| Angular-only helper (no feature UI)      | `libs/shared/ng`                          | `@senbilan/shared/ng`                          |
| AppConfig / tokens                       | `libs/shared/config`                      | `@senbilan/shared/config`                      |
| i18n providers / helpers                 | `libs/shared/i18n`                        | `@senbilan/shared/i18n`                        |
| TanStack Query setup / keys              | `libs/shared/query`                       | `@senbilan/shared/query`                       |
| Session / theme / command stores         | `libs/shared/{auth,theme,command}`        | matching alias                                 |
| Design tokens / SCSS API                 | `libs/design-system/tokens`               | `@senbilan/design-system/tokens` + `@use 'ds'` |
| Pure UI primitive (no Taiga/Ionic)       | `libs/design-system/ui`                   | `@senbilan/design-system/ui`                   |
| Taiga/Ionic wrapper or theme bridge      | `libs/vendors/ui`                         | `@senbilan/vendors/ui`                         |
| Stock Taiga/Ionic (no customization)     | `apps/*` only                             | `@taiga-ui/*` / `@ionic/*`                     |
| Entity-scoped UI / model mappers for UI  | `libs/entities/<name>`                    | `@senbilan/entities/<name>`                    |
| Screen / route / feature flow            | `libs/features/<name>`                    | `@senbilan/features/<name>`                    |
| Providers, routes, env wiring            | `apps/web`, `apps/mobile`, `apps/desktop` | —                                              |

**Do not** create new top-level lib groups without an explicit human decision. **Do not** put business rules in components.

---

## 2. Layer import rules (non-negotiable)

```
domain        → util only
application   → domain, util
infrastructure→ application, domain, util, util-ng, platform, infrastructure
entity        → application, domain, ui, vendor, tokens, util, util-ng, i18n, state
feature       → entity, ui, vendor, tokens, state, application, domain, util, util-ng, i18n, platform
vendor        → vendor, ui, tokens, util, util-ng, i18n
ui (DS)       → tokens, ui, util, util-ng, i18n   (never taiga/ionic)
app           → anything (composition root only)
```

**Forbidden:**

- `libs/core/**` importing `@angular/*`, `rxjs`, `@ngrx/*`, `@tanstack/*`, `@taiga-ui/*`, `@ionic/*`, `@capacitor/*`, `@sentry/*`, or any `libs/infra|features|entities|design-system|vendors`
- `libs/design-system/**` importing `@taiga-ui/*` or `@ionic/*` (use `vendors/ui` or apps)
- `libs/features/**` / `libs/entities/**` importing `@taiga-ui/*` or `@ionic/*` (use DS / vendors wrappers)
- Feature A importing Feature B internals (or deep paths)
- Deep imports: `libs/.../src/lib/...` from outside that project — **only** `@senbilan/...` public API / `src/index.ts`
- Circular dependencies (dependency-cruiser errors)

Tags on every project: `layer:*` + `kind:*` — keep them accurate when generating libs.

---

## 3. Naming

| Kind               | Convention                                   | Example                                     |
| ------------------ | -------------------------------------------- | ------------------------------------------- |
| Files              | kebab-case                                   | `create-user.use-case.ts`, `user.entity.ts` |
| Domain types       | PascalCase                                   | `User`, `Email`                             |
| Use case classes   | `VerbNounUseCase`                            | `CreateUserUseCase`                         |
| Ports              | abstract class `NounRepository` / `NounPort` | `UserRepository`                            |
| Angular components | `App*` in DS; feature-prefixed otherwise     | `AppButtonComponent`, `UsersListPage`       |
| Selectors          | `app-` prefix in DS                          | `button[app-button]`, `app-icon`            |
| CSS classes        | BEM-ish                                      | `app-button__label`, `app-button--loading`  |
| Signals / inputs   | camelCase `input()` / `output()`             | `readonly loading = input(false)`           |
| i18n keys          | `scope.path`                                 | `users.create`                              |
| Nx project names   | as in `project.json` `name`                  | `design-system-ui`, `feature-users`         |
| Commit scopes      | kebab-case project or workspace scope        | `feat(feature-users): …`                    |

---

## 4. Angular components

- **Standalone** only. `changeDetection: ChangeDetectionStrategy.OnPush`.
- Prefer `input()` / `output()` / `model()` over decorators.
- Prefer `inject()` over constructor DI for Angular services.
- Host bindings via `host: { ... }` when stable.
- Templates: control flow `@if` / `@for` / `@switch` (not `*ngIf` / `*ngFor`).
- No `any`. No non-null assertions (`!`) in production code.
- Keep files focused; ESLint warns at ~400 lines.
- **Never** declare `interface` / `type` / domain models / lookup maps / nav or command constants inside `*.component.ts`. Put them in a sibling file:
  - Feature/entity UI models → `*.model.ts` (or `*-metrics.ts` / `*-maps.ts` for pure maps)
  - DS public API types/constants → `*.types.ts` next to the component; export from `src/index.ts`
  - App shell nav / command defs → `apps/<host>/src/app/*-nav.ts`, `*-command.defs.ts` (composition root)
  - Re-export from the component only when the public API historically lived there (prefer exporting types from `index.ts` / `*.model.ts`).

---

## 5. Forms

- Use **Angular Reactive Forms** or signal forms patterns already present in the feature — do not mix randomly in one screen.
- Wrap controls with design-system field primitives: `AppFormFieldComponent`, `AppInputDirective`, `AppSelectComponent`, checkbox / switch / radio.
- Validation messages via **i18n keys**, not inline English/Russian.
- Domain validation belongs in `core/domain` or use-case input validation (`*.validation.ts`); UI only maps errors to keys.
- Do not store form draft state in TanStack Query.

---

## 6. Tables, lists, and details

- Table screens use `AppListPageComponent` from `@senbilan/design-system/layout`: breadcrumbs, then actions, then `AppDataTableComponent`. Cursor lists put `AppCursorPaginationComponent` in the table footer (page picker, previous, next, page size — custom menus, not native selects) and return to the first page when filters change. The page picker lists every page whose cursor is already known. Column show/hide and drag order use `AppColumnSettingsComponent` in the filter drawer; keep the table `columnPicker` off.
- Detail screens use `AppDetailPageComponent` and `AppDetailFieldsComponent`. The trail is dashboard / list / record name. Put record actions in the `actions` slot. Pass `[loading]="true"` while the record is loading.
- Do not add an eyebrow, subtitle, or description under the breadcrumb. The crumb is only as wide as its label. The page frame itself is full width.
- Profile and other shell pages use the same list frame, without a hero block.
- Dashboard metric tiles use `AppStatCardComponent` in a wide grid (same surface and icon chip). New metric screens copy that card, they do not invent another.
- Server-driven lists: **TanStack Query** for data + pagination/sort/filter state as query key inputs.
- Labels (`DataTableLabels`, empty states) from i18n.
- Row actions via `AppRowActionsDirective` / menu — not ad-hoc icon rows with hardcoded colors.
- The name (or primary) column is an underlined primary link to the detail route. Row click opens the same route and ignores clicks on other links.

---

## 7. i18n

- Locales: **`ru`** (default), **`en`**, **`uz`**.
- **Zero** hardcoded user-visible strings in templates or UI TS.
- Add keys to all three locales; run `npm run i18n:check`.
- Scopes per feature (`users`, `auth`, …) + `common` / `ds` when shared.
- DS components take label inputs from callers — they do not embed product copy.

---

## 8. Styles

```scss
@use 'ds' as ds;
```

- Colors / spacing / radius / type / z-index / durations: **only** `var(--app-*)` (or `--_*` local slots).
- **Never** hex, named colors, `rgb()/hsl()`, raw `px` padding, or hardcoded fonts in feature/DS component SCSS (tokens lib is the exception for defining variables).
- Stylelint enforces this — do not disable rules to “ship faster”.

---

## 9. State choice — decision tree

```
Is it remote server data (list/detail) that needs cache/refetch?
  YES → TanStack Query (@senbilan/shared/query). Mutations invalidate queries.
  NO ↓

Is it cross-route / cross-feature client state (session, theme, command palette)?
  YES → @ngrx/signals signalStore in libs/shared/* (kind:state).
  NO ↓

Is it one component / one page ephemeral UI (tabs, drawer open, selected row)?
  YES → Angular Signals (possibly a small local store in the feature file).
  NO ↓

Do you only need to bridge an Observable API?
  YES → RxJS at the edge → toSignal / async pipe sparingly.
  NO → rethink; do not add a new global store library.
```

**Never** put NgRx SignalStore or TanStack Query in `libs/core/**`.

---

## 10. Ports & adapters

- Define ports as **abstract classes** in `core/application`.
- Implement in `infra/api` or `infra/mock`.
- Wire in **app** `app.config.ts` / providers based on `APP_CONFIG.features.mockApi`.
- Prefer `Promise` + optional `AbortSignal` on ports.

---

## 11. Testing

- Domain/application: Vitest, no TestBed, fake ports.
- UI: Vitest + Testing Library; query by role/label.
- Colocate `*.spec.ts`. Do not import specs from prod code.

---

## 12. Explicit don'ts

- Do not use classic `@ngrx/store` / Effects unless the human asks to migrate.
- Do not call `HttpClient` from features — go through ports / query layer.
- Do not commit secrets or `.env.local`.
- Do not bypass ESLint module boundaries or Husky hooks.
- Do not add purple/glow “AI slop” styles — use the design tokens and existing DS.
- Do not invent parallel button/input/table components when DS already exports them.
- Do not put Taiga/Ionic inside `design-system/*` — use `vendors/ui` or apps.
- Do not expand scope (drive-by refactors) beyond the requested task.
- Do not regenerate entire libs when a small edit suffices.

---

## 13. Before finishing a change

1. Public API updated (`src/index.ts`) if exports changed.
2. Tags / boundaries still valid.
3. i18n keys complete.
4. Styles tokenized.
5. Tests for new domain/application logic.
6. `nx lint` / typecheck for touched projects when feasible.
7. **Docs**: if the change adds a host (Electron/Capacitor), auth/security rule, CI gate, generator, or ADR-worthy decision — update `docs/` (+ ADR) in the same PR. Do not leave README “plan only” text that contradicts the code.
