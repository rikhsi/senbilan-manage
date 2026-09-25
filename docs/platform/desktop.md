# Desktop platform (Electron readiness)

Plan for hosting `apps/admin` inside Electron without duplicating business logic.

## Goals

- One Angular admin build; Electron is a thin secure shell
- IPC only through typed `DesktopBridgeApi` (`@senbilan/platform/desktop`)
- Auth stays in renderer HTTP (httpOnly refresh cookie / bearer access); no Node crypto in preload
- Auto-update and code signing are release concerns, not app features

## Layout

| Path                       | Role                                                    |
| -------------------------- | ------------------------------------------------------- |
| `libs/platform/desktop`    | `provideDesktopPlatform()`, bridge types, no-op adapter |
| `apps/admin-desktop`       | Electron main/preload (plan only today)                 |
| `docs/platform/desktop.md` | This document                                           |

## Security checklist

1. `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
2. Preload exposes only `window.senbilanDesktop` matching `DesktopBridgeApi`
3. Validate every URL before `shell.openExternal`
4. CSP + no remote module

## Phased rollout

1. **Now** — types + no-op + README plan
2. **Next** — scaffold Electron main/preload, load admin `http://localhost:4200` in dev
3. **Prod** — load `file:` / custom protocol from `dist/apps/admin`, auto-update
