import {
  ENVIRONMENT_INITIALIZER,
  ErrorHandler,
  Injectable,
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { Logger, Telemetry, isAppError, toAppError } from '@senbilan/core/application';
import { APP_CONFIG } from '@senbilan/shared/config';
import { ConsoleLogger } from './console-logger';
import { SentryTelemetry } from './sentry-telemetry';

/**
 * Routes unexpected errors to telemetry. Expected `AppError`s are logged at warn
 * and left for feature-level UI (toasts) to present.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(Logger);
  private readonly telemetry = inject(Telemetry);

  handleError(error: unknown): void {
    if (isAppError(error)) {
      this.logger.warn(error.message, { code: error.code });
      return;
    }
    const appError = toAppError(error);
    this.logger.error(appError.message, error);
    this.telemetry.captureException(error);
  }
}

export const provideObservability = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    ConsoleLogger,
    SentryTelemetry,
    { provide: Logger, useExisting: ConsoleLogger },
    { provide: Telemetry, useExisting: SentryTelemetry },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const telemetry = inject(SentryTelemetry);
        const config = inject(APP_CONFIG);
        void telemetry.init(config);
      },
    },
  ]);
