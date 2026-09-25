import { Injectable, inject } from '@angular/core';
import { PermissionRepository, type PermissionDescriptor } from '@senbilan/core/application';
import { MockDataStore } from '../mock-data.store';

@Injectable()
export class MockPermissionRepository extends PermissionRepository {
  private readonly store = inject(MockDataStore);

  override async findAll(_signal?: AbortSignal): Promise<readonly PermissionDescriptor[]> {
    return this.store.permissionDescriptors;
  }
}
