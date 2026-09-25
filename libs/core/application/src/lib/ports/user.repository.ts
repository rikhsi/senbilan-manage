import {
  type Email,
  type RoleId,
  type User,
  type UserId,
  type UserStatus,
  type UserWithRoles,
} from '@senbilan/core/domain';
import { type Page, type PageRequest } from '../contracts/pagination';

export interface UserListFilter {
  readonly status?: readonly UserStatus[];
  readonly roleIds?: readonly RoleId[];
}

export type UserSortField = 'firstName' | 'lastName' | 'email' | 'status' | 'createdAt' | 'lastActiveAt';

export type UserListRequest = PageRequest<UserListFilter, UserSortField>;

export interface CreateUserData {
  readonly email: Email;
  readonly firstName: string;
  readonly lastName: string;
  readonly roleIds: readonly RoleId[];
}

export interface UpdateUserData {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly roleIds?: readonly RoleId[];
  readonly avatarUrl?: string | null;
}

/**
 * Port. Implemented by infrastructure (HTTP, mock). The `signal` parameter
 * lets callers cancel in-flight requests without knowing the transport.
 */
export abstract class UserRepository {
  abstract findPage(request: UserListRequest, signal?: AbortSignal): Promise<Page<User>>;
  abstract findById(id: UserId, signal?: AbortSignal): Promise<UserWithRoles | null>;
  abstract create(data: CreateUserData): Promise<User>;
  abstract update(id: UserId, data: UpdateUserData): Promise<User>;
  abstract setStatus(id: UserId, status: UserStatus): Promise<User>;
  abstract deleteMany(ids: readonly UserId[]): Promise<void>;
}
