# Design system

Packages:

| Package                          | Import             | Role                               |
| -------------------------------- | ------------------ | ---------------------------------- |
| `@senbilan/design-system/tokens` | TS + SCSS          | Breakpoints, themes, CSS variables |
| `@senbilan/design-system/icons`  | `AppIconComponent` | Lucide-based icon registry         |
| `@senbilan/design-system/ui`     | Primitives         | Buttons, forms, table, overlays, … |
| `@senbilan/design-system/layout` | Shell layout       | App chrome / page frames           |

Prefix: **`app`** (selectors like `button[app-button]`, `app-icon`).

## Tokens & themes

SCSS entry (once per app `styles.scss`):

```scss
@use 'index'; // via stylePreprocessorOptions.includePaths → tokens/src/styles
```

Themes: **light** / **dark** (+ high-contrast overlay). Applied via `data-theme`, `data-density`, `data-contrast`, `data-motion` on `<html>` (`THEME_ATTRIBUTES` in tokens).

Densities: `compact` | `default` | `comfortable`.

CSS custom properties use the `--app-*` namespace (colors, space, radius, control sizes, durations, easings, chart palette).

TypeScript mirrors: `BREAKPOINTS`, `DURATIONS`, `THEMES`, `CHART_COLOR_VARS`, `readCssVar`.

## Component styles — `@use 'ds'`

Apps and libs configure:

```json
"stylePreprocessorOptions": {
  "includePaths": ["libs/design-system/tokens/src/styles"]
}
```

In every component SCSS:

```scss
@use 'ds' as ds;

.my-block {
  @include ds.focus-reset;
  @include ds.up('md') {
    padding: var(--app-space-4);
  }
}
```

`_ds.scss` forwards mixins (focus ring, visually-hidden, truncate, breakpoints, typography helpers).

### No hardcoded colors / magic sizes

Stylelint (`.stylelintrc.json`) forbids:

- Hex / named colors / `rgb()` / `hsl()` outside `design-system/tokens`
- Raw `px` on padding/margin/gap/radius/font-size
- Literal `font-family`, numeric `z-index`, raw transition durations

Use `var(--app-color-*)`, `var(--app-space-*)`, `var(--app-radius-*)`, `var(--app-duration-*)`, etc. Component-local slots may use `--_*`.

Class names: BEM-ish kebab-case (`app-button__label`, `app-button--loading`).

## Components inventory (`design-system-ui`)

**Primitives:** `AppButtonComponent`, `AppIconButtonComponent`, `AppCardComponent`, `AppPanelComponent`, `AppBadgeComponent`, `AppTagComponent`, `AppStatusComponent`, `AppAvatarComponent`, `AppSkeletonComponent`, `AppTabsComponent`, `AppStatCardComponent`

**States:** empty / error / loading

**Forms:** `AppFormFieldComponent`, `AppInputDirective`, checkbox, switch, radio group, `AppSelectComponent`, `AppSearchInputComponent`, `AppFilterBarComponent`

**Data:** `AppDataTableComponent` (+ cell/row directives), `AppPaginationComponent`, `AppChartComponent`

**Overlays:** modal / drawer (`AppModalService`), confirm dialog, toast, tooltip, menu, sheet / action sheet

**Setup:** `provideDesignSystem()` in each app `app.config.ts`.

Full public list: `libs/design-system/ui/src/index.ts`.

## How to add a component

1. Create under `libs/design-system/ui/src/lib/<name>/`.
2. Standalone, `ChangeDetectionStrategy.OnPush`, `input()` / `output()`, prefix `app`.
3. Styles: `@use 'ds' as ds;` + `--app-*` tokens only.
4. Prefer attribute selectors on native elements when semantics matter (`button[app-button]`).
5. Export from `src/index.ts`.
6. Add a Storybook story (`*.stories.ts`) under the same folder.
7. Run `npm run storybook` and `nx lint design-system-ui`.

Do **not** put feature-specific business UI in the design system — that belongs in `features/*` or `entities/*`.

## Storybook

```sh
npm run storybook
npm run build-storybook
npm run storybook:a11y   # documents a11y addon workflow (panel + CI build)
```

Config: `libs/design-system/ui/.storybook/`. Stories cover Button, Badge, Card,
Panel, FormField+Input, Empty/Error/Loading, DataTable, and Foundation/Tokens
(`--app-*` CSS variables). `@storybook/addon-a11y` is enabled — use the
Accessibility panel while developing.
