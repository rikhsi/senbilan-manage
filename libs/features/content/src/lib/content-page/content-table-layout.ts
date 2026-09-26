import { sessionColumnLayout } from '@senbilan/shared/util';
import { CONTENT_COLUMNS_KEY, CONTENT_DEFAULT_HIDDEN_COLUMNS } from './content-page.model';

export const contentTableLayout = () =>
  sessionColumnLayout({
    id: 'content',
    labelKey: 'nav.content',
    storageKey: CONTENT_COLUMNS_KEY,
    defaultHidden: CONTENT_DEFAULT_HIDDEN_COLUMNS,
    columns: [
      { key: 'title', labelKey: 'content.name', hideable: false },
      { key: 'kind', labelKey: 'content.kind', hideable: true },
      { key: 'status', labelKey: 'content.status', hideable: true },
      { key: 'language', labelKey: 'content.language', hideable: true },
      { key: 'updatedAt', labelKey: 'content.updatedAt', hideable: true },
      { key: 'id', labelKey: 'content.id', hideable: true },
      { key: 'description', labelKey: 'content.description', hideable: true },
      { key: 'tags', labelKey: 'content.tags', hideable: true },
      { key: 'url', labelKey: 'content.url', hideable: true },
      { key: 'unitCount', labelKey: 'content.unitCount', hideable: true },
      { key: 'publishedAt', labelKey: 'content.publishedAt', hideable: true },
      { key: 'createdAt', labelKey: 'content.createdAt', hideable: true },
      { key: 'createdBy', labelKey: 'content.createdBy', hideable: true },
      { key: 'updatedBy', labelKey: 'content.updatedBy', hideable: true },
      { key: 'coverUrl', labelKey: 'content.coverUrl', hideable: true },
      { key: 'coverMediaId', labelKey: 'content.coverMediaId', hideable: true },
    ],
  });
