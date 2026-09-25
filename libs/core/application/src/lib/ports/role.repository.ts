import { type PermissionKey, type Role, type RoleId } from '@senbilan/core/domain';

export interface CreateRoleData {
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly PermissionKey[];
}

export interface UpdateRoleData {
  readonly name?: string;
  readonly description?: string;
  readonly permissions?: readonly PermissionKey[];
}

export abstract class RoleRepository {
  abstract findAll(signal?: AbortSignal): Promise<readonly Role[]>;
  abstract findById(id: RoleId, signal?: AbortSignal): Promise<Role | null>;
  abstract create(data: CreateRoleData): Promise<Role>;
  abstract update(id: RoleId, data: UpdateRoleData): Promise<Role>;
  abstract delete(id: RoleId): Promise<void>;
}
