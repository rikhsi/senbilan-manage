import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  type Credentials,
  LoginUseCase,
  LogoutUseCase,
  RestoreSessionUseCase,
} from '@senbilan/core/application';
import { AccessPolicy, type PermissionKey, type Session } from '@senbilan/core/domain';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  session: Session | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  status: 'idle',
  error: null,
};

const accessPolicy = new AccessPolicy();

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => store.status() === 'authenticated'),
    isAnonymous: computed(() => store.status() === 'anonymous'),
    isLoading: computed(() => store.status() === 'loading'),
    user: computed(() => store.session()?.user ?? null),
    permissions: computed(() => store.session()?.permissions ?? new Set<PermissionKey>()),
  })),
  withMethods((store) => {
    const loginUseCase = inject(LoginUseCase);
    const logoutUseCase = inject(LogoutUseCase);
    const restoreUseCase = inject(RestoreSessionUseCase);

    return {
      can(permission: PermissionKey): boolean {
        return accessPolicy.can(store.session(), permission);
      },

      canAny(permissions: readonly PermissionKey[]): boolean {
        return accessPolicy.canAny(store.session(), permissions);
      },

      canAll(permissions: readonly PermissionKey[]): boolean {
        return accessPolicy.canAll(store.session(), permissions);
      },

      async login(credentials: Credentials): Promise<Session> {
        patchState(store, { status: 'loading', error: null });
        try {
          const session = await loginUseCase.execute(credentials);
          patchState(store, { session, status: 'authenticated', error: null });
          return session;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'auth.login.failed';
          patchState(store, { session: null, status: 'anonymous', error: message });
          throw error;
        }
      },

      async logout(): Promise<void> {
        patchState(store, { status: 'loading', error: null });
        try {
          await logoutUseCase.execute();
        } finally {
          patchState(store, { session: null, status: 'anonymous', error: null });
        }
      },

      async restore(signal?: AbortSignal): Promise<Session | null> {
        patchState(store, { status: 'loading', error: null });
        try {
          const session = await restoreUseCase.execute(signal);
          patchState(store, {
            session,
            status: session ? 'authenticated' : 'anonymous',
            error: null,
          });
          return session;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'errors.unexpected';
          patchState(store, { session: null, status: 'anonymous', error: message });
          return null;
        }
      },
    };
  }),
);

export type AuthStore = InstanceType<typeof AuthStore>;
