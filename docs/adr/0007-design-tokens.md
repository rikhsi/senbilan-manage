# ADR 0007: Design tokens as the style source of truth

**Status:** Accepted  
**Date:** 2026-03-25

## Context

Multiple apps and a DS library need one visual language without hex sprawl or
vendor-locked Less/Sass themes. Inline colors and raw `px` defeat dark mode,
density, and contrast variants.

## Decision

Own the look in **`@senbilan/design-system/tokens`**. Feature and DS SCSS use
`@use 'ds' as ds;` and **only** `var(--app-*)` (plus local `--_*` slots).
Stylelint enforces this. Vendor kits (Taiga / Ionic) remap `--tui-*` / `--ion-*`
onto `--app-*` inside `@senbilan/vendors/ui` styles — not inside design-system.

## Consequences

- No hex / `rgb()` / named colors / raw spacing px in feature or DS component SCSS.
- Theme switches flip attributes (`data-theme`, density, contrast, motion).
- New components consume tokens; they do not invent parallel palettes.
