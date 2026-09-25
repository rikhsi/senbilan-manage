import { inject, Injectable } from '@angular/core';
import { type UserListRequest, UserRepository } from '@senbilan/core/application';
import { type UserId } from '@senbilan/core/domain';

export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (request: UserListRequest) => [...userQueryKeys.lists(), request] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: UserId) => [...userQueryKeys.details(), id] as const,
};

/**
 * Entity-level query factory. Features bind these options to TanStack Query
 * once `@senbilan/shared/query` lands.
 */
@Injectable({ providedIn: 'root' })
export class UserQueries {
  private readonly users = inject(UserRepository);

  listOptions(request: UserListRequest) {
    return {
      queryKey: userQueryKeys.list(request),
      queryFn: ({ signal }: { signal: AbortSignal }) => this.users.findPage(request, signal),
    };
  }

  detailOptions(id: UserId) {
    return {
      queryKey: userQueryKeys.detail(id),
      queryFn: ({ signal }: { signal: AbortSignal }) => this.users.findById(id, signal),
    };
  }
}
