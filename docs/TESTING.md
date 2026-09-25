# Testing

| Layer                | Runner                                           | Location              |
| -------------------- | ------------------------------------------------ | --------------------- |
| Unit / component     | **Vitest** (+ Analog Angular plugin)             | `*.spec.ts` colocated |
| Component a11y / DOM | **Testing Library** (`@testing-library/angular`) | same specs            |
| E2E                  | **Playwright**                                   | `apps/admin-e2e`      |

Shared presets: `tools/vitest/presets.ts` — `tsLibConfig` (node) vs `angularConfig` (jsdom + TestBed).

```sh
npm test                 # all projects
npm run test:coverage
npm run test:e2e         # nx e2e admin-e2e
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

### `design-system/ui`

- Rendering, variants, a11y attributes, keyboard where relevant.
- Prefer Testing Library queries (`getByRole`, …).
- Storybook stories are not a substitute for specs, but cover visual states.

### `entities/*` / `features/*`

- Component behavior with mocked stores / query clients / use cases.
- Prefer testing user-visible outcomes over internal Signal wiring.
- Do not duplicate domain tests.

### `apps/*`

- Prefer thin; smoke / provider wiring only if necessary.
- Real user flows → Playwright.

### E2E (`admin-e2e`)

- Critical paths: login (mock), navigation, one CRUD happy path per major feature.
- Use `data-testid` sparingly; prefer roles/labels (i18n-stable keys or test ids agreed in the feature).

## Conventions

- `passWithNoTests: true` during bootstrap — still add tests with new logic.
- Specs may use non-null assertions; production code may not (`eslint`).
- Do not import `*.spec.ts` from production code (dependency-cruiser).
- Prefer `@senbilan/shared/testing` helpers when available.

## CI

Unit tests run on every PR (`npm test`). E2E may be a separate job/nightly as the suite grows — see [DEPLOYMENT.md](DEPLOYMENT.md).
