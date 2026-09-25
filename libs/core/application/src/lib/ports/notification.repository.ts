import { type Notification, type NotificationId } from '@senbilan/core/domain';
import { type Page, type PageRequest } from '../contracts/pagination';

export interface NotificationListFilter {
  readonly unreadOnly?: boolean;
}

export abstract class NotificationRepository {
  abstract findPage(
    request: PageRequest<NotificationListFilter>,
    signal?: AbortSignal,
  ): Promise<Page<Notification>>;
  abstract countUnread(signal?: AbortSignal): Promise<number>;
  abstract markRead(id: NotificationId): Promise<Notification>;
  abstract markAllRead(): Promise<void>;
}
