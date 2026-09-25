import { inject, Injectable } from '@angular/core';
import {
  CreateUserUseCase,
  DeleteUsersUseCase,
  GetUserUseCase,
  GetUsersUseCase,
  type Page,
  type UserFormInput,
  type UserListRequest,
  UserRepository,
  UpdateUserUseCase,
} from '@senbilan/core/application';
import { type User, type UserId } from '@senbilan/core/domain';
import { queryKeys } from '@senbilan/shared/query';
import {
  injectMutation,
  injectQueryClient,
  queryOptions,
} from '@tanstack/angular-query-experimental';

/** Hierarchical keys — aligned with {@link queryKeys.users}. */
export const userQueryKeys = queryKeys.users;

/**
 * Entity-level TanStack Query option factories.
 * Features bind these with `injectQuery(() => userQueries.listOptions(...))`.
 */
@Injectable({ providedIn: 'root' })
export class UserQueries {
  private readonly users = inject(UserRepository);
  private readonly getUsers = new GetUsersUseCase(this.users);
  private readonly getUser = new GetUserUseCase(this.users);

  listOptions(request: UserListRequest) {
    return queryOptions({
      queryKey: userQueryKeys.list(request),
      queryFn: ({ signal }) => this.getUsers.execute(request, signal),
    });
  }

  detailOptions(id: UserId) {
    return queryOptions({
      queryKey: userQueryKeys.detail(id),
      queryFn: ({ signal }) => this.getUser.execute(id, signal),
    });
  }
}

/** Mutations that invalidate user list/detail caches (with optimistic delete). */
@Injectable({ providedIn: 'root' })
export class UserMutations {
  private readonly users = inject(UserRepository);
  private readonly queryClient = injectQueryClient();

  readonly create = injectMutation(() => ({
    mutationFn: (data: UserFormInput) => new CreateUserUseCase(this.users).execute(data),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  }));

  readonly update = injectMutation(() => ({
    mutationFn: ({ id, data }: { id: UserId; data: UserFormInput }) =>
      new UpdateUserUseCase(this.users).execute(id, data),
    onMutate: async ({ id, data }) => {
      await this.queryClient.cancelQueries({ queryKey: userQueryKeys.detail(id) });
      const previous = this.queryClient.getQueryData(userQueryKeys.detail(id));
      this.queryClient.setQueryData(userQueryKeys.detail(id), (current: unknown) => {
        if (!current || typeof current !== 'object') {
          return current;
        }
        return { ...current, ...data, id };
      });
      return { previous, id };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        this.queryClient.setQueryData(userQueryKeys.detail(context.id), context.previous);
      }
    },
    onSettled: async (_data, _error, variables) => {
      await this.queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      await this.queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(variables.id) });
    },
  }));

  readonly deleteMany = injectMutation(() => ({
    mutationFn: ({ ids, actorId }: { ids: readonly UserId[]; actorId: UserId }) =>
      new DeleteUsersUseCase(this.users).execute(ids, actorId),
    onMutate: async ({ ids }) => {
      await this.queryClient.cancelQueries({ queryKey: userQueryKeys.lists() });
      const idSet = new Set<string>(ids);
      const previous = this.queryClient.getQueriesData<Page<User>>({
        queryKey: userQueryKeys.lists(),
      });
      this.queryClient.setQueriesData<Page<User>>({ queryKey: userQueryKeys.lists() }, (page) => {
        if (!page) {
          return page;
        }
        const items = page.items.filter((user) => !idSet.has(user.id));
        return {
          ...page,
          items,
          total: Math.max(0, page.total - (page.items.length - items.length)),
        };
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (!context?.previous) {
        return;
      }
      for (const [key, data] of context.previous) {
        this.queryClient.setQueryData(key, data);
      }
    },
    onSettled: async () => {
      await this.queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  }));
}
