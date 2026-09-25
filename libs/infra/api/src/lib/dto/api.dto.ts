import {
  type IsoDateTime,
  type PermissionKey,
  type RoleId,
  type UserId,
  type UserStatus,
} from '@senbilan/core/domain';

export interface UserDto {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly avatarUrl: string | null;
  readonly status: UserStatus;
  readonly roleIds: readonly string[];
  readonly lastActiveAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RoleDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly PermissionKey[];
  readonly isSystem: boolean;
  readonly usersCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SessionDto {
  readonly user: UserDto;
  readonly roleIds: readonly string[];
  readonly permissions: readonly PermissionKey[];
  readonly issuedAt: string;
  readonly expiresAt: string;
}

export interface AuthTokensDto {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresInSeconds: number;
}

export interface AuthResultDto {
  readonly session: SessionDto;
  readonly tokens: AuthTokensDto;
}

export interface NotificationDto {
  readonly id: string;
  readonly kind: 'info' | 'success' | 'warning' | 'danger';
  readonly title: string;
  readonly body: string;
  readonly link: string | null;
  readonly readAt: string | null;
  readonly createdAt: string;
}

export interface PermissionDescriptorDto {
  readonly key: PermissionKey;
  readonly resource: string;
  readonly action: string;
  readonly group: string;
  readonly description: string;
}

export interface StatMetricDto {
  readonly key: 'users.total' | 'users.active' | 'users.invited' | 'roles.total';
  readonly value: number;
  readonly delta: number | null;
}

export interface TimeSeriesPointDto {
  readonly at: string;
  readonly value: number;
}

export interface ActivityEntryDto {
  readonly id: string;
  readonly actor: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly avatarUrl: string | null;
  };
  readonly action:
    | 'user.created'
    | 'user.updated'
    | 'user.blocked'
    | 'role.updated'
    | 'settings.changed';
  readonly target: string;
  readonly at: string;
}

export interface DashboardOverviewDto {
  readonly metrics: readonly StatMetricDto[];
  readonly signups: readonly TimeSeriesPointDto[];
  readonly activeUsers: readonly TimeSeriesPointDto[];
  readonly recentUsers: readonly UserDto[];
  readonly activity: readonly ActivityEntryDto[];
}

export interface PageMetaDto {
  readonly total: number;
  readonly page: number;
  readonly size: number;
}

/** Re-export branded helpers used by mappers for typing clarity. */
export type { IsoDateTime, RoleId, UserId };
