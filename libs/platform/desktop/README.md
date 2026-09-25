# @senbilan/platform/desktop

Electron readiness stub for the admin desktop shell. **No Electron dependency is
installed yet** — this library reserves the public API and a no-op bridge.

## Status

| Piece                      | State                                             |
| -------------------------- | ------------------------------------------------- |
| `DesktopService` port      | Lives in `@senbilan/platform/core`                |
| `NoopDesktopBridge`        | Exported here (matches the port surface)          |
| `provideDesktopPlatform()` | Registers `NoopDesktopBridge` as `DesktopService` |
| Electron main / preload    | Documented in `apps/desktop/README.md`            |

Tags: `layer:shared`, `kind:platform`.

## Intended wiring (later)

1. Add `electron` + builder tooling under `apps/desktop`.
2. Implement a real bridge that calls `window.senbilanDesktop` (preload API).
3. Keep `contextIsolation: true` and never expose Node in the renderer.
4. Swap `NoopDesktopBridge` for the preload-backed adapter in
   `provideDesktopPlatform()`.

Until then, web hosts can keep using `providePlatform()` from core (browser
`NoopDesktopService`); call `provideDesktopPlatform()` only from the future
desktop entry.
