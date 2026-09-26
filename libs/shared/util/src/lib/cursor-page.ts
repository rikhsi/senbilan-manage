/**
 * Cursor for the page after `page` (1-based). Index 0 is always the first page.
 * A matching next cursor keeps later pages so the user can jump back to them.
 */
export const rememberNextCursor = (
  cursors: readonly (string | null)[],
  page: number,
  nextCursor: string | null,
): readonly (string | null)[] => {
  const known = cursors[page] ?? null;
  if (known === nextCursor) {
    return cursors;
  }
  const next = cursors.slice(0, page);
  if (nextCursor) {
    next[page] = nextCursor;
  }
  return next;
};
