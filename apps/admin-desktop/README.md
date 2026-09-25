# admin-desktop (plan)

Electron host for the Angular admin app. **Not scaffolded yet** — no `electron`
dependency is installed in this monorepo. Use this doc when adding the app.

Full readiness plan (IPC auth, auto-update, security): [docs/platform/desktop.md](../../docs/platform/desktop.md).

## How Electron wraps the admin web build

The desktop app is a **thin native shell** around the existing `apps/admin`
output. Feature code stays shared; only the composition root and platform
providers change.

| Process      | Responsibility                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| **main**     | BrowserWindow, app lifecycle, secure `shell.openExternal`, window controls, autoUpdater                      |
| **preload**  | `contextBridge.exposeInMainWorld('senbilanDesktop', api)` — thin IPC only                                    |
| **renderer** | Built `apps/admin` (dev: load `nx serve admin` URL; prod: `loadFile` / custom protocol of `dist/apps/admin`) |

```
apps/admin-desktop/
  electron/
    main.ts          # BrowserWindow + ipcMain handlers
    preload.ts       # contextBridge API
  README.md          # this file
```

```text
nx build admin          →  dist/apps/admin/**
electron main           →  loads that dist (or localhost in dev)
provideDesktopPlatform  →  DesktopService ↔ window.senbilanDesktop
```

## Security defaults (required)

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` on the BrowserWindow webPreferences when feasible
- Preload exposes only the typed desktop bridge — never raw `ipcRenderer`
- Validate every external URL before `shell.openExternal`

## Angular wiring (later)

1. Implement a real `DesktopService` adapter that reads `window.senbilanDesktop`.
2. Expand `provideDesktopPlatform()` in `@senbilan/platform/desktop` so it
   `{ provide: DesktopService, useClass: ElectronDesktopBridge }`.
3. In the desktop bootstrap, call `provideDesktopPlatform()` after
   `providePlatform()` so it overrides `NoopDesktopService`.
4. Load the admin renderer URL (dev server or packaged assets).

## Out of scope for now

- Adding `electron`, `electron-builder`, or Nx executors
- Packaging / code signing
- Auto-updates (designed in `docs/platform/desktop.md`, not implemented)
