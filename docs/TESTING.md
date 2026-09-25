# Testing

| Layer                | Runner                                           | Location                                          |
| -------------------- | ------------------------------------------------ | ------------------------------------------------- |
| Unit / component     | **Vitest** (+ Analog Angular plugin)             | `*.spec.ts` colocated                             |
| Component a11y / DOM | **Testing Library** (`@testing-library/angular`) | same specs                                        |
| Storybook a11y       | **@storybook/test-runner** + **axe-playwright**  | `libs/design-system/ui/.storybook/test-runner.ts` |

Shared presets: `tools/vitest/presets.ts` — `tsLibConfig` (node) vs `angularConfig` (jsdom + TestBed).
Helpers: `@senbilan/shared/testing`.

```sh
npm test                 # all projects
npm run test:coverage
npm run storybook:a11y   # build (if needed) + axe against static Storybook
```

## What to test per layer

### `core/domain`

- Pure functions, entities, value objects, policies, `Result` paths.
- No TestBed. Prefer table-driven cases for transitions (e.g. user status).

### `core/application`

- Use cases with **fake / in-memory port implementations**.
- Assert orchestration, validation errors, cancellation via `AbortSignal` where applicable.
- Still no Angular.

### `infra/*`

- Adapter mapping (DTO ↔ domain), error mapping, storage serialization.
- Mock HTTP with Vitest / MSW as needed; keep tests deterministic.
- **Auth refresh cookie**: when `APP_CONFIG.auth.refreshViaCookie === true`, adapters must **omit** `refreshToken` from JS-facing `AuthTokens` and keep refresh only in httpOnly cookie (or the mock cookie jar). See [ADR 0005](adr/0005-refresh-token-httponly.md).

### `design-system/ui`

- Rendering, variants, a11y attributes, keyboard where relevant.
- Prefer Testing Library queries (`getByRole`, …).
- Every new primitive needs a Storybook story; CI runs axe via `storybook:a11y`.
- Must stay **vendor-free** (no `@taiga-ui/*` / `@ionic/*`).

### `vendors/ui`

- Thin wrappers and theme bridges only. Prefer unit coverage when behavior diverges from stock Taiga/Ionic.

### `entities/*` / `features/*`

- Component behavior with mocked stores / query clients / use cases.
- Prefer testing user-visible outcomes over internal Signal wiring.
- Do not duplicate domain tests.

### `apps/*`

- Prefer thin; smoke / provider wiring only if necessary.
- Desktop: Electron shell is `apps/desktop` — no feature tests there; cover bridge via platform unit tests if logic grows.

## Conventions

- `passWithNoTests: true` during bootstrap — still add tests with new logic.
- Specs may use non-null assertions; production code may not (`eslint`).
- Do not import `*.spec.ts` from production code (dependency-cruiser).
- Prefer `@senbilan/shared/testing` helpers when available.

## CI

Every PR (`.github/workflows/ci.yml`):

1. lint / stylelint / typecheck
2. depcruise / i18n:check
3. unit tests
4. build web
5. build-storybook + **storybook:a11y** (axe test-runner)

See also [DEPLOYMENT.md](DEPLOYMENT.md).
