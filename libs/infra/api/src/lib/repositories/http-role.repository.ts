import { Injectable, inject } from '@angular/core';
import {
  RoleRepository,
  type CreateRoleData,
  type UpdateRoleData,
} from '@senbilan/core/application';
import { type Role, type RoleId } from '@senbilan/core/domain';
import { ApiClient } from '../http/api-client';
import { type RoleDto } from '../dto/api.dto';
import { roleFromDto } from '../dto/mappers';

@Injectable()
export class HttpRoleRepository extends RoleRepository {
  private readonly api = inject(ApiClient);

  override findAll(signal?: AbortSignal): Promise<readonly Role[]> {
    return this.api
      .get<RoleDto[]>('/roles', signal !== undefined ? { signal } : undefined)
      .then((items) => items.map(roleFromDto));
  }

  override async findById(id: RoleId, signal?: AbortSignal): Promise<Role | null> {
    try {
      return roleFromDto(
        await this.api.get<RoleDto>(`/roles/${id}`, signal !== undefined ? { signal } : undefined),
      );
    } catch (error: unknown) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  override create(data: CreateRoleData): Promise<Role> {
    return this.api.post<RoleDto>('/roles', data).then(roleFromDto);
  }

  override update(id: RoleId, data: UpdateRoleData): Promise<Role> {
    return this.api.patch<RoleDto>(`/roles/${id}`, data).then(roleFromDto);
  }

  override delete(id: RoleId): Promise<void> {
    return this.api.delete<null>(`/roles/${id}`).then(() => undefined);
  }
}

const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === 'not-found';
