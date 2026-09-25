/**
 * Runtime assertion that narrows the type and throws when the condition fails.
 * Prefer for programmer errors (broken invariants), not user-facing validation.
 */
export function invariant(condition: unknown, message = 'Invariant violated'): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
