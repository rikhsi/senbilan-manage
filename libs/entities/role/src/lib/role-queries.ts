import { inject, Injectable } from '@angular/core';
import { RoleRepository } from '@senbilan/core/application';
import { type RoleId } from '@senbilan/core/domain';

export const roleQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...roleQueryKeys.all, 'list'] as const,
  list: () => [...roleQueryKeys.lists()] as const,
  details: () => [...roleQueryKeys.all, 'detail'] as const,
  detail: (id: RoleId) => [...roleQueryKeys.details(), id] as const,
};

@Injectable({ providedIn: 'root' })
export class RoleQueries {
  private readonly roles = inject(RoleRepository);

  listOptions() {
    return {
      queryKey: roleQueryKeys.list(),
      queryFn: ({ signal }: { signal: AbortSignal }) => this.roles.findAll(signal),
    };
  }

  detailOptions(id: RoleId) {
    return {
      queryKey: roleQueryKeys.detail(id),
      queryFn: ({ signal }: { signal: AbortSignal }) => this.roles.findById(id, signal),
    };
  }
}
