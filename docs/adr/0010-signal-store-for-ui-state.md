# ADR 0010: SignalStore for UI / client state

**Status:** Accepted  
**Date:** 2026-03-25

## Context

Session, theme preferences, and command-palette registry are cross-route
**client** concerns. They are not server caches and should not live in TanStack
Query. A single global classic NgRx store would blur that boundary.

## Decision

Use **@ngrx/signals `signalStore`** (and related signal APIs) in `libs/shared/*`
(`auth`, `theme`, `command`, …) for cross-feature client state. Local component
state stays as Angular Signals.

## Consequences

- Clear split: SignalStore = client; TanStack Query = server (see ADR 0001 / 0003).
- Features may read shared stores; they must not re-implement session/theme.
- Classic `@ngrx/store` / Effects are not introduced unless explicitly migrated.
