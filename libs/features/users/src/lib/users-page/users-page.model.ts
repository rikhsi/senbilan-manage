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

export const usersListQueryToApi = (state: UsersListQueryState): AdminListUsersQuery => ({
  ...(state.q ? { q: state.q } : {}),
  ...(state.status ? { status: state.status } : {}),
  ...(state.role ? { role: state.role } : {}),
  ...(state.plan ? { plan: state.plan } : {}),
  ...(state.includeDeleted ? { includeDeleted: true } : {}),
  limit: 50,
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
