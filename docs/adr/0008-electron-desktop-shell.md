# ADR 0008: Electron as thin desktop shell

**Status:** Accepted  
**Date:** 2026-03-26

## Context

Admin needs a desktop host without forking the Angular feature tree. Options: full Electron app with duplicated UI, Tauri, or a thin BrowserWindow around the existing admin build.

## Decision

Ship **`apps/admin-desktop`** as Electron **main + preload only**. Renderer = `apps/admin` (dev URL or `dist/apps/admin/browser`). IPC is typed via `DesktopBridgeApi` / `provideDesktopPlatform()` in `@senbilan/platform/desktop`.

Security defaults: `contextIsolation`, `sandbox`, `nodeIntegration: false`, allowlisted `openExternal`.

## Consequences

- No feature code in `electron/*.cjs`
- Auth remains in the renderer (httpOnly refresh) — see ADR 0005
- Packaging / auto-update are follow-ups; document in `docs/platform/desktop.md`
