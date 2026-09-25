import { type PermissionDescriptor, type PermissionRepository } from '../../ports/permission.repository';

export interface PermissionGroup {
  readonly resource: string;
  readonly permissions: readonly PermissionDescriptor[];
}

export class GetPermissionsUseCase {
  constructor(private readonly permissions: PermissionRepository) {}

  async execute(signal?: AbortSignal): Promise<readonly PermissionGroup[]> {
    const all = await this.permissions.findAll(signal);
    const byResource = new Map<string, PermissionDescriptor[]>();
    for (const permission of all) {
      const bucket = byResource.get(permission.resource) ?? [];
      bucket.push(permission);
      byResource.set(permission.resource, bucket);
    }
    return [...byResource.entries()].map(([resource, permissions]) => ({ resource, permissions }));
  }
}
