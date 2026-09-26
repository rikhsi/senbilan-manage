/**
 * Notified by the HTTP auth interceptor when any authenticated request returns 401.
 * Implementations must clear in-memory auth UI state and send the user to login.
 * Do **not** call remote logout here — tokens are already invalid and would 401 again.
 */
export abstract class AuthSessionPort {
  abstract invalidateLocalSession(): void;
}
