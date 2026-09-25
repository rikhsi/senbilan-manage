import { type IsoDateTime, type NotificationId } from '../shared/identifiers';

export const NOTIFICATION_KINDS = ['info', 'success', 'warning', 'danger'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface Notification {
  readonly id: NotificationId;
  readonly kind: NotificationKind;
  /** i18n key or server-provided text; presentation decides. */
  readonly title: string;
  readonly body: string;
  readonly link: string | null;
  readonly readAt: IsoDateTime | null;
  readonly createdAt: IsoDateTime;
}

export const isUnread = (notification: Notification): boolean => notification.readAt === null;

export const markRead = (notification: Notification, at: IsoDateTime): Notification =>
  notification.readAt ? notification : { ...notification, readAt: at };

export const countUnread = (notifications: readonly Notification[]): number =>
  notifications.filter(isUnread).length;
