import { Injectable, inject } from '@angular/core';
import {
  UserRepository,
  type CreateUserData,
  type Page,
  type UpdateUserData,
  type UserListRequest,
} from '@senbilan/core/application';
import { type User, type UserId, type UserStatus, type UserWithRoles } from '@senbilan/core/domain';
import { ApiClient } from '../http/api-client';
import { type PageMetaDto, type RoleDto, type UserDto } from '../dto/api.dto';
import { userFromDto, userWithRolesFromDto } from '../dto/mappers';
import { toHttpParams } from '../http/page-params';

interface UserDetailDto {
  readonly user: UserDto;
  readonly roles: readonly RoleDto[];
}

@Injectable()
export class HttpUserRepository extends UserRepository {
  private readonly api = inject(ApiClient);

  override async findPage(request: UserListRequest, signal?: AbortSignal): Promise<Page<User>> {
    const envelope = await this.api.getEnvelope<UserDto[]>('/users', {
      params: toHttpParams(request),
      ...(signal !== undefined ? { signal } : {}),
    });
    const meta = envelope.meta as PageMetaDto | undefined;
    return {
      items: envelope.data.map(userFromDto),
      total: meta?.total ?? envelope.data.length,
      page: meta?.page ?? request.page,
      size: meta?.size ?? request.size,
    };
  }

  override async findById(id: UserId, signal?: AbortSignal): Promise<UserWithRoles | null> {
    try {
      const dto = await this.api.get<UserDetailDto>(
        `/users/${id}`,
        signal !== undefined ? { signal } : undefined,
      );
      return userWithRolesFromDto(dto.user, dto.roles);
    } catch (error: unknown) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  override create(data: CreateUserData): Promise<User> {
    return this.api
      .post<UserDto>('/users', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roleIds: data.roleIds,
      })
      .then(userFromDto);
  }

  override update(id: UserId, data: UpdateUserData): Promise<User> {
    return this.api.patch<UserDto>(`/users/${id}`, data).then(userFromDto);
  }

  override setStatus(id: UserId, status: UserStatus): Promise<User> {
    return this.api.patch<UserDto>(`/users/${id}/status`, { status }).then(userFromDto);
  }

  override deleteMany(ids: readonly UserId[]): Promise<void> {
    return this.api.post<null>('/users/delete', { ids }).then(() => undefined);
  }
}

const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === 'not-found';
