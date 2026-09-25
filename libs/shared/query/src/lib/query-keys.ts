/**
 * Hierarchical query-key factory. Keeps cache keys consistent across features.
 *
 * ```ts
 * const usersKeys = createQueryKeys('users', {
 *   list: (filters: UserFilters) => [filters] as const,
 *   detail: (id: string) => [id] as const,
 * });
 * usersKeys.all           // ['users']
 * usersKeys.lists()       // ['users', 'list']
 * usersKeys.list(f)       // ['users', 'list', f]
 * usersKeys.details()     // ['users', 'detail']
 * usersKeys.detail(id)    // ['users', 'detail', id]
 * ```
 */
export type QueryKeyFactory<
  TDefs extends Record<string, (...args: never[]) => readonly unknown[]>,
> = {
  readonly all: readonly [string];
} & {
  readonly [K in keyof TDefs]: TDefs[K] extends (...args: infer TArgs) => infer TRest
    ? (...args: TArgs) => readonly [string, K & string, ...Extract<TRest, readonly unknown[]>]
    : never;
} & {
  readonly [K in keyof TDefs as `${K & string}s`]: () => readonly [string, K & string];
};

export const createQueryKeys = <
  const TScope extends string,
  const TDefs extends Record<string, (...args: never[]) => readonly unknown[]>,
>(
  scope: TScope,
  definitions: TDefs,
): QueryKeyFactory<TDefs> => {
  const factory: Record<string, unknown> = {
    all: [scope] as const,
  };

  for (const key of Object.keys(definitions) as (keyof TDefs & string)[]) {
    const def = definitions[key];
    if (def === undefined) {
      continue;
    }
    factory[`${key}s`] = (): readonly [string, string] => [scope, key] as const;
    factory[key] = (...args: never[]): readonly unknown[] => [scope, key, ...def(...args)];
  }

  return factory as QueryKeyFactory<TDefs>;
};

/** Shared root keys for cross-feature invalidation. */
export const queryKeys = {
  root: ['senbilan'] as const,
  session: ['senbilan', 'session'] as const,
  users: createQueryKeys('users', {
    list: (filters: unknown) => [filters] as const,
    detail: (id: string) => [id] as const,
  }),
  roles: createQueryKeys('roles', {
    list: (filters: unknown) => [filters] as const,
    detail: (id: string) => [id] as const,
  }),
  permissions: createQueryKeys('permissions', {
    list: () => [] as const,
  }),
  notifications: createQueryKeys('notifications', {
    list: (filters: unknown) => [filters] as const,
  }),
  dashboard: createQueryKeys('dashboard', {
    overview: () => [] as const,
  }),
} as const;
