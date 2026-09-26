export interface MediaListFilters {
  readonly ownerId: string;
  readonly coupleId: string;
  readonly purpose: string;
  readonly status: string;
}

export const EMPTY_MEDIA_FILTERS: MediaListFilters = {
  ownerId: '',
  coupleId: '',
  purpose: '',
  status: '',
};

export const MEDIA_COLUMNS_KEY = 'senbilan.media.columns';
export const MEDIA_COLUMN_KEYS = new Set(['purpose', 'contentType', 'status', 'size', 'createdAt']);
export const MEDIA_HIDEABLE_COLUMNS = new Set(['contentType', 'status', 'size', 'createdAt']);

export type CatalogStatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export const mediaStatusLabelKey = (status: string): string | null => {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes('ready')) {
    return 'media.statusReady';
  }
  if (normalized.includes('pending')) {
    return 'media.statusPending';
  }
  return null;
};

export const mediaStatusTone = (status: string): CatalogStatusTone => {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes('ready')) {
    return 'success';
  }
  if (normalized.includes('pending')) {
    return 'warning';
  }
  return 'neutral';
};
