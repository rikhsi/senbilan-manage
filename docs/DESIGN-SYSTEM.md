# Design system

Packages:

| Package                          | Import             | Role                                            |
| -------------------------------- | ------------------ | ----------------------------------------------- |
| `@senbilan/design-system/tokens` | TS + SCSS          | Breakpoints, themes, CSS variables (`--app-*`)  |
| `@senbilan/design-system/icons`  | `AppIconComponent` | Lucide-based icon registry (vendor-free)        |
| `@senbilan/design-system/ui`     | Primitives         | Buttons, forms, table, overlays, … (pure / own) |
| `@senbilan/design-system/layout` | Shell layout       | App chrome / page frames                        |
| `@senbilan/vendors/ui`           | Vendor wrappers    | Taiga / Ionic customization + theme bridges     |

Prefix: **`app`** (selectors like `button[app-button]`, `app-icon`).

## Pure DS vs vendors

| Kind of UI                     | Where              | Notes                                    |
| ------------------------------ | ------------------ | ---------------------------------------- |
| Built from scratch             | `design-system/ui` | No `@taiga-ui/*`, no `@ionic/*`          |
| Vendor control we customize    | `vendors/ui`       | Stable `App*` API over Taiga/Ionic       |
| Stock vendor, no customization | `apps/*` only      | Direct `@taiga-ui/*` / `@ionic/*` import |
| Features / entities            | DS or `vendors/ui` | Never raw vendor kits                    |

Long-term: shrink `vendors/ui` and drop Taiga. See [ADR 0002](adr/0002-taiga-ui.md), [ADR 0010](adr/0010-vendors-ui.md).

## Tokens & themes

SCSS entry in each app `styles.scss`:

```scss
@use '../../../libs/design-system/tokens/src/styles/index.scss' as *;
@use '../../../libs/design-system/ui/src/styles/index.scss' as *;
@use '../../../libs/vendors/ui/src/styles/index.scss' as *; // --tui-* / --ion-* bridges
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

- Hex / named colors / `rgb()` / `hsl()` outside `design-system/tokens` and `vendors/ui` theme bridges
- Raw `px` on padding/margin/gap/radius/font-size
- Literal `font-family`, numeric `z-index`, raw transition durations

Use `var(--app-color-*)`, `var(--app-space-*)`, `var(--app-radius-*)`, `var(--app-duration-*)`, etc. Component-local slots may use `--_*`.

Class names: BEM-ish kebab-case (`app-button__label`, `app-button--loading`).

## Components inventory (`design-system-ui`)

**Primitives:** `AppButtonComponent`, `AppIconButtonComponent`, `AppCardComponent`, `AppPanelComponent`, `AppBadgeComponent`, `AppTagComponent`, `AppStatusComponent`, `AppAvatarComponent`, `AppSkeletonComponent`, `AppTabsComponent`, `AppStatCardComponent`

**States:** empty / error / loading

**Forms:** `AppFormFieldComponent`, `AppInputDirective`, checkbox, switch, radio group, `AppSelectComponent`, `AppSearchInputComponent`, `AppFilterBarComponent`

**Data:** `AppDataTableComponent` (+ cell/row directives), `AppPaginationComponent`, `AppChartComponent`

**Overlays:** modal / drawer (`AppModalService`), confirm dialog, toast, menu, sheet / action sheet

**Setup:** `provideDesignSystem()` (+ `provideVendors()` from `@senbilan/vendors/ui`) in each app `app.config.ts`.

Full public list: `libs/design-system/ui/src/index.ts`.

Vendor wrappers (e.g. `AppTooltipDirective`): `libs/vendors/ui/src/index.ts`.

## How to add a pure component

1. Create under `libs/design-system/ui/src/lib/<name>/`.
2. Standalone, `ChangeDetectionStrategy.OnPush`, `input()` / `output()`, prefix `app`.
3. Styles: `@use 'ds' as ds;` + `--app-*` tokens only.
4. Prefer attribute selectors on native elements when semantics matter (`button[app-button]`).
5. **Do not** import `@taiga-ui/*` or `@ionic/*` here.
6. Export from `src/index.ts`.
7. Add a Storybook story (`*.stories.ts`) under the same folder.
8. Run `npm run storybook` and `nx lint design-system-ui`.

Do **not** put feature-specific business UI in the design system — that belongs in `features/*` or `entities/*`.

## How to add a vendor wrapper

1. Create under `libs/vendors/ui/src/lib/<name>/`.
2. Wrap / hostDirective Taiga or Ionic only when we need a stable product API.
3. Extend theme bridges in `libs/vendors/ui/src/styles/` (`_taiga.scss`, `_ionic.scss`).
4. Export from `libs/vendors/ui/src/index.ts`.
5. If no customization is needed — import the stock kit in `apps/*` instead.

## Storybook

```sh
npm run storybook
npm run build-storybook
npm run storybook:a11y   # axe via test-runner in CI
```

Config: `libs/design-system/ui/.storybook/`. Stories cover Button, Badge, Card,
Panel, FormField+Input, Empty/Error/Loading, DataTable, and Foundation/Tokens
(`--app-*` CSS variables). `@storybook/addon-a11y` is enabled — use the
Accessibility panel while developing.
