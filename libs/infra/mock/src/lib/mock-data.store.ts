import { Injectable } from '@angular/core';
import {
  createSession,
  IsoDateTime,
  type PermissionKey,
  type Session,
  type User,
} from '@senbilan/core/domain';
import {
  createMockDb,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_PHONE,
  type MockDb,
  permissionDescriptors,
} from './fixtures/mock-db';

let sharedDb: MockDb | null = null;

/** Shared in-memory dataset used by mock repositories and MSW handlers. */
export const getMockDb = (): MockDb => {
  if (!sharedDb) {
    sharedDb = createMockDb();
  }
  return sharedDb;
};

export const resetMockDb = (): MockDb => {
  sharedDb = createMockDb();
  return sharedDb;
};

@Injectable()
export class MockDataStore {
  get db(): MockDb {
    return getMockDb();
  }

  reset(): void {
    resetMockDb();
  }

  findUserByEmail(email: string): User | undefined {
    const normalised = email.trim().toLowerCase();
    return this.db.users.find((u) => u.email === normalised);
  }

  issueTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
  } {
    const accessToken = `access.${userId}.${Date.now()}`;
    const refreshToken = `refresh.${userId}.${Date.now()}`;
    this.db.accessTokens.set(accessToken, userId);
    this.db.refreshTokens.set(refreshToken, userId);
    return { accessToken, refreshToken, expiresInSeconds: 3600 };
  }

  /** Simulates an httpOnly refresh cookie (not readable via SessionStorage). */
  setHttpOnlyRefresh(token: string): void {
    this.db.httpOnlyRefreshCookie = token;
  }

  getHttpOnlyRefresh(): string | null {
    return this.db.httpOnlyRefreshCookie;
  }

  clearHttpOnlyRefresh(): void {
    this.db.httpOnlyRefreshCookie = null;
  }

  resolveAccessToken(token: string | null | undefined): User | null {
    if (!token) {
      return null;
    }
    const userId = this.db.accessTokens.get(token);
    if (!userId) {
      return null;
    }
    return this.db.users.find((u) => u.id === userId) ?? null;
  }

  buildSession(user: User): Session {
    const permissions = new Set<PermissionKey>();
    for (const roleId of user.roleIds) {
      const role = this.db.roles.find((r) => r.id === roleId);
      role?.permissions.forEach((p) => permissions.add(p));
    }
    const issuedAt = IsoDateTime(new Date().toISOString());
    const expiresAt = IsoDateTime(new Date(Date.now() + 3600_000).toISOString());
    return createSession({
      user,
      roleIds: user.roleIds,
      permissions: [...permissions],
      issuedAt,
      expiresAt,
    });
  }

  assertDemoCredentials(phone: string, password: string): boolean {
    const normalised = phone.trim();
    const isDemo =
      normalised === DEMO_ADMIN_PHONE ||
      normalised === DEMO_ADMIN_EMAIL ||
      this.findUserByEmail(normalised) !== undefined;
    return isDemo && password === DEMO_ADMIN_PASSWORD;
  }

  get permissionDescriptors() {
    return permissionDescriptors;
  }
}
