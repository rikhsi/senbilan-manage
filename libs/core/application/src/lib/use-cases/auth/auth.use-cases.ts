import { isSessionExpired, type Session } from '@senbilan/core/domain';
import { UnauthorizedError, ValidationError } from '../../errors/app-error';
import { type AuthRepository, type AuthTokens, type Credentials } from '../../ports/auth.repository';
import { type Clock } from '../../ports/clock.port';
import { type SessionStorage } from '../../ports/session-storage.port';

const persistTokens = (storage: SessionStorage, tokens: AuthTokens): void => {
  storage.setAccessToken(tokens.accessToken);
  if (tokens.refreshToken !== undefined) {
    storage.setRefreshToken(tokens.refreshToken);
  }
};

export class LoginUseCase {
  constructor(
    private readonly auth: AuthRepository,
    private readonly storage: SessionStorage,
  ) {}

  async execute(credentials: Credentials): Promise<Session> {
    const email = credentials.email.trim().toLowerCase();
    const errors: Record<string, string[]> = {};
    if (!email) {
      errors['email'] = ['email.required'];
    }
    if (!credentials.password) {
      errors['password'] = ['password.required'];
    }
    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }
    const result = await this.auth.login({ email, password: credentials.password });
    persistTokens(this.storage, result.tokens);
    return result.session;
  }
}

export class LogoutUseCase {
  constructor(
    private readonly auth: AuthRepository,
    private readonly storage: SessionStorage,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.auth.logout();
    } finally {
      this.storage.clear();
    }
  }
}

/**
 * Single-flight refresh: concurrent callers share one in-flight promise so a
 * burst of 401s results in exactly one refresh request.
 */
export class RefreshSessionUseCase {
  private inFlight: Promise<AuthTokens> | null = null;

  constructor(
    private readonly auth: AuthRepository,
    private readonly storage: SessionStorage,
  ) {}

  execute(): Promise<AuthTokens> {
    if (!this.inFlight) {
      this.inFlight = this.auth
        .refresh(this.storage.getRefreshToken() ?? undefined)
        .then((tokens) => {
          persistTokens(this.storage, tokens);
          return tokens;
        })
        .catch((error: unknown) => {
          this.storage.clear();
          throw error instanceof Error ? error : new UnauthorizedError({ cause: error });
        })
        .finally(() => {
          this.inFlight = null;
        });
    }
    return this.inFlight;
  }
}

/**
 * Called once on bootstrap. Tries to obtain a session from a refresh cookie;
 * resolves `null` for anonymous visitors instead of throwing.
 */
export class RestoreSessionUseCase {
  constructor(
    private readonly auth: AuthRepository,
    private readonly refresh: RefreshSessionUseCase,
    private readonly storage: SessionStorage,
    private readonly clock: Clock,
  ) {}

  async execute(signal?: AbortSignal): Promise<Session | null> {
    try {
      if (!this.storage.getAccessToken()) {
        await this.refresh.execute();
      }
      const session = await this.auth.me(signal);
      return isSessionExpired(session, this.clock.now()) ? null : session;
    } catch {
      this.storage.clear();
      return null;
    }
  }
}
