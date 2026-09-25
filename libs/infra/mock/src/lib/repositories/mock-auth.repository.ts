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
import { MockDataStore } from '../mock-data.store';

@Injectable()
export class MockAuthRepository extends AuthRepository {
  private readonly store = inject(MockDataStore);
  private readonly sessionStorage = inject(SessionStorage);

  override async login(credentials: Credentials): Promise<AuthResult> {
    const user = this.store.findUserByEmail(credentials.email);
    if (!user || !this.store.assertDemoCredentials(credentials.email, credentials.password)) {
      throw new UnauthorizedError();
    }
    if (user.status === 'blocked') {
      throw new UnauthorizedError();
    }
    const tokens = this.store.issueTokens(user.id);
    return {
      session: this.store.buildSession(user),
      tokens,
    };
  }

  override async logout(): Promise<void> {
    const access = this.sessionStorage.getAccessToken();
    if (access) {
      this.store.db.accessTokens.delete(access);
    }
    const refresh = this.sessionStorage.getRefreshToken();
    if (refresh) {
      this.store.db.refreshTokens.delete(refresh);
    }
  }

  override async refresh(refreshToken?: string): Promise<AuthTokens> {
    const token = refreshToken ?? this.sessionStorage.getRefreshToken() ?? undefined;
    if (!token) {
      throw new UnauthorizedError();
    }
    const userId = this.store.db.refreshTokens.get(token);
    if (!userId) {
      throw new UnauthorizedError();
    }
    this.store.db.refreshTokens.delete(token);
    return this.store.issueTokens(userId);
  }

  override async me(_signal?: AbortSignal): Promise<Session> {
    const user = this.store.resolveAccessToken(this.sessionStorage.getAccessToken());
    if (!user) {
      throw new UnauthorizedError();
    }
    return this.store.buildSession(user);
  }
}
