import { type AppIconName } from '@senbilan/design-system/icons';
import { type AdminStatsSnapshot } from '@senbilan/core/application';

export type DashboardStatKey = keyof AdminStatsSnapshot;

export const DASHBOARD_STAT_ORDER: readonly DashboardStatKey[] = [
  'usersTotal',
  'usersNew1d',
  'usersNew7d',
  'usersNew30d',
  'usersBlocked',
  'couplesPaired',
  'couplesWaiting',
  'pushesSent24h',
  'broadcastsQueued',
  'contentPublished',
];

export const DASHBOARD_STAT_ICONS: Record<DashboardStatKey, AppIconName> = {
  usersTotal: 'users',
  usersNew1d: 'user-plus',
  usersNew7d: 'users',
  usersNew30d: 'users',
  usersBlocked: 'user-x',
  couplesPaired: 'heart',
  couplesWaiting: 'heart',
  pushesSent24h: 'bell',
  broadcastsQueued: 'bell',
  contentPublished: 'columns',
};
