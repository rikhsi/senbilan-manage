import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
  type QueryClientConfig,
} from '@tanstack/angular-query-experimental';

const TEST_DEFAULTS: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
};

/** Creates an isolated QueryClient suitable for a single test case. */
export const createTestQueryClient = (config: QueryClientConfig = {}): QueryClient =>
  new QueryClient({
    ...TEST_DEFAULTS,
    ...config,
    defaultOptions: {
      queries: {
        ...TEST_DEFAULTS.defaultOptions?.queries,
        ...config.defaultOptions?.queries,
      },
      mutations: {
        ...TEST_DEFAULTS.defaultOptions?.mutations,
        ...config.defaultOptions?.mutations,
      },
    },
  });

/** Environment providers for TanStack Query in Angular TestBed / render helpers. */
export const provideTestQueryClient = (config?: QueryClientConfig): EnvironmentProviders =>
  makeEnvironmentProviders([...provideTanStackQuery(createTestQueryClient(config))]);
