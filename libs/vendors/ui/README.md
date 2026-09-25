# `@senbilan/vendors/ui`

Temporary **Taiga UI / Ionic** wrappers and theme bridges.

## Purpose

- Customize vendor components when our API/behavior must differ from stock.
- Map vendor CSS variables (`--tui-*`, `--ion-*`) → `--app-*` tokens.
- Keep `@senbilan/design-system/*` **vendor-free** so we can drop Taiga/Ionic later.

## Rules

| Need                                          | Where                                                  |
| --------------------------------------------- | ------------------------------------------------------ |
| Pure product primitive (button, table, …)     | `@senbilan/design-system/ui`                           |
| Vendor control that needs a stable `App*` API | **this lib**                                           |
| Stock vendor control, no customization        | import `@taiga-ui/*` / `@ionic/*` **only in `apps/*`** |
| Features / entities                           | prefer DS or this lib — never raw vendor kits          |

## Setup (apps)

```ts
provideDesignSystem();
provideVendors();
```

```scss
@use '../../../libs/design-system/tokens/src/styles/index.scss' as *;
@use '../../../libs/design-system/ui/src/styles/index.scss' as *;
@use '../../../libs/vendors/ui/src/styles/index.scss' as *;
```
