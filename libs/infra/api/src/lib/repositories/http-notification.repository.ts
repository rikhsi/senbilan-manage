import { Injectable, inject } from '@angular/core';
import {
  NotificationRepository,
  type NotificationListFilter,
  type Page,
  type PageRequest,
} from '@senbilan/core/application';
import { type Notification, type NotificationId } from '@senbilan/core/domain';
import { ApiClient } from '../http/api-client';
import { type NotificationDto, type PageMetaDto } from '../dto/api.dto';
import { notificationFromDto } from '../dto/mappers';
import { toHttpParams } from '../http/page-params';

@Injectable()
export class HttpNotificationRepository extends NotificationRepository {
  private readonly api = inject(ApiClient);

  override async findPage(
    request: PageRequest<NotificationListFilter>,
    signal?: AbortSignal,
  ): Promise<Page<Notification>> {
    const envelope = await this.api.getEnvelope<NotificationDto[]>('/notifications', {
      params: toHttpParams(request),
      ...(signal !== undefined ? { signal } : {}),
    });
    const meta = envelope.meta as PageMetaDto | undefined;
    return {
      items: envelope.data.map(notificationFromDto),
      total: meta?.total ?? envelope.data.length,
      page: meta?.page ?? request.page,
      size: meta?.size ?? request.size,
    };
  }

  override countUnread(signal?: AbortSignal): Promise<number> {
    return this.api
      .get<{
        count: number;
      }>('/notifications/unread-count', signal !== undefined ? { signal } : undefined)
      .then((r) => r.count);
  }

  override markRead(id: NotificationId): Promise<Notification> {
    return this.api.post<NotificationDto>(`/notifications/${id}/read`).then(notificationFromDto);
  }

  override markAllRead(): Promise<void> {
    return this.api.post<null>('/notifications/read-all').then(() => undefined);
  }
}
