import { type Role, type User } from '@senbilan/core/domain';

export interface UserFormDrawerData {
  readonly mode: 'create' | 'edit';
  readonly user?: User;
  readonly roles: readonly Role[];
}

export interface UserFormDrawerResult {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly roleIds: readonly string[];
}
