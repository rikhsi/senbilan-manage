import { inject, Injectable } from '@angular/core';
import { RoleRepository } from '@senbilan/core/application';
import { type RoleId } from '@senbilan/core/domain';
import { queryKeys } from '@senbilan/shared/query';
import { queryOptions } from '@tanstack/angular-query-experimental';

export const roleQueryKeys = queryKeys.roles;

@Injectable({ providedIn: 'root' })
export class RoleQueries {
  private readonly roles = inject(RoleRepository);

  listOptions() {
    return queryOptions({
      queryKey: roleQueryKeys.list({}),
      queryFn: ({ signal }) => this.roles.findAll(signal),
    });
  }

  detailOptions(id: RoleId) {
    return queryOptions({
      queryKey: roleQueryKeys.detail(id),
      queryFn: ({ signal }) => this.roles.findById(id, signal),
    });
  }
}
