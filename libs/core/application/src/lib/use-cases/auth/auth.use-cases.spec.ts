import { FakeAuthRepository, FakeClock, InMemorySessionStorage } from '../../../testing/fakes';
import { ValidationError } from '../../errors/app-error';
import { LoginUseCase, LogoutUseCase, RefreshSessionUseCase, RestoreSessionUseCase } from './auth.use-cases';

describe('LoginUseCase', () => {
  it('rejects empty credentials with field errors', async () => {
    const useCase = new LoginUseCase(new FakeAuthRepository(), new InMemorySessionStorage());
    await expect(useCase.execute({ email: ' ', password: '' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('stores the access token and returns the session', async () => {
    const storage = new InMemorySessionStorage();
    const useCase = new LoginUseCase(new FakeAuthRepository(), storage);
    const session = await useCase.execute({ email: 'A@B.co', password: 'secret' });
    expect(session.user.id).toBe('u1');
    expect(storage.getAccessToken()).toBe('access-1');
  });
});

describe('LogoutUseCase', () => {
  it('clears tokens even when the server call fails', async () => {
    const storage = new InMemorySessionStorage();
    storage.setAccessToken('x');
    const auth = new FakeAuthRepository();
    auth.logout = async () => {
      throw new Error('offline');
    };
    await expect(new LogoutUseCase(auth, storage).execute()).rejects.toThrow('offline');
    expect(storage.getAccessToken()).toBeNull();
  });
});

describe('RefreshSessionUseCase', () => {
  it('shares one in-flight refresh between concurrent callers', async () => {
    const auth = new FakeAuthRepository();
    const storage = new InMemorySessionStorage();
    const refresh = new RefreshSessionUseCase(auth, storage);

    const [a, b, c] = await Promise.all([refresh.execute(), refresh.execute(), refresh.execute()]);

    expect(auth.refreshCalls).toBe(1);
    expect(a).toEqual(b);
    expect(b).toEqual(c);
    expect(storage.getAccessToken()).toBe('access-2');
  });

  it('clears the session when refresh fails', async () => {
    const auth = new FakeAuthRepository();
    auth.failRefresh = true;
    const storage = new InMemorySessionStorage();
    storage.setAccessToken('stale');
    await expect(new RefreshSessionUseCase(auth, storage).execute()).rejects.toThrow();
    expect(storage.getAccessToken()).toBeNull();
  });
});

describe('RestoreSessionUseCase', () => {
  it('returns null for anonymous visitors instead of throwing', async () => {
    const auth = new FakeAuthRepository();
    auth.failRefresh = true;
    const storage = new InMemorySessionStorage();
    const useCase = new RestoreSessionUseCase(auth, new RefreshSessionUseCase(auth, storage), storage, new FakeClock());
    await expect(useCase.execute()).resolves.toBeNull();
  });

  it('restores the session via refresh cookie when no access token is present', async () => {
    const auth = new FakeAuthRepository();
    const storage = new InMemorySessionStorage();
    const useCase = new RestoreSessionUseCase(auth, new RefreshSessionUseCase(auth, storage), storage, new FakeClock());
    const session = await useCase.execute();
    expect(session?.user.id).toBe('u1');
    expect(auth.refreshCalls).toBe(1);
  });
});
