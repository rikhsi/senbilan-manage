import { type Permission } from '@senbilan/core/domain';

/** Permission with server-provided human description (localised server-side or by key). */
export interface PermissionDescriptor extends Permission {
  readonly description: string;
}

export abstract class PermissionRepository {
  abstract findAll(signal?: AbortSignal): Promise<readonly PermissionDescriptor[]>;
}
