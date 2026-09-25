declare const brandSymbol: unique symbol;

/**
 * Nominal typing helper. `Brand<string, 'UserId'>` is assignable to `string`
 * but a plain `string` is not assignable to it without going through a factory.
 */
export type Brand<T, TBrand extends string> = T & { readonly [brandSymbol]: TBrand };
