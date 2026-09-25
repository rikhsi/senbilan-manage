/**
 * Application-level error hierarchy.
 *
 * Use cases *throw* these for expected failures (not found, forbidden, validation…)
 * so that query/mutation layers, the global error handler and telemetry all
 * deal with one shape. `code` is stable and maps to `errors.app.<code>` in i18n.
 * Never put secrets or raw server payloads into `message`.
 */
export type AppErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'rate-limited'
  | 'network'
  | 'timeout'
  | 'server'
  | 'unexpected';

export type FieldErrors = Readonly<Record<string, readonly string[]>>;

export abstract class AppError extends Error {
  abstract readonly code: AppErrorCode;
  /** Whether an automatic retry might succeed. */
  readonly retryable: boolean = false;
  /** Correlation id of the failing request, when one exists. */
  readonly requestId: string | undefined;

  protected constructor(message: string, options?: { cause?: unknown; requestId?: string }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = new.target.name;
    this.requestId = options?.requestId;
  }
}

export class UnauthorizedError extends AppError {
  readonly code = 'unauthorized';
  constructor(options?: { cause?: unknown; requestId?: string }) {
    super('Authentication required', options);
  }
}

export class ForbiddenError extends AppError {
  readonly code = 'forbidden';
  constructor(options?: { cause?: unknown; requestId?: string }) {
    super('Insufficient permissions', options);
  }
}

export class NotFoundError extends AppError {
  readonly code = 'not-found';
  constructor(
    readonly resource: string,
    readonly id?: string,
    options?: { cause?: unknown; requestId?: string },
  ) {
    super(`${resource}${id ? ` ${id}` : ''} was not found`, options);
  }
}

export class ConflictError extends AppError {
  readonly code = 'conflict';
  constructor(message = 'Resource conflict', options?: { cause?: unknown; requestId?: string }) {
    super(message, options);
  }
}

export class ValidationError extends AppError {
  readonly code = 'validation';
  constructor(
    readonly fieldErrors: FieldErrors,
    options?: { cause?: unknown; requestId?: string },
  ) {
    super('Validation failed', options);
  }
}

export class RateLimitedError extends AppError {
  readonly code = 'rate-limited';
  override readonly retryable = true;
  constructor(
    readonly retryAfterMs: number | null,
    options?: { cause?: unknown; requestId?: string },
  ) {
    super('Too many requests', options);
  }
}

export class NetworkError extends AppError {
  readonly code = 'network';
  override readonly retryable = true;
  constructor(options?: { cause?: unknown; requestId?: string }) {
    super('Network is unreachable', options);
  }
}

export class TimeoutError extends AppError {
  readonly code = 'timeout';
  override readonly retryable = true;
  constructor(options?: { cause?: unknown; requestId?: string }) {
    super('Request timed out', options);
  }
}

export class ServerError extends AppError {
  readonly code = 'server';
  override readonly retryable = true;
  constructor(
    readonly status: number,
    options?: { cause?: unknown; requestId?: string },
  ) {
    super(`Server responded with ${status}`, options);
  }
}

export class UnexpectedError extends AppError {
  readonly code = 'unexpected';
  constructor(options?: { cause?: unknown; requestId?: string }) {
    super('Unexpected error', options);
  }
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

/** Wraps anything that is not already an AppError so callers can rely on the shape. */
export const toAppError = (value: unknown): AppError =>
  isAppError(value) ? value : new UnexpectedError({ cause: value });
