export interface ContentListFilters {
  readonly status: string;
  readonly kind: string;
  readonly language: string;
}

export const EMPTY_CONTENT_FILTERS: ContentListFilters = { status: '', kind: '', language: '' };

export const CONTENT_COLUMNS_KEY = 'senbilan.content.columns';
export const CONTENT_COLUMN_KEYS = new Set(['title', 'kind', 'status', 'language', 'updatedAt']);
export const CONTENT_HIDEABLE_COLUMNS = new Set(['kind', 'status', 'language', 'updatedAt']);

export const contentKindLabelKey = (kind: string): string | null => {
  const normalized = kind.trim().toUpperCase();
  if (normalized.includes('ARTICLE')) {
    return 'content.kindArticle';
  }
  if (normalized.includes('BOOK')) {
    return 'content.kindBook';
  }
  if (normalized.includes('PODCAST')) {
    return 'content.kindPodcast';
  }
  if (normalized.includes('VIDEO')) {
    return 'content.kindVideo';
  }
  return null;
};

export const contentLanguageLabelKey = (language: string): string | null => {
  const normalized = language.trim().toUpperCase();
  if (normalized.includes('UZ')) {
    return 'content.languageUz';
  }
  if (normalized.endsWith('_RU') || normalized === 'RU') {
    return 'content.languageRu';
  }
  return null;
};

export type CatalogStatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export const contentStatusLabelKey = (status: string): string | null => {
  const normalized = status.trim().toUpperCase();
  if (normalized.includes('PUBLISHED') && !normalized.includes('UNPUBLISHED')) {
    return 'content.statusPublished';
  }
  if (normalized.includes('UNPUBLISHED')) {
    return 'content.statusUnpublished';
  }
  if (normalized.includes('DRAFT')) {
    return 'content.statusDraft';
  }
  return null;
};

export const contentStatusTone = (status: string): CatalogStatusTone => {
  const normalized = status.trim().toUpperCase();
  if (normalized.includes('PUBLISHED') && !normalized.includes('UNPUBLISHED')) {
    return 'success';
  }
  if (normalized.includes('DRAFT')) {
    return 'warning';
  }
  return 'neutral';
};
