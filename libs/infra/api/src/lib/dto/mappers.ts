import {
  createEmail,
  createSession,
  IsoDateTime,
  NotificationId,
  parsePermission,
  RoleId,
  UserId,
  type Notification,
  type PermissionKey,
  type Role,
  type Session,
  type User,
  type UserWithRoles,
} from '@senbilan/core/domain';
import { UnexpectedError, type PermissionDescriptor } from '@senbilan/core/application';
import {
  type AuthResultDto,
  type AuthTokensDto,
  type DashboardOverviewDto,
  type NotificationDto,
  type PermissionDescriptorDto,
  type RoleDto,
  type SessionDto,
  type UserDto,
} from './api.dto';
import type { ActivityEntry, AuthResult, AuthTokens, DashboardOverview } from './mapper.types';

const requireEmail = (value: string): User['email'] => {
  const result = createEmail(value);
  if (!result.ok) {
    throw new UnexpectedError({ cause: result.error });
  }
  return result.value;
};

export const userFromDto = (dto: UserDto): User => ({
  id: UserId(dto.id),
  email: requireEmail(dto.email),
  firstName: dto.firstName,
  lastName: dto.lastName,
  avatarUrl: dto.avatarUrl,
  status: dto.status,
  roleIds: dto.roleIds.map(RoleId),
  lastActiveAt: dto.lastActiveAt ? IsoDateTime(dto.lastActiveAt) : null,
  createdAt: IsoDateTime(dto.createdAt),
  updatedAt: IsoDateTime(dto.updatedAt),
});

export const userToDto = (user: User): UserDto => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatarUrl: user.avatarUrl,
  status: user.status,
  roleIds: user.roleIds,
  lastActiveAt: user.lastActiveAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const roleFromDto = (dto: RoleDto): Role => ({
  id: RoleId(dto.id),
  name: dto.name,
  description: dto.description,
  permissions: [...dto.permissions],
  isSystem: dto.isSystem,
  usersCount: dto.usersCount,
  createdAt: IsoDateTime(dto.createdAt),
  updatedAt: IsoDateTime(dto.updatedAt),
});

export const roleToDto = (role: Role): RoleDto => ({
  id: role.id,
  name: role.name,
  description: role.description,
  permissions: role.permissions,
  isSystem: role.isSystem,
  usersCount: role.usersCount,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
});

export const sessionFromDto = (dto: SessionDto): Session =>
  createSession({
    user: userFromDto(dto.user),
    roleIds: dto.roleIds.map(RoleId),
    permissions: dto.permissions,
    issuedAt: IsoDateTime(dto.issuedAt),
    expiresAt: IsoDateTime(dto.expiresAt),
  });

export const sessionToDto = (session: Session): SessionDto => ({
  user: userToDto(session.user),
  roleIds: [...session.roleIds],
  permissions: [...session.permissions] as PermissionKey[],
  issuedAt: session.issuedAt,
  expiresAt: session.expiresAt,
});

export const tokensFromDto = (dto: AuthTokensDto): AuthTokens => ({
  accessToken: dto.accessToken,
  ...(dto.refreshToken !== undefined ? { refreshToken: dto.refreshToken } : {}),
  expiresInSeconds: dto.expiresInSeconds,
});

export const authResultFromDto = (dto: AuthResultDto): AuthResult => ({
  session: sessionFromDto(dto.session),
  tokens: tokensFromDto(dto.tokens),
});

export const notificationFromDto = (dto: NotificationDto): Notification => ({
  id: NotificationId(dto.id),
  kind: dto.kind,
  title: dto.title,
  body: dto.body,
  link: dto.link,
  readAt: dto.readAt ? IsoDateTime(dto.readAt) : null,
  createdAt: IsoDateTime(dto.createdAt),
});

export const permissionDescriptorFromDto = (dto: PermissionDescriptorDto): PermissionDescriptor => {
  const parsed = parsePermission(dto.key);
  return {
    ...parsed,
    description: dto.description,
  };
};

export const userWithRolesFromDto = (
  userDto: UserDto,
  roles: readonly RoleDto[],
): UserWithRoles => ({
  ...userFromDto(userDto),
  roles: roles.map(roleFromDto),
});

export const dashboardFromDto = (dto: DashboardOverviewDto): DashboardOverview => ({
  metrics: dto.metrics.map((m) => ({ ...m })),
  signups: dto.signups.map((p) => ({ at: IsoDateTime(p.at), value: p.value })),
  activeUsers: dto.activeUsers.map((p) => ({ at: IsoDateTime(p.at), value: p.value })),
  recentUsers: dto.recentUsers.map(userFromDto),
  activity: dto.activity.map(
    (entry): ActivityEntry => ({
      id: entry.id,
      actor: {
        id: UserId(entry.actor.id),
        firstName: entry.actor.firstName,
        lastName: entry.actor.lastName,
        avatarUrl: entry.actor.avatarUrl,
      },
      action: entry.action,
      target: entry.target,
      at: IsoDateTime(entry.at),
    }),
  ),
});
