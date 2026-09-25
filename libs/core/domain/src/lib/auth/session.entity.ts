import { type PermissionKey } from '../permission/permission';
import { type IsoDateTime, type RoleId } from '../shared/identifiers';
import { type User } from '../user/user.entity';

/**
 * The authenticated principal as seen by the client. Permissions are already
 * flattened from roles by the server so authorisation checks are O(1).
 */
export interface Session {
  readonly user: User;
  readonly roleIds: readonly RoleId[];
  readonly permissions: ReadonlySet<PermissionKey>;
  readonly issuedAt: IsoDateTime;
  readonly expiresAt: IsoDateTime;
}

export const createSession = (input: {
  user: User;
  roleIds: readonly RoleId[];
  permissions: readonly PermissionKey[];
  issuedAt: IsoDateTime;
  expiresAt: IsoDateTime;
}): Session => ({
  user: input.user,
  roleIds: [...input.roleIds],
  permissions: new Set(input.permissions),
  issuedAt: input.issuedAt,
  expiresAt: input.expiresAt,
});

export const isSessionExpired = (session: Session, now: Date): boolean =>
  new Date(session.expiresAt).getTime() <= now.getTime();
