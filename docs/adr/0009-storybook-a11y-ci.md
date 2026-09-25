# ADR 0009: Storybook axe test-runner in CI

**Status:** Accepted  
**Date:** 2026-03-26

## Context

`@storybook/addon-a11y` helps locally but does not fail CI. Visual regressions and WCAG issues can land unnoticed.

## Decision

Run **`@storybook/test-runner` + `axe-playwright`** after `build-storybook` via `npm run storybook:a11y` (config: `libs/design-system/ui/.storybook/test-runner.ts`). CI invokes the same script.

## Consequences

- New DS stories must be axe-clean (wcag2a/aa, wcag21a/aa)
- CI time increases; keep story count focused on primitives
- Docs MDX stories may need exclusions later if they produce false positives
