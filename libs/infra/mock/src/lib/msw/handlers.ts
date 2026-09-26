import { http, HttpResponse, type RequestHandler } from 'msw';
import { notificationToWire, roleToWire, sessionToWire, userToWire } from './wire-mappers';
import { getMockDb } from '../mock-data.store';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_PHONE,
  permissionDescriptors,
} from '../fixtures/mock-db';
import {
  createEmail,
  createSession,
  IsoDateTime,
  RoleId,
  UserId,
  unwrap,
  type PermissionKey,
  type User,
  type UserStatus,
} from '@senbilan/core/domain';

const envelope = <T>(data: T, meta?: Record<string, unknown>) =>
  HttpResponse.json(meta !== undefined ? { data, meta } : { data });

const error = (status: number, code: string, message: string, extra?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, message, ...extra } }, { status });

const bearerUser = (request: Request): User | null => {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length);
  const db = getMockDb();
  const userId = db.accessTokens.get(token);
  if (!userId) {
    return null;
  }
  return db.users.find((u) => u.id === userId) ?? null;
};

const buildSession = (user: User) => {
  const db = getMockDb();
  const permissions = new Set<PermissionKey>();
  for (const roleId of user.roleIds) {
    db.roles.find((r) => r.id === roleId)?.permissions.forEach((p) => permissions.add(p));
  }
  return createSession({
    user,
    roleIds: user.roleIds,
    permissions: [...permissions],
    issuedAt: IsoDateTime(new Date().toISOString()),
    expiresAt: IsoDateTime(new Date(Date.now() + 3600_000).toISOString()),
  });
};

const REFRESH_COOKIE = 'senbilan_refresh';

const parseCookie = (header: string | null, name: string): string | null => {
  if (!header) {
    return null;
  }
  for (const part of header.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === name) {
      return decodeURIComponent(rest.join('=') || '');
    }
  }
  return null;
};

const issueTokens = (userId: string) => {
  const db = getMockDb();
  const accessToken = `access.${userId}.${Date.now()}`;
  const refreshToken = `refresh.${userId}.${Date.now()}`;
  db.accessTokens.set(accessToken, userId);
  db.refreshTokens.set(refreshToken, userId);
  return { accessToken, refreshToken, expiresInSeconds: 3600 };
};

const refreshCookieHeader = (refreshToken: string): string =>
  `${REFRESH_COOKIE}=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;

/** MSW handlers mirroring the HTTP API contract used by `infra/api`. */
export const createMockHandlers = (apiBaseUrl: string): readonly RequestHandler[] => {
  const base = apiBaseUrl.replace(/\/$/, '');

  return [
    http.post(`${base}/admin/v1/auth/login`, async ({ request }) => {
      const body = (await request.json()) as {
        phone?: string;
        password?: string;
        device_id?: string;
      };
      const phone = body.phone?.trim() ?? '';
      const db = getMockDb();
      const user =
        db.users.find((u) => u.email === phone.toLowerCase()) ??
        (phone === DEMO_ADMIN_PHONE || phone === DEMO_ADMIN_EMAIL
          ? db.users.find((u) => u.email === DEMO_ADMIN_EMAIL)
          : undefined);
      if (!user || body.password !== DEMO_ADMIN_PASSWORD || user.status === 'blocked') {
        return error(401, 'unauthorized', 'Authentication required');
      }
      const tokens = issueTokens(user.id);
      return HttpResponse.json({
        success: true,
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          access_expires_at: new Date(Date.now() + tokens.expiresInSeconds * 1000).toISOString(),
        },
        request_id: 'mock',
      });
    }),

    http.post(`${base}/v1/auth/logout`, () =>
      HttpResponse.json({ success: true, data: null, request_id: 'mock' }),
    ),

    http.post(`${base}/v1/auth/refresh`, async ({ request }) => {
      const body = (await request.json()) as { refresh_token?: string };
      const cookieHeader = request.headers.get('Cookie');
      const fromCookie = parseCookie(cookieHeader, REFRESH_COOKIE);
      const refresh = body.refresh_token ?? fromCookie;
      if (!refresh) {
        return error(401, 'unauthorized', 'Authentication required');
      }
      const db = getMockDb();
      const userId = db.refreshTokens.get(refresh);
      if (!userId) {
        return error(401, 'unauthorized', 'Authentication required');
      }
      db.refreshTokens.delete(refresh);
      const tokens = issueTokens(userId);
      return HttpResponse.json({
        success: true,
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          access_expires_at: new Date(Date.now() + tokens.expiresInSeconds * 1000).toISOString(),
        },
        request_id: 'mock',
      });
    }),

    http.post(`${base}/auth/refresh`, async ({ request }) => {
      const body = (await request.json().catch(() => ({}))) as { refreshToken?: string };
      const db = getMockDb();
      const cookieToken = parseCookie(request.headers.get('cookie'), REFRESH_COOKIE);
      const token = cookieToken || body.refreshToken;
      if (!token || !db.refreshTokens.has(token)) {
        return error(401, 'unauthorized', 'Authentication required');
      }
      const userId = db.refreshTokens.get(token)!;
      db.refreshTokens.delete(token);
      const next = issueTokens(userId);
      return HttpResponse.json(
        { data: next },
        {
          headers: {
            'Set-Cookie': refreshCookieHeader(next.refreshToken),
          },
        },
      );
    }),

    http.get(`${base}/auth/me`, ({ request }) => {
      const user = bearerUser(request);
      if (!user) {
        return error(401, 'unauthorized', 'Authentication required');
      }
      return envelope(sessionToWire(buildSession(user)));
    }),

    http.get(`${base}/users`, ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const size = Number(url.searchParams.get('size') ?? '20');
      const search = url.searchParams.get('search')?.toLowerCase() ?? '';
      let items = [...getMockDb().users];
      if (search) {
        items = items.filter(
          (u) =>
            u.email.includes(search) ||
            u.firstName.toLowerCase().includes(search) ||
            u.lastName.toLowerCase().includes(search),
        );
      }
      const start = (page - 1) * size;
      return envelope(items.slice(start, start + size).map(userToWire), {
        total: items.length,
        page,
        size,
      });
    }),

    http.get(`${base}/users/:id`, ({ params }) => {
      const user = getMockDb().users.find((u) => u.id === params['id']);
      if (!user) {
        return error(404, 'not-found', 'User was not found', {
          resource: 'User',
          id: String(params['id']),
        });
      }
      const roles = getMockDb().roles.filter((r) => user.roleIds.includes(r.id));
      return envelope({ user: userToWire(user), roles: roles.map(roleToWire) });
    }),

    http.post(`${base}/users`, async ({ request }) => {
      const body = (await request.json()) as {
        email: string;
        firstName: string;
        lastName: string;
        roleIds: string[];
      };
      const now = IsoDateTime(new Date().toISOString());
      const user: User = {
        id: UserId(`user-${crypto.randomUUID()}`),
        email: unwrap(createEmail(body.email)),
        firstName: body.firstName,
        lastName: body.lastName,
        avatarUrl: null,
        status: 'invited',
        roleIds: body.roleIds.map(RoleId),
        lastActiveAt: null,
        createdAt: now,
        updatedAt: now,
      };
      getMockDb().users.unshift(user);
      return envelope(userToWire(user));
    }),

    http.patch(`${base}/users/:id`, async ({ params, request }) => {
      const db = getMockDb();
      const index = db.users.findIndex((u) => u.id === params['id']);
      const current = db.users[index];
      if (!current) {
        return error(404, 'not-found', 'User was not found', {
          resource: 'User',
          id: String(params['id']),
        });
      }
      const body = (await request.json()) as Partial<{
        firstName: string;
        lastName: string;
        roleIds: string[];
        avatarUrl: string | null;
        status: UserStatus;
      }>;
      const next: User = {
        ...current,
        ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
        ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
        ...(body.roleIds !== undefined ? { roleIds: body.roleIds.map(RoleId) } : {}),
        ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        updatedAt: IsoDateTime(new Date().toISOString()),
      };
      db.users[index] = next;
      return envelope(userToWire(next));
    }),

    http.patch(`${base}/users/:id/status`, async ({ params, request }) => {
      const db = getMockDb();
      const index = db.users.findIndex((u) => u.id === params['id']);
      const current = db.users[index];
      if (!current) {
        return error(404, 'not-found', 'User was not found', {
          resource: 'User',
          id: String(params['id']),
        });
      }
      const body = (await request.json()) as { status: UserStatus };
      const next = {
        ...current,
        status: body.status,
        updatedAt: IsoDateTime(new Date().toISOString()),
      };
      db.users[index] = next;
      return envelope(userToWire(next));
    }),

    http.post(`${base}/users/delete`, async ({ request }) => {
      const body = (await request.json()) as { ids: string[] };
      const idSet = new Set(body.ids);
      const db = getMockDb();
      db.users = db.users.filter((u) => !idSet.has(u.id));
      return envelope(null);
    }),

    http.get(`${base}/roles`, () => envelope(getMockDb().roles.map(roleToWire))),

    http.get(`${base}/roles/:id`, ({ params }) => {
      const role = getMockDb().roles.find((r) => r.id === params['id']);
      if (!role) {
        return error(404, 'not-found', 'Role was not found', {
          resource: 'Role',
          id: String(params['id']),
        });
      }
      return envelope(roleToWire(role));
    }),

    http.post(`${base}/roles`, async ({ request }) => {
      const body = (await request.json()) as {
        name: string;
        description: string;
        permissions: PermissionKey[];
      };
      const now = IsoDateTime(new Date().toISOString());
      const role = {
        id: RoleId(`role-${crypto.randomUUID()}`),
        name: body.name,
        description: body.description,
        permissions: [...body.permissions],
        isSystem: false,
        usersCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      getMockDb().roles = [...getMockDb().roles, role];
      return envelope(roleToWire(role));
    }),

    http.patch(`${base}/roles/:id`, async ({ params, request }) => {
      const db = getMockDb();
      const index = db.roles.findIndex((r) => r.id === params['id']);
      const current = db.roles[index];
      if (!current) {
        return error(404, 'not-found', 'Role was not found', {
          resource: 'Role',
          id: String(params['id']),
        });
      }
      const body = (await request.json()) as Partial<{
        name: string;
        description: string;
        permissions: PermissionKey[];
      }>;
      const next = {
        ...current,
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.permissions !== undefined ? { permissions: body.permissions } : {}),
        updatedAt: IsoDateTime(new Date().toISOString()),
      };
      db.roles[index] = next;
      return envelope(roleToWire(next));
    }),

    http.delete(`${base}/roles/:id`, ({ params }) => {
      const db = getMockDb();
      const role = db.roles.find((r) => r.id === params['id']);
      if (!role) {
        return error(404, 'not-found', 'Role was not found', {
          resource: 'Role',
          id: String(params['id']),
        });
      }
      if (role.isSystem) {
        return error(409, 'conflict', 'System roles cannot be deleted');
      }
      db.roles = db.roles.filter((r) => r.id !== params['id']);
      return envelope(null);
    }),

    http.get(`${base}/permissions`, () => envelope(permissionDescriptors)),

    http.get(`${base}/notifications`, ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const size = Number(url.searchParams.get('size') ?? '20');
      const unreadOnly = url.searchParams.get('filter[unreadOnly]') === 'true';
      let items = [...getMockDb().notifications];
      if (unreadOnly) {
        items = items.filter((n) => n.readAt === null);
      }
      const start = (page - 1) * size;
      return envelope(items.slice(start, start + size).map(notificationToWire), {
        total: items.length,
        page,
        size,
      });
    }),

    http.get(`${base}/notifications/unread-count`, () =>
      envelope({ count: getMockDb().notifications.filter((n) => n.readAt === null).length }),
    ),

    http.post(`${base}/notifications/:id/read`, ({ params }) => {
      const db = getMockDb();
      const index = db.notifications.findIndex((n) => n.id === params['id']);
      const current = db.notifications[index];
      if (!current) {
        return error(404, 'not-found', 'Notification was not found', {
          resource: 'Notification',
          id: String(params['id']),
        });
      }
      const next = {
        ...current,
        readAt: current.readAt ?? IsoDateTime(new Date().toISOString()),
      };
      db.notifications[index] = next;
      return envelope(notificationToWire(next));
    }),

    http.post(`${base}/notifications/read-all`, () => {
      const now = IsoDateTime(new Date().toISOString());
      const db = getMockDb();
      db.notifications = db.notifications.map((n) => ({
        ...n,
        readAt: n.readAt ?? now,
      }));
      return envelope(null);
    }),

    http.get(`${base}/dashboard/overview`, ({ request }) => {
      const url = new URL(request.url);
      const range = url.searchParams.get('range') ?? '30d';
      const factor = range === '7d' ? 0.7 : range === '90d' ? 1.3 : 1;
      const overview = getMockDb().dashboard;
      return envelope({
        metrics: overview.metrics.map((m) => ({ ...m, value: Math.round(m.value * factor) })),
        signups: overview.signups,
        activeUsers: overview.activeUsers,
        recentUsers: overview.recentUsers.map(userToWire),
        activity: overview.activity.map((a) => ({
          ...a,
          actor: { ...a.actor, id: a.actor.id },
        })),
      });
    }),
  ];
};
