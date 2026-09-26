import { sessionColumnLayout } from '@senbilan/shared/util';
import { MEDIA_COLUMNS_KEY, MEDIA_DEFAULT_HIDDEN_COLUMNS } from './media-page.model';

export const mediaTableLayout = () =>
  sessionColumnLayout({
    id: 'media',
    labelKey: 'nav.media',
    storageKey: MEDIA_COLUMNS_KEY,
    defaultHidden: MEDIA_DEFAULT_HIDDEN_COLUMNS,
    columns: [
      { key: 'purpose', labelKey: 'media.purpose', hideable: false },
      { key: 'contentType', labelKey: 'media.contentType', hideable: true },
      { key: 'status', labelKey: 'media.status', hideable: true },
      { key: 'size', labelKey: 'media.size', hideable: true },
      { key: 'createdAt', labelKey: 'media.createdAt', hideable: true },
      { key: 'id', labelKey: 'media.id', hideable: true },
      { key: 'owner', labelKey: 'media.owner', hideable: true },
      { key: 'couple', labelKey: 'media.couple', hideable: true },
      { key: 'width', labelKey: 'media.width', hideable: true },
      { key: 'height', labelKey: 'media.height', hideable: true },
    ],
  });
