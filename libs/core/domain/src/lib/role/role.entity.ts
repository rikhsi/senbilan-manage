import { type PermissionKey } from '../permission/permission';
import { type IsoDateTime, type RoleId } from '../shared/identifiers';
import { err, ok, type Result } from '../shared/result';
import { RoleNameInvalidError, SystemRoleImmutableError } from './role.errors';

export interface Role {
  readonly id: RoleId;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly PermissionKey[];
  /** System roles (e.g. Owner) cannot be deleted or stripped of critical permissions. */
  readonly isSystem: boolean;
  readonly usersCount: number;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export const ROLE_NAME_MIN_LENGTH = 2;
export const ROLE_NAME_MAX_LENGTH = 40;

export const validateRoleName = (name: string): Result<string, RoleNameInvalidError> => {
  const trimmed = name.trim();
  if (trimmed.length < ROLE_NAME_MIN_LENGTH || trimmed.length > ROLE_NAME_MAX_LENGTH) {
    return err(new RoleNameInvalidError(name));
  }
  return ok(trimmed);
};

export const roleHasPermission = (role: Role, permission: PermissionKey): boolean =>
  role.permissions.includes(permission);

/**
 * Returns the role with permissions replaced. System roles may only *gain*
 * permissions — removing any is a violated invariant.
 */
export const withRolePermissions = (
  role: Role,
  permissions: readonly PermissionKey[],
): Result<Role, SystemRoleImmutableError> => {
  if (role.isSystem) {
    const removed = role.permissions.filter((p) => !permissions.includes(p));
    if (removed.length > 0) {
      return err(new SystemRoleImmutableError(role.id));
    }
  }
  const unique = [...new Set(permissions)];
  return ok({ ...role, permissions: unique });
};
