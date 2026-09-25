# Contributing

## Setup

```sh
npm ci
npm start
```

Node `>=22.12`, npm `>=10`. Hooks install via `prepare` → Husky.

## Conventional commits

Enforced by Commitlint (`.husky/commit-msg`) + `commitlint.config.cjs`.

Format: `type(scope): subject`

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `build`, `style`, `revert`

**Scope:** kebab-case — prefer Nx project name (`feature-users`, `design-system-ui`, `core-domain`, …) or a clear workspace scope.

Examples:

```
feat(feature-users): add bulk status change
fix(core-domain): correct user status transition
docs(readme): document mock API flag
```

Subject: imperative, no sentence-case / PascalCase; header ≤ 100 chars.

## lint-staged

`.husky/pre-commit` runs `npx lint-staged` (`.lintstagedrc.json`):

| Glob                        | Actions                            |
| --------------------------- | ---------------------------------- |
| `*.{ts,mts,cts,js,mjs,cjs}` | `eslint --fix`, `prettier --write` |
| `*.html`                    | Prettier                           |
| `*.scss`                    | Stylelint `--fix`, Prettier        |
| `*.{json,md,yml,yaml}`      | Prettier                           |

Fix failures locally; do not bypass hooks unless explicitly agreed.

## Module boundaries

- Respect `layer:*` / `kind:*` tags — see [ARCHITECTURE.md](ARCHITECTURE.md).
- Import only `@senbilan/...` public APIs.
- Never import Angular / RxJS / UI / state libs from `libs/core/**`.
- Do not deep-import another lib’s `src/lib`.

`nx lint` and `npm run depcruise` catch violations.

## Code style (short)

- Standalone Angular components, `OnPush`, `input()` / `output()`.
- Signals for local UI; SignalStore / TanStack Query per [ADR 0001](adr/0001-state-management.md).
- SCSS: `@use 'ds' as ds;` — no hardcoded colors.
- All UI copy via Transloco — [I18N.md](I18N.md).
- Follow [AGENTS.md](../AGENTS.md) when using AI assistance.

## Generators

Scaffold via local plugin `@senbilan/workspace` (see `tools/generators/README.md`):

```sh
npx nx g @senbilan/workspace:feature orders
# or: npm run g:feature -- orders
npx nx g @senbilan/workspace:entity order
npx nx g @senbilan/workspace:ui-component chip
npx nx g @senbilan/workspace:use-case create-order --domain=orders
npx nx g @senbilan/workspace:repository order
```

## PR checklist

- [ ] Conventional commit messages
- [ ] `npm run lint` and `npm run typecheck` clean
- [ ] Tests added/updated for new logic; `npm test` green
- [ ] No boundary / depcruise violations
- [ ] i18n keys for `ru` / `en` / `uz` when UI copy changed
- [ ] **Docs / ADR updated** when architecture, platform, auth, or CI behavior changed
- [ ] New DS components have Storybook stories (a11y covered by `storybook:a11y`)
- [ ] i18n keys in **ru / en / uz** for new copy; `npm run i18n:check`
- [ ] Styles use tokens; Stylelint clean
- [ ] New DS components have a Storybook story
- [ ] Env / secrets not committed (`.env.local` only)
- [ ] PR description explains **why**; links issue if any
