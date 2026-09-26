import { type Permission } from '@senbilan/core/domain';

export interface PermissionMatrixGroup {
  readonly resource: string;
  readonly label: string;
  readonly permissions: readonly (Permission & { readonly label: string })[];
}
