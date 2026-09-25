import { type IsoDateTime } from '../shared/identifiers';
import { type User } from '../user/user.entity';

/** Read models are server-computed aggregates. They carry no invariants of their own. */
export interface StatMetric {
  readonly key: 'users.total' | 'users.active' | 'users.invited' | 'roles.total';
  readonly value: number;
  /** Relative change vs. previous period, e.g. 0.12 for +12 %. */
  readonly delta: number | null;
}

export interface TimeSeriesPoint {
  readonly at: IsoDateTime;
  readonly value: number;
}

export interface ActivityEntry {
  readonly id: string;
  readonly actor: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  readonly action:
    | 'user.created'
    | 'user.updated'
    | 'user.blocked'
    | 'role.updated'
    | 'settings.changed';
  readonly target: string;
  readonly at: IsoDateTime;
}

export interface DashboardOverview {
  readonly metrics: readonly StatMetric[];
  readonly signups: readonly TimeSeriesPoint[];
  readonly activeUsers: readonly TimeSeriesPoint[];
  readonly recentUsers: readonly User[];
  readonly activity: readonly ActivityEntry[];
}
