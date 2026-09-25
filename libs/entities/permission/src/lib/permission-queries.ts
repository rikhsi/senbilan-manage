import { inject, Injectable } from '@angular/core';
import { PermissionRepository } from '@senbilan/core/application';

export const permissionQueryKeys = {
  all: ['permissions'] as const,
  list: () => [...permissionQueryKeys.all, 'list'] as const,
};

@Injectable({ providedIn: 'root' })
export class PermissionQueries {
  private readonly permissions = inject(PermissionRepository);

  listOptions() {
    return {
      queryKey: permissionQueryKeys.list(),
      queryFn: ({ signal }: { signal: AbortSignal }) => this.permissions.findAll(signal),
    };
  }
}
