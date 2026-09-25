import { type Provider, type Type } from '@angular/core';

/**
 * Registers a plain use-case class as an injectable token.
 * The factory should call `inject(...)` for ports so deps stay type-safe
 * without reflecting constructor metadata.
 *
 * ```ts
 * provideUseCase(LoginUseCase, () => new LoginUseCase(inject(AuthRepository), inject(SessionStorage)))
 * ```
 */
export const provideUseCase = <T>(UseCaseClass: Type<T>, factory: () => T): Provider => ({
  provide: UseCaseClass,
  useFactory: factory,
});
