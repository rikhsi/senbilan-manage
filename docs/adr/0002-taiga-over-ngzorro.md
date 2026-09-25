# ADR 0002: Taiga UI over ng-zorro

**Status:** Accepted  
**Date:** 2026-03-25

## Context

The admin app needs a mature Angular component kit (overlays, forms primitives,
date/select patterns) while we own visual identity through design tokens. Both
**Taiga UI** and **ng-zorro-antd** were candidates.

ng-zorro brings a strong Ant Design look-and-feel that fights custom tokens and
pulls a large Less-based theme. Taiga UI is CDK-friendly, tree-shakeable, and
easier to restyle via CSS variables we already bridge in
`@senbilan/design-system/tokens`.

## Decision

Adopt **Taiga UI** (`@taiga-ui/*`) as the vendor kit behind DS primitives.
Product UI prefers `@senbilan/design-system/ui` wrappers; call Taiga directly
only when a DS wrapper does not exist yet.

Do **not** add ng-zorro (or Ant Design Angular) to the workspace.

## Consequences

- Token SCSS maps `--app-*` → `--tui-*` where needed.
- New overlays/forms should extend DS, not invent a second kit.
- Visual regressions are fixed in tokens/DS, not by swapping UI libraries.
