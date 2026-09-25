import {
  APP_INITIALIZER,
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  type Provider,
} from '@angular/core';
import {
  AuthRepository,
  Clock,
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RestoreSessionUseCase,
  SessionStorage,
} from '@senbilan/core/application';
import { provideUseCase } from '@senbilan/shared/ng';
import { AuthStore } from './auth.store';

const authUseCaseProviders: Provider[] = [
  provideUseCase(
    RefreshSessionUseCase,
    () => new RefreshSessionUseCase(inject(AuthRepository), inject(SessionStorage)),
  ),
  provideUseCase(
    LoginUseCase,
    () => new LoginUseCase(inject(AuthRepository), inject(SessionStorage)),
  ),
  provideUseCase(
    LogoutUseCase,
    () => new LogoutUseCase(inject(AuthRepository), inject(SessionStorage)),
  ),
  provideUseCase(
    RestoreSessionUseCase,
    () =>
      new RestoreSessionUseCase(
        inject(AuthRepository),
        inject(RefreshSessionUseCase),
        inject(SessionStorage),
        inject(Clock),
      ),
  ),
];

/**
 * Registers auth use cases and restores the session during app bootstrap.
 * `AuthRepository`, `SessionStorage`, and `Clock` must already be provided
 * (infra adapters).
 */
export const provideAuth = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    ...authUseCaseProviders,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (): (() => Promise<void>) => {
        const auth = inject(AuthStore);
        return () => auth.restore().then(() => undefined);
      },
    },
  ]);
