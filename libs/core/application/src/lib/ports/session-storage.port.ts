/**
 * Where tokens live. The default implementation keeps the access token in
 * memory only; the refresh token is expected to be an httpOnly cookie.
 */
export abstract class SessionStorage {
  abstract getAccessToken(): string | null;
  abstract setAccessToken(token: string | null): void;
  abstract getRefreshToken(): string | null;
  abstract setRefreshToken(token: string | null): void;
  abstract clear(): void;
}
