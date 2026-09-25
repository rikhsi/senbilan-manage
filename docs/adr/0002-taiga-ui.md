# ADR 0002: Taiga UI as temporary vendor kit

**Status:** Accepted  
**Date:** 2026-03-25  
**Updated:** 2026-09-26

## Context

The web app needs a mature Angular kit for some overlays/forms patterns while we
own visual identity through design tokens. We adopt **Taiga UI** (`@taiga-ui/*`)
as that kit — not as the product component API.

## Decision

1. **Product UI** prefers pure `@senbilan/design-system/*` primitives built in-house.
2. **Customized Taiga/Ionic** controls live only in `@senbilan/vendors/ui`.
3. **Stock** Taiga/Ionic (no API customization) may be imported **only from `apps/*`**.
4. **`design-system/*` must not import** `@taiga-ui/*` or `@ionic/*`.
5. Long-term goal: shrink `vendors/ui` and drop Taiga when pure DS covers the need.

## Consequences

- Theme: `--tui-*` / `--ion-*` bridges live under `libs/vendors/ui/src/styles`.
- Apps call `provideDesignSystem()` + `provideVendors()`.
- Features/entities use DS or vendor wrappers — never raw kits (ESLint).
