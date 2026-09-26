import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AuthRepository,
  SessionStorage,
  UnauthorizedError,
  type AuthResult,
  type AuthTokens,
  type Credentials,
} from '@senbilan/core/application';
import {
  IsoDateTime,
  PERMISSION_KEYS,
  RoleId,
  UserId,
  createEmail,
  createSession,
  unwrap,
  type Session,
} from '@senbilan/core/domain';
import { AuthService, type TokenPair } from '@senbilan/infra/openapi';
import { firstValueFrom } from 'rxjs';
import { ApiClient } from '../http/api-client';
import { SKIP_AUTH } from '../http/http-context.tokens';

const DEVICE_ID_STORAGE_KEY = 'senbilan.deviceId';

interface AppTokenPairDto {
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly access_expires_at?: string | null;
  readonly refresh_expires_at?: string | null;
}

const readDeviceId = (): string => {
  try {
    const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing && existing.trim().length > 0) {
      return existing.trim();
    }
    const created =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return `web-${Date.now().toString(36)}`;
  }
};

const decodeJwtPayload = (token: string): Record<string, unknown> => {
  const parts = token.split('.');
  const payloadPart = parts[1];
  if (!payloadPart) {
    return {};
  }
  try {
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    const parsed: unknown = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const expiresInSecondsFrom = (iso: string | null | undefined, fallback = 900): number => {
  if (!iso) {
    return fallback;
  }
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms)) {
    return fallback;
  }
  return Math.max(60, Math.floor(ms / 1000));
};

const tokensFromPair = (pair: TokenPair | AppTokenPairDto): AuthTokens => {
  const accessToken = pair.access_token?.trim() ?? '';
  if (!accessToken) {
    throw new UnauthorizedError();
  }
  const refresh = pair.refresh_token?.trim();
  return {
    accessToken,
    ...(refresh ? { refreshToken: refresh } : {}),
    expiresInSeconds: expiresInSecondsFrom(pair.access_expires_at ?? null),
  };
};

const phoneToEmail = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return `${digits || 'admin'}@phone.senbilan.local`;
};

const sessionFromAccessToken = (
  accessToken: string,
  accessExpiresAt: string | null | undefined,
  fallbackPhone = '',
): Session => {
  const payload = decodeJwtPayload(accessToken);
  const now = new Date();
  const issuedAt = IsoDateTime(now.toISOString());
  const expiresAt = IsoDateTime(
    accessExpiresAt && !Number.isNaN(Date.parse(accessExpiresAt))
      ? accessExpiresAt
      : new Date(now.getTime() + 900_000).toISOString(),
  );

  const sub = String(payload['sub'] ?? payload['user_id'] ?? payload['uid'] ?? 'admin');
  const phone = String(payload['phone'] ?? fallbackPhone);
  const emailClaim = String(payload['email'] ?? '');
  const name = String(payload['name'] ?? payload['full_name'] ?? 'Admin');
  const [firstName, ...rest] = name.trim().split(/\s+/u);
  const lastName = rest.join(' ');

  const email = unwrap(
    createEmail(emailClaim.includes('@') ? emailClaim : phoneToEmail(phone || sub)),
  );

  return createSession({
    user: {
      id: UserId(sub),
      email,
      firstName: firstName || 'Admin',
      lastName: lastName || phone || 'User',
      avatarUrl: null,
      status: 'active',
      roleIds: [RoleId('admin')],
      lastActiveAt: issuedAt,
      createdAt: issuedAt,
      updatedAt: issuedAt,
    },
    roleIds: [RoleId('admin')],
    permissions: PERMISSION_KEYS,
    issuedAt,
    expiresAt,
  });
};

/**
 * Admin auth against OpenAPI:
 * - login: `POST /admin/v1/auth/login` (phone + password + device_id)
 * - refresh/logout: app `/v1/auth/*` with refresh_token in body
 */
@Injectable()
export class HttpAuthRepository extends AuthRepository {
  private readonly authApi = inject(AuthService);
  private readonly api = inject(ApiClient);
  private readonly storage = inject(SessionStorage);

  override async login(credentials: Credentials): Promise<AuthResult> {
    const envelope = await firstValueFrom(
      this.authApi.login(
        {
          phone: credentials.phone.trim(),
          password: credentials.password,
          device_id: readDeviceId(),
        },
        {
          context: new HttpContext().set(SKIP_AUTH, true),
          withCredentials: true,
        },
      ),
    );

    const pair = envelope.data;
    if (!pair) {
      throw new UnauthorizedError();
    }
    const tokens = tokensFromPair(pair);
    return {
      tokens,
      session: sessionFromAccessToken(
        tokens.accessToken,
        pair.access_expires_at ?? null,
        credentials.phone.trim(),
      ),
    };
  }

  override async logout(): Promise<void> {
    const refreshToken = this.storage.getRefreshToken();
    try {
      await this.api.post<null>(
        '/v1/auth/logout',
        refreshToken ? { refresh_token: refreshToken } : {},
        { withCredentials: true },
      );
    } catch {
      // Best-effort revoke; caller always clears local storage.
    }
  }

  override async refresh(refreshToken?: string): Promise<AuthTokens> {
    const token = refreshToken ?? this.storage.getRefreshToken() ?? undefined;
    if (!token) {
      throw new UnauthorizedError();
    }
    const pair = await this.api.post<AppTokenPairDto>(
      '/v1/auth/refresh',
      { refresh_token: token },
      {
        context: new HttpContext().set(SKIP_AUTH, true),
        withCredentials: true,
      },
    );
    return tokensFromPair(pair);
  }

  override async me(_signal?: AbortSignal): Promise<Session> {
    const access = this.storage.getAccessToken();
    if (!access) {
      throw new UnauthorizedError();
    }
    return sessionFromAccessToken(access, null);
  }
}
