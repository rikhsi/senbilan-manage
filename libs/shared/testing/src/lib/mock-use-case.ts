import { vi, type Mock } from 'vitest';

/** Minimal use-case shape used across `core/application`. */
export interface UseCaseLike<TInput = void, TOutput = unknown> {
  execute(input: TInput, signal?: AbortSignal): Promise<TOutput>;
}

export interface MockUseCase<TInput, TOutput> extends UseCaseLike<TInput, TOutput> {
  readonly execute: Mock<(input: TInput, signal?: AbortSignal) => Promise<TOutput>>;
  readonly calls: readonly TInput[];
  reset(): void;
}

/**
 * Vitest spy shaped like an application use case (`execute`).
 * Records inputs for assertions without standing up DI.
 */
export const createMockUseCase = <TInput = void, TOutput = unknown>(
  impl?: (input: TInput, signal?: AbortSignal) => TOutput | Promise<TOutput>,
): MockUseCase<TInput, TOutput> => {
  const recorded: TInput[] = [];
  const execute = vi.fn(async (input: TInput, signal?: AbortSignal): Promise<TOutput> => {
    recorded.push(input);
    if (impl) {
      return await impl(input, signal);
    }
    return undefined as TOutput;
  });

  return {
    execute,
    get calls() {
      return recorded;
    },
    reset(): void {
      recorded.length = 0;
      execute.mockClear();
    },
  };
};
