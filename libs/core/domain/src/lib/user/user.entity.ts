import { type Role } from '../role/role.entity';
import { type IsoDateTime, type RoleId, type UserId } from '../shared/identifiers';
import { err, ok, type Result } from '../shared/result';
import { type Email } from './email.value-object';
import { UserNameInvalidError, UserStatusTransitionError } from './user.errors';

export const USER_STATUSES = ['active', 'invited', 'blocked'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface User {
  readonly id: UserId;
  readonly email: Email;
  readonly firstName: string;
  readonly lastName: string;
  readonly avatarUrl: string | null;
  readonly status: UserStatus;
  readonly roleIds: readonly RoleId[];
  readonly lastActiveAt: IsoDateTime | null;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

/** Aggregate view used by detail screens: the user plus their resolved roles. */
export interface UserWithRoles extends User {
  readonly roles: readonly Role[];
}

export const USER_NAME_MIN_LENGTH = 1;
export const USER_NAME_MAX_LENGTH = 60;

export const fullName = (user: Pick<User, 'firstName' | 'lastName'>): string =>
  `${user.firstName} ${user.lastName}`.trim();

export const initials = (user: Pick<User, 'firstName' | 'lastName'>): string =>
  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

export const validateUserName = (
  value: string,
  field: 'firstName' | 'lastName',
): Result<string, UserNameInvalidError> => {
  const trimmed = value.trim();
  if (trimmed.length < USER_NAME_MIN_LENGTH || trimmed.length > USER_NAME_MAX_LENGTH) {
    return err(new UserNameInvalidError(field));
  }
  return ok(trimmed);
};

/**
 * Allowed status transitions. `invited` users become `active` on first login
 * (server side), admins may block/unblock active users, blocked users cannot
 * be re-invited.
 */
const STATUS_TRANSITIONS: Readonly<Record<UserStatus, readonly UserStatus[]>> = {
  invited: ['active', 'blocked'],
  active: ['blocked'],
  blocked: ['active'],
};

export const canTransitionUserStatus = (from: UserStatus, to: UserStatus): boolean =>
  STATUS_TRANSITIONS[from].includes(to);

export const transitionUserStatus = (
  user: User,
  to: UserStatus,
): Result<User, UserStatusTransitionError> =>
  canTransitionUserStatus(user.status, to)
    ? ok({ ...user, status: to })
    : err(new UserStatusTransitionError(user.status, to));

export const userHasRole = (user: User, roleId: RoleId): boolean => user.roleIds.includes(roleId);
