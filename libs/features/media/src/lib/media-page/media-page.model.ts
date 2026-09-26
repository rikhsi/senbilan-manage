export interface MediaListFilters {
  readonly ownerId: string;
  readonly ownerLabel: string;
  readonly coupleId: string;
  readonly coupleLabel: string;
  readonly status: string;
}

export type MediaFilterChipId = 'ownerId' | 'coupleId' | 'status';

export const EMPTY_MEDIA_FILTERS: MediaListFilters = {
  ownerId: '',
  ownerLabel: '',
  coupleId: '',
  coupleLabel: '',
  status: '',
};

export const MEDIA_COLUMNS_KEY = 'senbilan.media.columns';
export const MEDIA_COLUMN_KEYS = new Set([
  'purpose',
  'contentType',
  'status',
  'size',
  'createdAt',
  'id',
  'owner',
  'couple',
  'width',
  'height',
]);
export const MEDIA_HIDEABLE_COLUMNS = new Set([
  'contentType',
  'status',
  'size',
  'createdAt',
  'id',
  'owner',
  'couple',
  'width',
  'height',
]);
export const MEDIA_DEFAULT_HIDDEN_COLUMNS = ['id', 'owner', 'couple', 'width', 'height'] as const;

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
