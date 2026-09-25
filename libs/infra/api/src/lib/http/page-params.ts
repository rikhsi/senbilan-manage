import { type PageRequest, type SortSpec } from '@senbilan/core/application';

/** Builds query params: `page`, `size`, `sort=field,asc`, `search`, `filter[k]=v`. */
export const toHttpParams = <TFilter extends object, TSort extends string>(
  request: PageRequest<TFilter, TSort>,
): Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> => {
  const params: Record<
    string,
    string | number | boolean | ReadonlyArray<string | number | boolean>
  > = {
    page: request.page,
    size: request.size,
  };

  if (request.search !== undefined && request.search.length > 0) {
    params['search'] = request.search;
  }

  if (request.sort !== undefined && request.sort.length > 0) {
    params['sort'] = request.sort.map(formatSort);
  }

  if (request.filter !== undefined) {
    for (const [key, value] of Object.entries(request.filter)) {
      if (value === undefined || value === null) {
        continue;
      }
      params[`filter[${key}]`] = Array.isArray(value)
        ? (value as ReadonlyArray<string | number | boolean>).map(String)
        : String(value);
    }
  }

  return params;
};

const formatSort = <TSort extends string>(spec: SortSpec<TSort>): string =>
  `${spec.field},${spec.direction}`;
