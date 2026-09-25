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
- Refresh flows live behind `AuthRepository.refresh()`; interceptors retry
  once on 401 after a successful refresh.

## Consequences

- Dev/mock stacks simulate the cookie with `MockDataStore.httpOnlyRefreshCookie` and omit `refreshToken` from JS-facing `AuthTokens` when `refreshViaCookie` is true.
- MSW handlers set `Set-Cookie: senbilan_refresh=…; HttpOnly` on login/refresh for HTTP+MSW stacks.
- CSRF: cookie refresh endpoints must use SameSite and/or CSRF defenses on the
  backend; the admin origin must be an allowed credentialed origin.
- XSS can still abuse the access token until expiry — keep CSP and sanitization
  strict; do not “fix” XSS by moving refresh into `localStorage`.
- E2E: `apps/admin-e2e/src/refresh-cookie.spec.ts` asserts refresh is not readable from web storage after login.
