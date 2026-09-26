import {
  APP_INITIALIZER,
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  type Provider,
} from '@angular/core';
import {
  AuthRepository,
  AuthSessionPort,
  Clock,
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RestoreSessionUseCase,
  SessionStorage,
} from '@senbilan/core/application';
import { provideUseCase } from '@senbilan/shared/ng';
import { AngularAuthSessionPort } from './angular-auth-session.port';
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
 *
 * Also wires `AuthSessionPort` so a failed 401 refresh clears `AuthStore`
 * and navigates to login (tokens are already cleared by the interceptor).
 */
export const provideAuth = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    ...authUseCaseProviders,
    AngularAuthSessionPort,
    { provide: AuthSessionPort, useExisting: AngularAuthSessionPort },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (): (() => Promise<void>) => {
        const auth = inject(AuthStore);
        return () => auth.restore().then(() => undefined);
      },
    },
  ]);
