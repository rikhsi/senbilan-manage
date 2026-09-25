# ADR 0010: Separate `vendors/ui` from design-system

**Status:** Accepted  
**Date:** 2026-09-26

## Context

Mixing Taiga/Ionic into `@senbilan/design-system/ui` couples our permanent
primitives to disposable vendor kits and slows a future migration off Taiga.

## Decision

Create **`libs/vendors/ui`** (`@senbilan/vendors/ui`, tag `kind:vendor`):

| Concern                                             | Location                |
| --------------------------------------------------- | ----------------------- |
| Pure primitives (button, table, …)                  | `design-system/ui`      |
| Vendor wrappers that need our API (`AppTooltip`, …) | `vendors/ui`            |
| Vendor CSS variable remaps                          | `vendors/ui/src/styles` |
| Stock vendor usage, no wrap                         | `apps/*` only           |

Design-system stays vendor-free. Vendors may depend on DS icons/tokens/ui helpers.

## Consequences

- Faster feature delivery via temporary Taiga wrappers.
- Clear deletion path: remove wrappers + `provideVendors` when replaced by pure DS.
- ESLint forbids `@taiga-ui/*` / `@ionic/*` in `design-system`, `features`, `entities`.
