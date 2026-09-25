import { TestBed } from '@angular/core/testing';
import { LoginUseCase, LogoutUseCase, RestoreSessionUseCase } from '@senbilan/core/application';
import { AuthStore } from './auth.store';
import { buildSession, createMockUseCase } from '@senbilan/shared/testing';

describe('AuthStore', () => {
  it('moves to authenticated after successful login', async () => {
    const session = buildSession();
    const login = createMockUseCase(async () => session);
    const logout = createMockUseCase(async () => undefined);
    const restore = createMockUseCase(async () => null);

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: LoginUseCase, useValue: login },
        { provide: LogoutUseCase, useValue: logout },
        { provide: RestoreSessionUseCase, useValue: restore },
      ],
    });

    const store = TestBed.inject(AuthStore);
    await store.login({ email: 'admin@senbilan.dev', password: 'password123' });

    expect(store.status()).toBe('authenticated');
    expect(store.user()?.id).toBe(session.user.id);
    expect(login.calls).toHaveLength(1);
  });

  it('records anonymous status when login fails', async () => {
    const login = createMockUseCase(async () => {
      throw new Error('auth.login.failed');
    });

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: LoginUseCase, useValue: login },
        { provide: LogoutUseCase, useValue: createMockUseCase(async () => undefined) },
        { provide: RestoreSessionUseCase, useValue: createMockUseCase(async () => null) },
      ],
    });

    const store = TestBed.inject(AuthStore);
    await expect(store.login({ email: 'x@y.z', password: 'bad' })).rejects.toThrow(
      'auth.login.failed',
    );
    expect(store.status()).toBe('anonymous');
    expect(store.error()).toBe('auth.login.failed');
  });
});
