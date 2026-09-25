# @senbilan ESLint rules

## `no-hardcoded-text`

Heuristic rule that flags **user-facing** copy outside Transloco.

| Surface                     | Rule id                          | When                                                       |
| --------------------------- | -------------------------------- | ---------------------------------------------------------- |
| Angular templates (`.html`) | `@senbilan/no-hardcoded-text`    | Text nodes with Latin/Cyrillic letters                     |
| Feature / entity UI TS      | `@senbilan/no-hardcoded-text-ts` | String / static template literals that look like sentences |

Severity starts as **`warn`** in root `eslint.config.mjs`.

### Escape hatch

```ts
// eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- demo credential label for Storybook
const label = 'Demo admin';
```

```html
<!-- eslint-disable-next-line @senbilan/no-hardcoded-text -->
<span>OK</span>
```

Prefer fixing with `{{ 'scope.key' | transloco }}` or `TranslocoService.translate`.

### CLI scan (optional)

`npm run i18n:check` also runs `tools/scripts/no-hardcoded-text.mjs` over feature/entity/DS templates.
