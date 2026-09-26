import { sessionColumnLayout } from '@senbilan/shared/util';
import { BROADCASTS_COLUMNS_KEY, BROADCASTS_DEFAULT_HIDDEN_COLUMNS } from './broadcasts-page.model';

export const broadcastsTableLayout = () =>
  sessionColumnLayout({
    id: 'broadcasts',
    labelKey: 'nav.broadcasts',
    storageKey: BROADCASTS_COLUMNS_KEY,
    defaultHidden: BROADCASTS_DEFAULT_HIDDEN_COLUMNS,
    columns: [
      { key: 'title', labelKey: 'broadcasts.name', hideable: false },
      { key: 'status', labelKey: 'broadcasts.status', hideable: true },
      { key: 'createdAt', labelKey: 'broadcasts.createdAt', hideable: true },
      { key: 'sentAt', labelKey: 'broadcasts.sentAt', hideable: true },
      { key: 'id', labelKey: 'broadcasts.id', hideable: true },
      { key: 'textUz', labelKey: 'broadcasts.textUz', hideable: true },
      { key: 'textRu', labelKey: 'broadcasts.textRu', hideable: true },
      { key: 'contentId', labelKey: 'broadcasts.contentId', hideable: true },
      { key: 'url', labelKey: 'broadcasts.url', hideable: true },
      { key: 'sentCount', labelKey: 'broadcasts.sentCount', hideable: true },
      { key: 'mutedCount', labelKey: 'broadcasts.mutedCount', hideable: true },
      { key: 'failedCount', labelKey: 'broadcasts.failedCount', hideable: true },
      { key: 'createdBy', labelKey: 'broadcasts.createdBy', hideable: true },
      { key: 'requestedBy', labelKey: 'broadcasts.requestedBy', hideable: true },
      { key: 'queuedAt', labelKey: 'broadcasts.queuedAt', hideable: true },
      { key: 'startedAt', labelKey: 'broadcasts.startedAt', hideable: true },
      { key: 'updatedAt', labelKey: 'broadcasts.updatedAt', hideable: true },
    ],
  });
