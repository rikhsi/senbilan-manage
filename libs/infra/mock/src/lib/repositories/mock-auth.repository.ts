import { Injectable, inject } from '@angular/core';
import {
  AuthRepository,
  SessionStorage,
  UnauthorizedError,
  type AuthResult,
  type AuthTokens,
  type Credentials,
} from '@senbilan/core/application';
import { type Session } from '@senbilan/core/domain';
import { APP_CONFIG } from '@senbilan/shared/config';
import { MockDataStore } from '../mock-data.store';

/**
 * In-memory auth for `features.mockApi`.
 * When `auth.refreshViaCookie` is true, the refresh token lives only in the mock
 * cookie jar (simulating httpOnly) and is omitted from {@link AuthTokens}.
 */
@Injectable()
export class MockAuthRepository extends AuthRepository {
  private readonly store = inject(MockDataStore);
  private readonly sessionStorage = inject(SessionStorage);
  private readonly config = inject(APP_CONFIG);

  override async login(credentials: Credentials): Promise<AuthResult> {
    const user = this.store.findUserByEmail(credentials.email);
    if (!user || !this.store.assertDemoCredentials(credentials.email, credentials.password)) {
      throw new UnauthorizedError();
    }
    if (user.status === 'blocked') {
      throw new UnauthorizedError();
    }
    const issued = this.store.issueTokens(user.id);
    return {
      session: this.store.buildSession(user),
      tokens: this.toClientTokens(issued),
    };
  }

  override async logout(): Promise<void> {
    const access = this.sessionStorage.getAccessToken();
    if (access) {
      this.store.db.accessTokens.delete(access);
    }
    const refresh =
      this.store.getHttpOnlyRefresh() ?? this.sessionStorage.getRefreshToken() ?? undefined;
    if (refresh) {
      this.store.db.refreshTokens.delete(refresh);
    }
    this.store.clearHttpOnlyRefresh();
  }

  override async refresh(refreshToken?: string): Promise<AuthTokens> {
    const cookieMode = this.config.auth.refreshViaCookie;
    const token = cookieMode
      ? (this.store.getHttpOnlyRefresh() ?? undefined)
      : (refreshToken ?? this.sessionStorage.getRefreshToken() ?? undefined);
    if (!token) {
      throw new UnauthorizedError();
    }
    const userId = this.store.db.refreshTokens.get(token);
    if (!userId) {
      throw new UnauthorizedError();
    }
    this.store.db.refreshTokens.delete(token);
    const issued = this.store.issueTokens(userId);
    return this.toClientTokens(issued);
  }

  override async me(_signal?: AbortSignal): Promise<Session> {
    const user = this.store.resolveAccessToken(this.sessionStorage.getAccessToken());
    if (!user) {
      throw new UnauthorizedError();
    }
    return this.store.buildSession(user);
  }

  private toClientTokens(issued: {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
  }): AuthTokens {
    if (this.config.auth.refreshViaCookie) {
      this.store.setHttpOnlyRefresh(issued.refreshToken);
      return {
        accessToken: issued.accessToken,
        expiresInSeconds: issued.expiresInSeconds,
      };
    }
    this.store.clearHttpOnlyRefresh();
    return issued;
  }
}
