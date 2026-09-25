import {
  ConflictError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  RateLimitedError,
  ServerError,
  TimeoutError,
  UnauthorizedError,
  UnexpectedError,
  ValidationError,
  type AppError,
  type FieldErrors,
} from '@senbilan/core/application';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorBody {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly details?: unknown;
    readonly fieldErrors?: FieldErrors;
    readonly resource?: string;
    readonly id?: string;
    readonly retryAfterMs?: number | null;
  };
}

const requestIdOf = (error: HttpErrorResponse): string | undefined => {
  const header = error.headers?.get('x-request-id') ?? error.headers?.get('X-Request-Id');
  return header ?? undefined;
};

const errorOptions = (error: HttpErrorResponse): { cause: unknown; requestId?: string } => {
  const requestId = requestIdOf(error);
  return requestId !== undefined ? { cause: error, requestId } : { cause: error };
};

export const mapHttpErrorToAppError = (error: unknown): AppError => {
  if (!(error instanceof HttpErrorResponse)) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return new TimeoutError({ cause: error });
    }
    return new UnexpectedError({ cause: error });
  }

  const options = errorOptions(error);
  const body = (error.error ?? {}) as ApiErrorBody;
  const apiError = body.error;

  if (error.status === 0) {
    return new NetworkError(options);
  }

  switch (error.status) {
    case 401:
      return new UnauthorizedError(options);
    case 403:
      return new ForbiddenError(options);
    case 404:
      return new NotFoundError(apiError?.resource ?? 'Resource', apiError?.id, options);
    case 409:
      return new ConflictError(apiError?.message ?? 'Resource conflict', options);
    case 422:
      return new ValidationError(apiError?.fieldErrors ?? {}, options);
    case 429:
      return new RateLimitedError(apiError?.retryAfterMs ?? null, options);
    case 408:
      return new TimeoutError(options);
    default:
      if (error.status >= 500) {
        return new ServerError(error.status, options);
      }
      return new UnexpectedError(options);
  }
};
