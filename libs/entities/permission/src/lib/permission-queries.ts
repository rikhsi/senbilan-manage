import { inject, Injectable } from '@angular/core';
import { PermissionRepository } from '@senbilan/core/application';
import { queryKeys } from '@senbilan/shared/query';
import { queryOptions } from '@tanstack/angular-query-experimental';

export const permissionQueryKeys = queryKeys.permissions;

@Injectable({ providedIn: 'root' })
export class PermissionQueries {
  private readonly permissions = inject(PermissionRepository);

  listOptions() {
    return queryOptions({
      queryKey: permissionQueryKeys.list(),
      queryFn: ({ signal }) => this.permissions.findAll(signal),
    });
  }
}
