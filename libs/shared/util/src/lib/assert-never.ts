/**
 * Exhaustiveness helper for `switch` / discriminated unions.
 * Place in the `default` branch so TypeScript errors when a case is missing.
 */
export const assertNever = (value: never, message = 'Unexpected value'): never => {
  throw new Error(`${message}: ${String(value)}`);
};
