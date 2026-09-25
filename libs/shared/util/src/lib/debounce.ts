/**
 * Returns a debounced wrapper around `fn`. The trailing call wins;
 * call `.cancel()` to drop a pending invocation (e.g. on destroy).
 */
export interface DebouncedFunction<TArgs extends readonly unknown[]> {
  (...args: TArgs): void;
  cancel(): void;
}

export const debounce = <TArgs extends readonly unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number,
): DebouncedFunction<TArgs> => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: TArgs): void => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, waitMs);
  };

  debounced.cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
};
