import { type HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { mapHttpErrorToAppError } from '../map-http-error';
import { TimeoutError as AppTimeoutError, isAppError } from '@senbilan/core/application';

/** Converts transport failures into the application `AppError` hierarchy. */
export const errorNormalizationInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (isAppError(error) || error instanceof AppTimeoutError) {
        return throwError(() => error);
      }
      return throwError(() => mapHttpErrorToAppError(error));
    }),
  );
