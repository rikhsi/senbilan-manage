# ADR 0003: TanStack Query for server state

**Status:** Accepted  
**Date:** 2026-03-25

## Context

Lists and details need caching, stale-while-revalidate, cancellation, and
mutation-driven invalidation. Putting that in NgRx SignalStore duplicates
cache keys and invites inconsistent refetch rules. Classic NgRx Effects + store
was rejected as too heavy for Promise-based ports.

## Decision

Use **TanStack Query** (`@tanstack/angular-query-experimental`) for **server**
state, wrapped by `@senbilan/shared/query` (`provideQueryClient`, query keys).
Features call ports through query/mutation helpers; they do not invent a second
HTTP cache.

## Consequences

- Query keys are part of the public contract for invalidation.
- Form drafts and ephemeral UI stay out of the query cache.
- `libs/core/**` remains free of TanStack imports (ESLint enforced).
