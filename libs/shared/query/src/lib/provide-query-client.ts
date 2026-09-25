import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
  type QueryClientConfig,
} from '@tanstack/angular-query-experimental';

const DEFAULT_QUERY_CLIENT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
};

/**
 * Registers TanStack Angular Query with admin-friendly defaults
 * (30s staleTime, single retry).
 */
export const provideQueryClient = (config: QueryClientConfig = {}): EnvironmentProviders => {
  const merged: QueryClientConfig = {
    ...DEFAULT_QUERY_CLIENT_CONFIG,
    ...config,
    defaultOptions: {
      queries: {
        ...DEFAULT_QUERY_CLIENT_CONFIG.defaultOptions?.queries,
        ...config.defaultOptions?.queries,
      },
      mutations: {
        ...DEFAULT_QUERY_CLIENT_CONFIG.defaultOptions?.mutations,
        ...config.defaultOptions?.mutations,
      },
    },
  };

  return makeEnvironmentProviders([...provideTanStackQuery(new QueryClient(merged))]);
};
