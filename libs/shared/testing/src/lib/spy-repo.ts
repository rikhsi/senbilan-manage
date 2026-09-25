import { vi, type Mock } from 'vitest';

type AnyFn = (...args: never[]) => unknown;

export type SpyRepo<T extends object> = {
  readonly [K in keyof T]: T[K] extends AnyFn ? Mock<T[K]> : T[K];
} & {
  reset(): void;
};

/**
 * Builds a partial repository/port spy. Unspecified methods throw so missing
 * stubs surface quickly in tests.
 */
export const createSpyRepo = <T extends object>(
  stubs: Partial<{ [K in keyof T]: T[K] }> = {},
): SpyRepo<T> => {
  const mocks: Record<string, Mock> = {};

  for (const [key, value] of Object.entries(stubs) as [string, unknown][]) {
    if (typeof value === 'function') {
      mocks[key] = vi.fn(value as AnyFn);
    }
  }

  const proxy = new Proxy(mocks, {
    get(target, prop, receiver) {
      if (prop === 'reset') {
        return (): void => {
          for (const mock of Object.values(target)) {
            mock.mockClear();
          }
        };
      }
      if (
        typeof prop === 'string' &&
        prop in stubs &&
        typeof stubs[prop as keyof T] !== 'function'
      ) {
        return stubs[prop as keyof T];
      }
      if (typeof prop === 'string' && !(prop in target)) {
        target[prop] = vi.fn((..._args: never[]) =>
          Promise.reject(new Error(`createSpyRepo: method "${prop}" was not stubbed`)),
        );
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  return proxy as unknown as SpyRepo<T>;
};
