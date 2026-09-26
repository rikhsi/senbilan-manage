import {
  type AdminContentDetail,
  type AdminContentUnitInput,
  type AdminCreateContentInput,
  type AdminUpdateContentInput,
} from '@senbilan/core/application';

export interface ContentUnitDraft {
  readonly title: string;
  readonly body: string;
  readonly url: string;
  /** 1-based server index when loaded from API; omitted for new units. */
  readonly serverIndex?: number;
}

export interface ContentFormDraft {
  readonly kind: string;
  readonly title: string;
  readonly description: string;
  readonly language: string;
  readonly tags: readonly string[];
  readonly url: string;
  readonly coverMediaId: string;
  readonly units: readonly ContentUnitDraft[];
}

export type ContentFormStep = 'basics' | 'details' | 'units';

export const CONTENT_FORM_STEPS_CREATE: readonly ContentFormStep[] = ['basics', 'details', 'units'];

export const CONTENT_FORM_STEPS_EDIT: readonly ContentFormStep[] = ['basics', 'details', 'units'];

export const EMPTY_CONTENT_UNIT: ContentUnitDraft = { title: '', body: '', url: '' };

export const EMPTY_CONTENT_FORM: ContentFormDraft = {
  kind: 'CONTENT_KIND_ARTICLE',
  title: '',
  description: '',
  language: 'LANGUAGE_RU',
  tags: [],
  url: '',
  coverMediaId: '',
  units: [],
};

export const CONTENT_TAG_MAX_LENGTH = 30;
export const CONTENT_TAG_MAX_COUNT = 10;

/** Book / podcast / video need a public URL and a cover media id. */
export const contentKindRequiresLinkAndCover = (kind: string): boolean => {
  switch (kind) {
    case 'CONTENT_KIND_BOOK':
    case 'CONTENT_KIND_PODCAST':
    case 'CONTENT_KIND_VIDEO':
      return true;
    default:
      return false;
  }
};

/**
 * CreateContent / UnitInput accept only http(s) URLs (swagger).
 * Empty is allowed for optional fields; anything else must be a real http(s) link.
 */
export const isHttpUrl = (raw: string): boolean => {
  const value = raw.trim();
  if (!/^https?:\/\//i.test(value)) {
    return false;
  }
  try {
    const parsed = new URL(value);
    // URL.protocol is the scheme plus a colon, not user-facing copy.
    // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- protocol tokens
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.trim().toLocaleLowerCase();
    if (host.length === 0) {
      return false;
    }
    if (host === 'localhost') {
      return true;
    }
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
      return true;
    }
    // Require a real domain (example.com), not a bare word.
    return host.includes('.') && !host.startsWith('.') && !host.endsWith('.');
  } catch {
    return false;
  }
};

/** Normalize optional URL for the API — empty or invalid becomes omitted (`''`). */
export const normalizeOptionalHttpUrl = (raw: string): string => {
  const value = raw.trim();
  return isHttpUrl(value) ? value : '';
};

/** True when rich-text HTML has no visible text (empty TinyMCE / placeholder markup). */
export const isEmptyRichText = (raw: string): boolean => {
  const text = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length === 0;
};

export interface ContentUnitFieldErrors {
  readonly title: string;
  readonly body: string;
  readonly url: string;
}

/** Per-unit field errors. Empty strings mean valid. */
export const contentUnitFieldErrors = (
  unit: ContentUnitDraft,
  messages: {
    readonly title: string;
    readonly body: string;
    readonly httpUrl: string;
  },
): ContentUnitFieldErrors => {
  const url = unit.url.trim();
  return {
    title: unit.title.trim().length === 0 ? messages.title : '',
    body: isEmptyRichText(unit.body) ? messages.body : '',
    url: url.length > 0 && !isHttpUrl(url) ? messages.httpUrl : '',
  };
};

export const contentUnitHasErrors = (errors: ContentUnitFieldErrors): boolean =>
  errors.title.length > 0 || errors.body.length > 0 || errors.url.length > 0;

/** Normalize a single tag for the API (lowercase, trimmed, 1–30 chars). */
export const normalizeContentTag = (raw: string): string | null => {
  const tag = raw.trim().toLocaleLowerCase();
  if (tag.length === 0 || tag.length > CONTENT_TAG_MAX_LENGTH) {
    return null;
  }
  return tag;
};

export const draftFromContent = (item: AdminContentDetail): ContentFormDraft => ({
  kind: item.kind || 'CONTENT_KIND_ARTICLE',
  title: item.title,
  description: item.description,
  language: item.language || 'LANGUAGE_RU',
  tags: item.tags
    .map((tag) => normalizeContentTag(tag))
    .filter((tag): tag is string => tag !== null)
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, CONTENT_TAG_MAX_COUNT),
  url: item.url,
  coverMediaId: item.coverMediaId ?? '',
  units: item.units.map((unit) => ({
    title: unit.title,
    body: unit.body,
    url: unit.url,
    serverIndex: unit.index,
  })),
});

export const toCreateContentInput = (draft: ContentFormDraft): AdminCreateContentInput => ({
  kind: draft.kind,
  title: draft.title.trim(),
  description: draft.description.trim(),
  language: draft.language,
  tags: draft.tags.slice(0, CONTENT_TAG_MAX_COUNT),
  url: normalizeOptionalHttpUrl(draft.url),
  coverMediaId: draft.coverMediaId.trim(),
  units: draft.units
    .map((unit) => ({
      title: unit.title.trim(),
      body: unit.body.trim(),
      url: normalizeOptionalHttpUrl(unit.url),
    }))
    .filter((unit) => unit.title.length > 0 && !isEmptyRichText(unit.body)),
});

export const toUpdateContentInput = (draft: ContentFormDraft): AdminUpdateContentInput => ({
  title: draft.title.trim(),
  description: draft.description.trim(),
  language: draft.language,
  tags: draft.tags.slice(0, CONTENT_TAG_MAX_COUNT),
  updateTags: true,
  url: normalizeOptionalHttpUrl(draft.url),
  coverMediaId: draft.coverMediaId.trim(),
});

export const toUnitInput = (draft: ContentUnitDraft): AdminContentUnitInput => ({
  title: draft.title.trim(),
  body: draft.body.trim(),
  url: normalizeOptionalHttpUrl(draft.url),
});

export const isContentDraft = (status: string): boolean =>
  status.trim().toUpperCase().includes('DRAFT');

export const isContentPublished = (status: string): boolean => {
  const normalized = status.trim().toUpperCase();
  return normalized.includes('PUBLISHED') && !normalized.includes('UNPUBLISHED');
};

/** Delete is only allowed for content that was never published. */
export const canDeleteContent = (item: {
  readonly status: string;
  readonly publishedAt: string | null;
}): boolean => isContentDraft(item.status) && !item.publishedAt;
