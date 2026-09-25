/**
 * Permission catalogue. Keys follow `<resource>:<action>`.
 * Adding a permission here is a domain change: the backend must know it too.
 */
export const PERMISSION_KEYS = [
  'dashboard:read',
  'users:read',
  'users:write',
  'users:delete',
  'roles:read',
  'roles:write',
  'permissions:read',
  'notifications:read',
  'settings:read',
  'settings:write',
  'profile:write',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionResource = PermissionKey extends `${infer R}:${string}` ? R : never;
export type PermissionAction = PermissionKey extends `${string}:${infer A}` ? A : never;

export interface Permission {
  readonly key: PermissionKey;
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
  /** Permissions in the same group are shown together in the matrix UI. */
  readonly group: PermissionResource;
}

const permissionSet: ReadonlySet<string> = new Set(PERMISSION_KEYS);

export const isPermissionKey = (value: string): value is PermissionKey => permissionSet.has(value);

export const parsePermission = (key: PermissionKey): Permission => {
  const [resource, action] = key.split(':') as [PermissionResource, PermissionAction];
  return { key, resource, action, group: resource };
};

export const ALL_PERMISSIONS: readonly Permission[] = PERMISSION_KEYS.map(parsePermission);
