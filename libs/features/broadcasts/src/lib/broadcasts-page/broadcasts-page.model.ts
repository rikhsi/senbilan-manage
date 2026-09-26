export const BROADCASTS_COLUMNS_KEY = 'senbilan.broadcasts.columns';
export const BROADCASTS_COLUMN_KEYS = new Set(['title', 'status', 'createdAt', 'sentAt']);
export const BROADCASTS_HIDEABLE_COLUMNS = new Set(['status', 'createdAt', 'sentAt']);

export type CatalogStatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export const broadcastStatusLabelKey = (status: string): string | null => {
  const normalized = status.trim().toUpperCase();
  if (normalized.includes('SENDING')) {
    return 'broadcasts.statusSending';
  }
  if (normalized.includes('SENT')) {
    return 'broadcasts.statusSent';
  }
  if (normalized.includes('QUEUED')) {
    return 'broadcasts.statusQueued';
  }
  if (normalized.includes('DRAFT')) {
    return 'broadcasts.statusDraft';
  }
  return null;
};

export const broadcastStatusTone = (status: string): CatalogStatusTone => {
  const normalized = status.trim().toUpperCase();
  if (normalized.includes('SENT') && !normalized.includes('SENDING')) {
    return 'success';
  }
  if (
    normalized.includes('DRAFT') ||
    normalized.includes('QUEUED') ||
    normalized.includes('SENDING')
  ) {
    return 'warning';
  }
  return 'neutral';
};
