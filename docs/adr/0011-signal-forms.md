# ADR 0011: Signal-friendly forms

**Status:** Accepted  
**Date:** 2026-03-25

## Context

Screens need validated forms that work under zoneless / signal-first Angular,
with DS field primitives and i18n error keys. Mixing ad-hoc template forms,
reactive forms, and future signal forms in one feature creates inconsistent
UX and test patterns.

## Decision

Prefer **Angular Reactive Forms** (or the repo’s emerging **signal forms**
patterns where already used in a feature). Wrap controls with DS field
primitives (`AppFormFieldComponent`, `AppInputDirective`, …). Domain / use-case
validation owns rules; UI maps failures to Transloco keys.

Do not store form drafts in TanStack Query.

## Consequences

- One form style per screen — do not mix randomly.
- New signal-forms adoption should follow an existing feature exemplar.
- Validation copy always goes through i18n scopes.
