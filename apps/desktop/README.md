# desktop (Electron shell)

Thin Electron host around the Angular **web** app. Feature code stays in
`apps/web` + shared libs; this package owns **main** / **preload** only.

## Dev

```sh
# Terminal 1 — Angular web (mockApi)
npm start

# Terminal 2 — Electron window
npx nx run desktop:open
# or: npm run desktop
```

Packaged / production load uses `dist/apps/web/browser/index.html`
(`nx build web` first, then `npx electron apps/desktop/electron/main.cjs`
without `SENBILAN_DESKTOP_URL`).

## Layout

```
apps/desktop/
  electron/main.cjs
  electron/preload.cjs
  project.json
```

## Bridge

`apps/web` calls `provideDesktopPlatform()` **after** `providePlatform()`.
See `docs/platform/desktop.md` and ADR 0008.
