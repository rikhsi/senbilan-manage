# Desktop platform (Electron)

Electron hosts `apps/admin` without duplicating business logic.

## Goals

- One Angular admin build; Electron is a thin secure shell
- IPC only through typed `DesktopBridgeApi` (`@senbilan/platform/desktop`)
- Auth stays in renderer HTTP (`refreshViaCookie` / Bearer access) — **no tokens in main/preload**
- Auto-update and code signing are release concerns (not implemented yet)

## Layout

| Path                          | Role                                                                     |
| ----------------------------- | ------------------------------------------------------------------------ |
| `libs/platform/desktop`       | `provideDesktopPlatform()`, `ElectronDesktopBridge`, `NoopDesktopBridge` |
| `apps/admin-desktop/electron` | `main.cjs` + `preload.cjs`                                               |
| `docs/platform/desktop.md`    | This document                                                            |

## Security checklist

1. `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
2. Preload exposes only `window.senbilanDesktop` matching `DesktopBridgeApi`
3. Validate every URL before `shell.openExternal` (https/mailto allowlist)
4. CSP + no remote module / no `enableRemoteModule`

## Dev / prod load

| Mode              | How                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Dev               | `npm start` then `npm run desktop` → loads `SENBILAN_DESKTOP_URL` (default `http://127.0.0.1:4200`) |
| Prod (unpackaged) | `nx build admin` then Electron `loadFile(dist/apps/admin/browser/index.html)` when `app.isPackaged` |

## Phased rollout

1. **Done** — main/preload shell, bridge types, `provideDesktopPlatform` in admin
2. **Next** — electron-builder / code signing / auto-update
3. **Later** — deep-link protocol, native notifications if product needs them

## Rules for AI assistants

- Prefer extending `DesktopBridgeApi` over ad-hoc `ipcRenderer` in the renderer
- Keep `apps/admin-desktop` free of feature UI
- When changing desktop security, update this doc + [ADR 0005](../adr/0005-refresh-token-httponly.md) if auth is involved
