import { type TableLayoutDefinition } from '@senbilan/shared/util';
import {
  DEFAULT_HIDDEN_USER_COLUMNS,
  EMPTY_USERS_QUERY,
  readUsersListSession,
  sanitizeHiddenUserColumns,
  sanitizeUserColumnOrder,
  usersListBrowserSession,
  writeUsersListSession,
} from './users-page.model';

const USERS_TABLE_COLUMNS = [
  { key: 'name', labelKey: 'users.name', hideable: false },
  { key: 'email', labelKey: 'users.email', hideable: true },
  { key: 'phone', labelKey: 'users.phone', hideable: true },
  { key: 'status', labelKey: 'users.status', hideable: true },
  { key: 'role', labelKey: 'users.role', hideable: true },
  { key: 'plan', labelKey: 'users.plan', hideable: true },
  { key: 'id', labelKey: 'users.id', hideable: true },
  { key: 'telegramId', labelKey: 'users.telegramId', hideable: true },
  { key: 'language', labelKey: 'users.language', hideable: true },
  { key: 'planExpiresAt', labelKey: 'users.planExpires', hideable: true },
  { key: 'coupleId', labelKey: 'users.couple', hideable: true },
  { key: 'createdAt', labelKey: 'users.createdAt', hideable: true },
  { key: 'deletedAt', labelKey: 'users.deletedAt', hideable: true },
] as const;

/** Column layout stored beside the users list session, not in the shared prefs key. */
export const usersTableLayout = (): TableLayoutDefinition => ({
  id: 'users',
  labelKey: 'nav.users',
  columns: USERS_TABLE_COLUMNS,
  defaultHidden: DEFAULT_HIDDEN_USER_COLUMNS,
  read: () => {
    const storage = usersListBrowserSession();
    const session = storage ? readUsersListSession(storage) : null;
    return {
      hidden: session?.hiddenColumns ?? [...DEFAULT_HIDDEN_USER_COLUMNS],
      order: session?.columnOrder ?? [],
    };
  },
  write: (snapshot) => {
    const storage = usersListBrowserSession();
    if (!storage) {
      return;
    }
    const session = readUsersListSession(storage);
    writeUsersListSession(storage, {
      query: session?.query ?? { ...EMPTY_USERS_QUERY },
      hiddenColumns: sanitizeHiddenUserColumns(snapshot.hidden),
      columnOrder: sanitizeUserColumnOrder(snapshot.order),
    });
  },
});
