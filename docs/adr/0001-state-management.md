# ADR 0001: State management

**Status:** Accepted  
**Date:** 2026-03-25

## Context

The admin and mobile apps need:

- Fine-grained UI updates without Zone.js-heavy patterns
- Shared client state (session, theme, command palette)
- Cached server state with refetch, stale times, and request cancellation
- Interop with Angular Router, HTTP events, and third-party Observables

Putting everything in one global store (classic NgRx store or a single SignalStore) either over-fetches, duplicates server cache, or forces RxJS into the domain layer.

## Decision

Use a **layered state toolkit**:

1. **Angular Signals** — local component / template state, derived `computed`, DOM-driven UI.
2. **@ngrx/signals `signalStore`** — cross-cutting **client** state in `shared/*` (`auth`, `theme`, `command`, …) and occasionally entity-scoped UI state.
3. **TanStack Query** (`@tanstack/angular-query-experimental`) — **server** state: lists, details, mutations with invalidation; lives behind `@senbilan/shared/query` helpers.
4. **RxJS** — at the edges only (HTTP interceptors, router events, library APIs). Prefer converting to Signals for templates.

**core/domain** and **core/application** remain Promise-based and framework-free. Ports accept optional `AbortSignal`. Angular layers adapt ports ↔ Query / stores.

## Consequences

- Clear decision tree for new code (see `AGENTS.md`).
- Features must not invent a second caching layer on top of TanStack Query.
- Forms stay in Angular forms + Signals, not in Query caches.
- ESLint / depcruise keep state libraries out of `libs/core/**`.
