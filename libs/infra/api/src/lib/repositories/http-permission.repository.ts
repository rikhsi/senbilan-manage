import { Injectable, inject } from '@angular/core';
import { PermissionRepository, type PermissionDescriptor } from '@senbilan/core/application';
import { ApiClient } from '../http/api-client';
import { type PermissionDescriptorDto } from '../dto/api.dto';
import { permissionDescriptorFromDto } from '../dto/mappers';

@Injectable()
export class HttpPermissionRepository extends PermissionRepository {
  private readonly api = inject(ApiClient);

  override findAll(signal?: AbortSignal): Promise<readonly PermissionDescriptor[]> {
    return this.api
      .get<PermissionDescriptorDto[]>('/permissions', signal !== undefined ? { signal } : undefined)
      .then((items) => items.map(permissionDescriptorFromDto));
  }
}
