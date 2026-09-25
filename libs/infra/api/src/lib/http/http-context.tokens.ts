import { HttpContextToken } from '@angular/common/http';

/** Skip Authorization header and 401 refresh handling (login, refresh, public assets). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export interface RetryPolicy {
  readonly maxRetries: number;
  readonly retryableStatuses: readonly number[];
  readonly baseDelayMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  baseDelayMs: 300,
};

/** Per-request retry override. `null` disables retries for that request. */
export const RETRY_POLICY = new HttpContextToken<RetryPolicy | null>(() => DEFAULT_RETRY_POLICY);

/** Request timeout in milliseconds. `0` disables. */
export const TIMEOUT_MS = new HttpContextToken<number>(() => 30_000);

/**
 * When true, the logging interceptor stays quiet and callers handle the AppError
 * without a global toast (e.g. form validation round-trips).
 */
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);
