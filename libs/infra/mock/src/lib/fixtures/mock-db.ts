import {
  ALL_PERMISSIONS,
  IsoDateTime,
  PERMISSION_KEYS,
  RoleId,
  UserId,
  createEmail,
  unwrap,
  type PermissionKey,
  type Role,
  type User,
  type Notification,
  NotificationId,
  type DashboardOverview,
  type UserStatus,
} from '@senbilan/core/domain';

export const DEMO_ADMIN_EMAIL = 'admin@senbilan.dev';
export const DEMO_ADMIN_PASSWORD = 'password123';

const NOW = IsoDateTime('2026-03-20T10:00:00.000Z');

const FIRST_NAMES = [
  'Alex',
  'Maria',
  'Jamshid',
  'Dilnoza',
  'Sergey',
  'Elena',
  'Omar',
  'Sara',
  'Nikita',
  'Madina',
  'Rustam',
  'Anna',
  'Bekzod',
  'Grace',
  'Timur',
  'Nina',
  'Karim',
  'Olga',
  'Farhod',
  'Liliya',
] as const;

const LAST_NAMES = [
  'Karimov',
  'Ivanova',
  'Saidov',
  'Petrova',
  'Aliyev',
  'Smirnova',
  'Yusupov',
  'Nguyen',
  'Chen',
  'Park',
  'Silva',
  'Rossi',
  'Khan',
  'Brown',
  'Wilson',
] as const;

export const ROLE_DEFS: readonly {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isSystem: boolean;
  readonly permissions: readonly PermissionKey[];
}[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Full system access',
    isSystem: true,
    permissions: [...PERMISSION_KEYS],
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Manage users, roles and settings',
    isSystem: true,
    permissions: PERMISSION_KEYS.filter((k) => k !== 'roles:write'),
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Manage users and view dashboards',
    isSystem: false,
    permissions: [
      'dashboard:read',
      'users:read',
      'users:write',
      'roles:read',
      'permissions:read',
      'notifications:read',
      'settings:read',
      'profile:write',
    ],
  },
  {
    id: 'role-editor',
    name: 'Editor',
    description: 'Edit users, read roles',
    isSystem: false,
    permissions: [
      'dashboard:read',
      'users:read',
      'users:write',
      'roles:read',
      'notifications:read',
      'profile:write',
    ],
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'Read-only access',
    isSystem: false,
    permissions: [
      'dashboard:read',
      'users:read',
      'roles:read',
      'permissions:read',
      'notifications:read',
      'settings:read',
      'profile:write',
    ],
  },
  {
    id: 'role-support',
    name: 'Support',
    description: 'Notifications and user read access',
    isSystem: false,
    permissions: ['dashboard:read', 'users:read', 'notifications:read', 'profile:write'],
  },
];

const statuses: readonly UserStatus[] = ['active', 'invited', 'blocked'];

const buildUsers = (): User[] => {
  const users: User[] = [
    {
      id: UserId('user-admin'),
      email: unwrap(createEmail(DEMO_ADMIN_EMAIL)),
      firstName: 'Senbilan',
      lastName: 'Admin',
      avatarUrl: null,
      status: 'active',
      roleIds: [RoleId('role-owner')],
      lastActiveAt: NOW,
      createdAt: IsoDateTime('2025-01-01T00:00:00.000Z'),
      updatedAt: NOW,
    },
  ];

  for (let i = 1; i <= 59; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length] ?? 'User';
    const last = LAST_NAMES[i % LAST_NAMES.length] ?? 'Test';
    const role = ROLE_DEFS[1 + (i % (ROLE_DEFS.length - 1))] ?? ROLE_DEFS[4];
    const status = statuses[i % statuses.length] ?? 'active';
    users.push({
      id: UserId(`user-${String(i).padStart(3, '0')}`),
      email: unwrap(createEmail(`${first.toLowerCase()}.${last.toLowerCase()}${i}@senbilan.dev`)),
      firstName: first,
      lastName: last,
      avatarUrl: null,
      status,
      roleIds: [RoleId(role?.id ?? 'role-viewer')],
      lastActiveAt: status === 'active' ? NOW : null,
      createdAt: IsoDateTime(`2025-${String((i % 12) + 1).padStart(2, '0')}-15T08:00:00.000Z`),
      updatedAt: NOW,
    });
  }
  return users;
};

const buildRoles = (users: readonly User[]): Role[] =>
  ROLE_DEFS.map((def) => ({
    id: RoleId(def.id),
    name: def.name,
    description: def.description,
    permissions: [...def.permissions],
    isSystem: def.isSystem,
    usersCount: users.filter((u) => u.roleIds.includes(RoleId(def.id))).length,
    createdAt: IsoDateTime('2025-01-01T00:00:00.000Z'),
    updatedAt: NOW,
  }));

const buildNotifications = (): Notification[] => {
  const kinds = ['info', 'success', 'warning', 'danger'] as const;
  return Array.from({ length: 24 }, (_, i) => ({
    id: NotificationId(`notif-${String(i + 1).padStart(3, '0')}`),
    kind: kinds[i % kinds.length] ?? 'info',
    title: `notification.${kinds[i % kinds.length] ?? 'info'}.${i + 1}`,
    body: `Mock notification body #${i + 1}`,
    link: i % 3 === 0 ? '/users' : null,
    readAt: i % 4 === 0 ? null : NOW,
    createdAt: IsoDateTime(`2026-03-${String((i % 20) + 1).padStart(2, '0')}T12:00:00.000Z`),
  }));
};

const buildDashboard = (users: readonly User[], roles: readonly Role[]): DashboardOverview => {
  const active = users.filter((u) => u.status === 'active').length;
  const invited = users.filter((u) => u.status === 'invited').length;
  const points = Array.from({ length: 14 }, (_, i) => ({
    at: IsoDateTime(`2026-03-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`),
    value: 20 + i * 3 + (i % 4),
  }));
  return {
    metrics: [
      { key: 'users.total', value: users.length, delta: 0.08 },
      { key: 'users.active', value: active, delta: 0.05 },
      { key: 'users.invited', value: invited, delta: -0.02 },
      { key: 'roles.total', value: roles.length, delta: null },
    ],
    signups: points,
    activeUsers: points.map((p) => ({ ...p, value: p.value + 10 })),
    recentUsers: users.slice(0, 8),
    activity: users.slice(0, 10).map((u, i) => ({
      id: `act-${i + 1}`,
      actor: {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        avatarUrl: u.avatarUrl,
      },
      action:
        i % 5 === 0
          ? 'user.created'
          : i % 5 === 1
            ? 'user.updated'
            : i % 5 === 2
              ? 'user.blocked'
              : i % 5 === 3
                ? 'role.updated'
                : 'settings.changed',
      target: u.email,
      at: NOW,
    })),
  };
};

export interface MockDb {
  users: User[];
  roles: Role[];
  notifications: Notification[];
  dashboard: DashboardOverview;
  /** refreshToken → userId */
  refreshTokens: Map<string, string>;
  accessTokens: Map<string, string>;
  /** Simulates httpOnly cookie value (not exposed via SessionStorage). */
  httpOnlyRefreshCookie: string | null;
}

export const createMockDb = (): MockDb => {
  const users = buildUsers();
  const roles = buildRoles(users);
  return {
    users,
    roles,
    notifications: buildNotifications(),
    dashboard: buildDashboard(users, roles),
    refreshTokens: new Map(),
    accessTokens: new Map(),
    httpOnlyRefreshCookie: null,
  };
};

export const permissionDescriptors = ALL_PERMISSIONS.map((p) => ({
  ...p,
  description: `permission.${p.key}`,
}));
