import { sessionColumnLayout } from '@senbilan/shared/util';
import { COUPLES_COLUMNS_KEY, COUPLES_DEFAULT_HIDDEN_COLUMNS } from './couples-page.model';

export const couplesTableLayout = () =>
  sessionColumnLayout({
    id: 'couples',
    labelKey: 'nav.couples',
    storageKey: COUPLES_COLUMNS_KEY,
    defaultHidden: COUPLES_DEFAULT_HIDDEN_COLUMNS,
    columns: [
      { key: 'members', labelKey: 'couples.members', hideable: false },
      { key: 'status', labelKey: 'couples.status', hideable: true },
      { key: 'createdAt', labelKey: 'couples.createdAt', hideable: true },
      { key: 'id', labelKey: 'couples.id', hideable: true },
      { key: 'startedOn', labelKey: 'couples.startedOn', hideable: true },
    ],
  });
