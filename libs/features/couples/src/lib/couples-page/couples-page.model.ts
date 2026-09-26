export interface CouplesListFilters {
  readonly status: string;
}

export const EMPTY_COUPLES_FILTERS: CouplesListFilters = { status: '' };

export const COUPLES_COLUMNS_KEY = 'senbilan.couples.columns';
export const COUPLES_COLUMN_KEYS = new Set(['creator', 'partner', 'status', 'createdAt']);
export const COUPLES_HIDEABLE_COLUMNS = new Set(['partner', 'status', 'createdAt']);

export type CatalogStatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export const coupleStatusLabelKey = (status: string): string | null => {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes('paired')) {
    return 'couples.statusPaired';
  }
  if (normalized.includes('wait')) {
    return 'couples.statusWaiting';
  }
  return null;
};

export const coupleStatusTone = (status: string): CatalogStatusTone => {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes('paired')) {
    return 'success';
  }
  if (normalized.includes('wait')) {
    return 'warning';
  }
  return 'neutral';
};
