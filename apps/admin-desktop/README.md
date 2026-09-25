# admin-desktop (Electron shell)

Thin Electron host around the Angular **admin** app. Feature code stays in
`apps/admin` + shared libs; this package owns **main** / **preload** only.

Full architecture notes: [docs/platform/desktop.md](../../docs/platform/desktop.md).

## Quick start

```sh
# Terminal 1 — Angular admin (mockApi)
npm start

# Terminal 2 — Electron window loading http://127.0.0.1:4200
npx nx run admin-desktop:open
# or: npm run desktop
```

Packaged / production load uses `dist/apps/admin/browser/index.html`
(`nx build admin` first, then `npx electron apps/admin-desktop/electron/main.cjs`
with `app.isPackaged` or unset `SENBILAN_DESKTOP_URL`).

## Layout

```
apps/admin-desktop/
  electron/
    main.cjs      # BrowserWindow + ipcMain (secure defaults)
    preload.cjs   # contextBridge → window.senbilanDesktop
  project.json
  README.md
```

## Security (required — do not weaken)

| Setting            | Value                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| `contextIsolation` | `true`                                                                       |
| `nodeIntegration`  | `false`                                                                      |
| `sandbox`          | `true`                                                                       |
| Preload surface    | Only `DesktopBridgeApi` (`minimize` / `maximize` / `close` / `openExternal`) |
| `openExternal`     | Allowlist `https?` / `mailto` only                                           |

## Angular wiring

`apps/admin` calls `provideDesktopPlatform()` **after** `providePlatform()`.

- Browser → `NoopDesktopBridge`
- Electron renderer (preload present) → `ElectronDesktopBridge` reading `window.senbilanDesktop`

Never import Electron packages from features / domain.

## AI / contributor rules

1. Do **not** put business logic in `electron/main.cjs` or `preload.cjs`.
2. Extend IPC only by updating `DesktopBridgeApi` + preload + main together.
3. Auth stays in the renderer (HTTP + httpOnly refresh cookie) — no tokens in main.
4. Document IPC changes in `docs/platform/desktop.md` and ADR if security-relevant.
