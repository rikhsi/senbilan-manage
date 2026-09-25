# ADR 0004: DataTable on Angular CDK

**Status:** Accepted  
**Date:** 2026-03-25

## Context

Admin tables need sorting, selection, sticky headers, keyboard affordances, and
server-driven paging without locking into a heavy grid vendor. Building from
scratch duplicates accessibility work; adopting a full data-grid product fights
the design system.

## Decision

Build `AppDataTableComponent` on **Angular CDK** table / collection primitives
(plus DS cells, row actions, and i18n labels). Column definitions stay in
features/entities; the DS owns presentation and a11y chrome.

## Consequences

- Prefer CDK + DS over AG Grid / PrimeNG Table / similar.
- Server paging/sort/filter state lives in TanStack Query keys (ADR 0003), not
  inside the table component.
- New table behaviours extend the DS table API rather than forking one-off
  HTML tables in features.
