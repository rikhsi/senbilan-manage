# ADR 0006: Transloco for i18n

**Status:** Accepted  
**Date:** 2026-03-25

## Context

Admin and mobile ship **ru** (default), **en**, and **uz**. Hardcoded strings
break parity and review. Angular’s built-in i18n compile-time pipeline is
awkward for a multi-app Nx monorepo with runtime locale switching.

## Decision

Use **Transloco** (`@jsverse/transloco` + locale/messageformat plugins) via
`@senbilan/shared/i18n`. All user-visible copy is keyed (`scope.path`); DS
components accept labels from callers and do not embed product strings.

## Consequences

- Every new key is added to **ru / en / uz**; `npm run i18n:check` is mandatory.
- Features own scopes (`users`, `auth`, …); shared copy lives in `common` / `ds`.
- No inline English/Russian in templates or UI TypeScript.
- ESLint `@senbilan/no-hardcoded-text` (+ `-ts`) warns on heuristic user-facing
  literals; escape with `eslint-disable-next-line` (see `tools/eslint-rules/README.md`).
  Optional unused-key report: `npm run i18n:unused`.
