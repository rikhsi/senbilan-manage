import { type ParamMap, type Params } from '@angular/router';
import { type AdminListUsersQuery } from '@senbilan/core/application';

const STATUSES = new Set(['USER_STATUS_ACTIVE', 'USER_STATUS_BLOCKED']);
const ROLES = new Set(['USER_ROLE_USER', 'USER_ROLE_ADMIN']);
const PLANS = new Set(['USER_PLAN_FREE', 'USER_PLAN_PRO']);

export interface UsersListQueryState {
  readonly q: string;
  readonly status: string;
  readonly role: string;
  readonly plan: string;
  readonly includeDeleted: boolean;
}

export type UsersFilterChipId = 'status' | 'role' | 'plan' | 'deleted';

export interface UsersFilterChip {
  readonly id: UsersFilterChipId;
  readonly labelKey: string;
}

export const EMPTY_USERS_QUERY: UsersListQueryState = {
  q: '',
  status: '',
  role: '',
  plan: '',
  includeDeleted: false,
};

export const parseUsersListQuery = (params: ParamMap): UsersListQueryState => {
  const status = params.get('status') ?? '';
  const role = params.get('role') ?? '';
  const plan = params.get('plan') ?? '';
  return {
    q: (params.get('q') ?? '').trim(),
    status: STATUSES.has(status) ? status : '',
    role: ROLES.has(role) ? role : '',
    plan: PLANS.has(plan) ? plan : '',
    includeDeleted: params.get('deleted') === '1' || params.get('deleted') === 'true',
  };
};

/** Router `queryParams` patch — `null` clears a key when using `queryParamsHandling: 'merge'`. */
export const usersListQueryToParams = (state: UsersListQueryState): Params => ({
  q: state.q || null,
  status: state.status || null,
  role: state.role || null,
  plan: state.plan || null,
  deleted: state.includeDeleted ? '1' : null,
});

export const usersListQueryToApi = (
  state: UsersListQueryState,
  paging: { readonly limit: number; readonly cursor?: string | null } = { limit: 20 },
): AdminListUsersQuery => ({
  ...(state.q ? { q: state.q } : {}),
  ...(state.status ? { status: state.status } : {}),
  ...(state.role ? { role: state.role } : {}),
  ...(state.plan ? { plan: state.plan } : {}),
  ...(state.includeDeleted ? { includeDeleted: true } : {}),
  ...(paging.cursor ? { cursor: paging.cursor } : {}),
  limit: paging.limit,
});

/** Drawer badge / chips — excludes free-text search. */
export const countUsersDrawerFilters = (state: UsersListQueryState): number => {
  let count = 0;
  if (state.status) {
    count += 1;
  }
  if (state.role) {
    count += 1;
  }
  if (state.plan) {
    count += 1;
  }
  if (state.includeDeleted) {
    count += 1;
  }
  return count;
};

export const usersFilterChips = (state: UsersListQueryState): readonly UsersFilterChip[] => {
  const chips: UsersFilterChip[] = [];
  if (state.status) {
    chips.push({ id: 'status', labelKey: userStatusLabelKey(state.status) });
  }
  if (state.role) {
    chips.push({ id: 'role', labelKey: userRoleLabelKey(state.role) });
  }
  if (state.plan) {
    chips.push({ id: 'plan', labelKey: userPlanLabelKey(state.plan) });
  }
  if (state.includeDeleted) {
    chips.push({ id: 'deleted', labelKey: 'users.includeDeleted' });
  }
  return chips;
};

export const removeUsersFilterChip = (
  state: UsersListQueryState,
  id: UsersFilterChipId,
): UsersListQueryState => {
  switch (id) {
    case 'status':
      return { ...state, status: '' };
    case 'role':
      return { ...state, role: '' };
    case 'plan':
      return { ...state, plan: '' };
    case 'deleted':
      return { ...state, includeDeleted: false };
  }
};

export const isUserBlocked = (status: string): boolean =>
  status.trim().toUpperCase().includes('BLOCKED');

/** Swagger sets `deleted_at` only after the account is deleted. */
export const isUserDeleted = (deletedAt: string | null | undefined): boolean =>
  typeof deletedAt === 'string' && deletedAt.trim().length > 0;

/** Map wire / domain status codes to i18n keys. */
export const userStatusLabelKey = (status: string): string => {
  const normalized = status.trim().toUpperCase();
  if (normalized.includes('ACTIVE') || status === 'active') {
    return 'users.statusActive';
  }
  if (normalized.includes('BLOCKED') || status === 'blocked') {
    return 'users.statusBlocked';
  }
  if (normalized.includes('UNSPECIFIED') || !status) {
    return 'users.statusAll';
  }
  return 'users.statusUnknown';
};

export const userRoleLabelKey = (role: string): string => {
  const normalized = role.trim().toUpperCase();
  if (normalized.includes('ADMIN')) {
    return 'users.roleAdmin';
  }
  if (normalized.includes('USER') && !normalized.includes('UNSPECIFIED')) {
    return 'users.roleUser';
  }
  if (normalized.includes('UNSPECIFIED') || !role) {
    return 'users.roleAll';
  }
  return 'users.roleUnknown';
};

export const USERS_OPTIONAL_COLUMN_KEYS = [
  'id',
  'telegramId',
  'language',
  'planExpiresAt',
  'coupleId',
  'createdAt',
  'deletedAt',
] as const;

const USERS_HIDEABLE_COLUMN_KEYS = new Set<string>([
  'email',
  'phone',
  'status',
  'role',
  'plan',
  ...USERS_OPTIONAL_COLUMN_KEYS,
]);

const USERS_COLUMN_KEYS = new Set<string>(['name', ...USERS_HIDEABLE_COLUMN_KEYS]);

export const DEFAULT_HIDDEN_USER_COLUMNS: readonly string[] = [...USERS_OPTIONAL_COLUMN_KEYS];

const USERS_LIST_SESSION_KEY = 'senbilan.users.list';

export interface UsersListSessionState {
  readonly query: UsersListQueryState;
  readonly hiddenColumns: readonly string[];
  readonly columnOrder: readonly string[];
}

export interface UsersListSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const isUsersListQueryEmpty = (state: UsersListQueryState): boolean =>
  state.q === '' &&
  state.status === '' &&
  state.role === '' &&
  state.plan === '' &&
  !state.includeDeleted;

export const usersListUrlHasQuery = (params: ParamMap): boolean =>
  params.has('q') ||
  params.has('status') ||
  params.has('role') ||
  params.has('plan') ||
  params.has('deleted');

export const sanitizeUsersListQuery = (
  value: Partial<UsersListQueryState> | null | undefined,
): UsersListQueryState => ({
  q: typeof value?.q === 'string' ? value.q.trim() : '',
  status: typeof value?.status === 'string' && STATUSES.has(value.status) ? value.status : '',
  role: typeof value?.role === 'string' && ROLES.has(value.role) ? value.role : '',
  plan: typeof value?.plan === 'string' && PLANS.has(value.plan) ? value.plan : '',
  includeDeleted: value?.includeDeleted === true,
});

export const sanitizeHiddenUserColumns = (value: unknown): readonly string[] => {
  if (!Array.isArray(value)) {
    return [...DEFAULT_HIDDEN_USER_COLUMNS];
  }
  return value.filter(
    (item): item is string => typeof item === 'string' && USERS_HIDEABLE_COLUMN_KEYS.has(item),
  );
};

export const sanitizeUserColumnOrder = (value: unknown): readonly string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is string => typeof item === 'string' && USERS_COLUMN_KEYS.has(item),
  );
};

export const readUsersListSession = (
  storage: UsersListSessionStorage,
): UsersListSessionState | null => {
  try {
    const raw = storage.getItem(USERS_LIST_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const record = parsed as {
      query?: Partial<UsersListQueryState>;
      hiddenColumns?: unknown;
      columnOrder?: unknown;
    };
    if (!record.query || typeof record.query !== 'object') {
      return null;
    }
    return {
      query: sanitizeUsersListQuery(record.query),
      hiddenColumns: sanitizeHiddenUserColumns(record.hiddenColumns),
      columnOrder: sanitizeUserColumnOrder(record.columnOrder),
    };
  } catch {
    return null;
  }
};

export const writeUsersListSession = (
  storage: UsersListSessionStorage,
  state: UsersListSessionState,
): void => {
  try {
    storage.setItem(USERS_LIST_SESSION_KEY, JSON.stringify(state));
  } catch {
    // Quota or private mode — the in-memory filters still apply for this visit.
  }
};

export const usersListBrowserSession = (): UsersListSessionStorage | null => {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
};

export const userLanguageLabelKey = (language: string): string | null => {
  const normalized = language.trim().toUpperCase();
  if (normalized.includes('UZ')) {
    return 'users.languageUz';
  }
  if (normalized.includes('RU')) {
    return 'users.languageRu';
  }
  if (!language || normalized.includes('UNSPECIFIED')) {
    return null;
  }
  return 'users.languageUnknown';
};

export const userPlanLabelKey = (plan: string): string => {
  const normalized = plan.trim().toUpperCase();
  if (normalized.includes('PRO')) {
    return 'users.planPro';
  }
  if (normalized.includes('FREE')) {
    return 'users.planFree';
  }
  if (normalized.includes('UNSPECIFIED') || !plan) {
    return 'users.planAll';
  }
  return 'users.planUnknown';
};
