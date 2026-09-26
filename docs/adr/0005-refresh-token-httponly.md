# ADR 0005: Refresh token via httpOnly cookie

**Status:** Accepted  
**Date:** 2026-03-25

## Context

SPA auth commonly stores refresh tokens in `localStorage`, which is readable by
XSS. Access tokens must still be sent as Bearer headers for API calls, but the
long-lived refresh credential should not be script-accessible.

## Decision

- **Access token**: short-lived; held in memory (and optionally a non-persistent
  session key for reload) via `SessionStorage` port.
- **Refresh token**: delivered and rotated as an **httpOnly Secure cookie**;
  clients call refresh with `withCredentials` and do not read the cookie from
  JavaScript (`AppConfig.auth.refreshViaCookie: true` by default).
- Refresh flows live behind `AuthRepository.refresh()` and run when the app
  restores a session. The HTTP interceptor does not retry a failed call.
- Any authenticated request that returns 401 clears `SessionStorage` and calls
  `AuthSessionPort.invalidateLocalSession()` so the UI drops the session and
  routes to login without a remote logout call. Login and refresh use `SKIP_AUTH`.

## Consequences

- Access tokens are persisted in `localStorage` via `BrowserSessionStorage`
  (`APP_CONFIG.auth.accessTokenStorageKey`) so a reload can call
  `RestoreSessionUseCase` without forcing login again.
- When `refreshViaCookie` is **false** (current admin API body tokens), the
  refresh token is also stored under `refreshTokenStorageKey`. When **true**,
  JS never persists refresh — only the httpOnly cookie is used.
- Dev/mock stacks simulate the cookie with `MockDataStore.httpOnlyRefreshCookie` and omit `refreshToken` from JS-facing `AuthTokens` when `refreshViaCookie` is true.
- MSW handlers set `Set-Cookie: senbilan_refresh=…; HttpOnly` on login/refresh for HTTP+MSW stacks.
- CSRF: cookie refresh endpoints must use SameSite and/or CSRF defenses on the
  backend; the web app origin must be an allowed credentialed origin.
- XSS can still abuse tokens in `localStorage` until expiry — keep CSP and
  sanitization strict; prefer httpOnly refresh in production when the API supports it.
- Covered by unit tests on mock/HTTP auth adapters (`refreshViaCookie` mode).
