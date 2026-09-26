import {
  AdminCatalogRepository,
  type AdminBroadcastSummary,
  type AdminContentSummary,
  type AdminCoupleDetailSnapshot,
  type AdminCoupleSummary,
  type AdminCursorPage,
  type AdminListUsersQuery,
  type AdminStatsSnapshot,
  type AdminUserDetailSnapshot,
  type AdminUserSummary,
} from '@senbilan/core/application';
import {
  type AdminCoupleSummary as WireCouple,
  type AdminUser,
  type Broadcast,
  BroadcastService,
  type Content,
  ContentService,
  CoupleService,
  type Stats,
  StatsService,
  UserService,
} from '@senbilan/infra/openapi';
import { firstValueFrom } from 'rxjs';
import { Injectable, inject } from '@angular/core';

const num = (value: string | number | undefined): number => {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const str = (value: string | undefined | null): string => value ?? '';

const mapUser = (user: AdminUser | null | undefined): AdminUserSummary => ({
  id: str(user?.id),
  name: str(user?.name),
  phone: str(user?.phone),
  email: str(user?.email),
  telegramId: str(user?.telegram_id),
  language: str(user?.language),
  status: str(user?.status),
  role: str(user?.role),
  plan: str(user?.plan),
  planExpiresAt: user?.plan_expires_at ?? null,
  coupleId: str(user?.couple_id),
  createdAt: user?.created_at ?? null,
  deletedAt: user?.deleted_at ?? null,
});

const mapStats = (stats: Stats): AdminStatsSnapshot => ({
  usersTotal: num(stats.users_total),
  usersNew1d: num(stats.users_new_1d),
  usersNew7d: num(stats.users_new_7d),
  usersNew30d: num(stats.users_new_30d),
  usersBlocked: num(stats.users_blocked),
  couplesPaired: num(stats.couples_paired),
  couplesWaiting: num(stats.couples_waiting),
  pushesSent24h: num(stats.pushes_sent_24h),
  broadcastsQueued: num(stats.broadcasts_queued),
  contentPublished: num(stats.content_published),
});

const mapCouple = (couple: WireCouple | null | undefined): AdminCoupleSummary => {
  const members = couple?.members ?? [];
  return {
    id: str(couple?.id),
    status: str(couple?.status),
    creatorName: str(members[0]?.name),
    partnerName: str(members[1]?.name),
    createdAt: couple?.created_at ?? null,
  };
};

const mapContent = (content: Content | null | undefined): AdminContentSummary => ({
  id: str(content?.id),
  title: str(content?.title),
  kind: str(content?.kind),
  status: str(content?.status),
  language: str(content?.language),
  updatedAt: content?.updated_at ?? null,
});

const mapBroadcast = (item: Broadcast | null | undefined): AdminBroadcastSummary => ({
  id: str(item?.id),
  title: str(item?.text_ru || item?.text_uz || item?.id),
  status: str(item?.status),
  createdAt: item?.created_at ?? null,
  sentAt: item?.sent_at ?? null,
});

@Injectable()
export class HttpAdminCatalogRepository extends AdminCatalogRepository {
  private readonly statsApi = inject(StatsService);
  private readonly usersApi = inject(UserService);
  private readonly couplesApi = inject(CoupleService);
  private readonly contentApi = inject(ContentService);
  private readonly broadcastsApi = inject(BroadcastService);

  override async getStats(): Promise<AdminStatsSnapshot> {
    const envelope = await firstValueFrom(this.statsApi.getStats());
    return mapStats(envelope.data ?? {});
  }

  override async listUsers(
    query: AdminListUsersQuery = {},
  ): Promise<AdminCursorPage<AdminUserSummary>> {
    const envelope = await firstValueFrom(
      this.usersApi.listUsers({
        ...(query.q !== undefined ? { q: query.q } : {}),
        ...(query.status !== undefined ? { status: query.status as never } : {}),
        ...(query.plan !== undefined ? { plan: query.plan as never } : {}),
        ...(query.role !== undefined ? { role: query.role as never } : {}),
        ...(query.includeDeleted !== undefined ? { include_deleted: query.includeDeleted } : {}),
        ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
      }),
    );
    const data = envelope.data;
    return {
      items: (data?.users ?? []).map(mapUser),
      nextCursor: data?.next_cursor ? data.next_cursor : null,
    };
  }

  override async getUser(userId: string): Promise<AdminUserDetailSnapshot> {
    const envelope = await firstValueFrom(this.usersApi.getUser(userId));
    const detail = envelope.data;
    const user = mapUser(detail?.user ?? undefined);
    return {
      user,
      photoUrl: detail?.photo?.url ?? null,
      coupleId: detail?.couple?.id ?? null,
      activeSessions: num(detail?.active_sessions),
      pushDevices: num(detail?.push_devices),
      updatedAt: detail?.updated_at ?? null,
    };
  }

  override async blockUser(userId: string): Promise<AdminUserSummary> {
    const envelope = await firstValueFrom(this.usersApi.blockUser(userId, {}));
    return mapUser(envelope.data);
  }

  override async unblockUser(userId: string): Promise<AdminUserSummary> {
    const envelope = await firstValueFrom(this.usersApi.unblockUser(userId, {}));
    return mapUser(envelope.data);
  }

  override async deleteUser(userId: string): Promise<void> {
    await firstValueFrom(this.usersApi.deleteUser(userId, {}));
  }

  override async setUserPlan(
    userId: string,
    plan: string,
    expiresAt?: string | null,
  ): Promise<AdminUserSummary> {
    const envelope = await firstValueFrom(
      this.usersApi.setUserPlan(userId, {
        plan: plan as never,
        ...(expiresAt !== undefined ? { expires_at: expiresAt } : {}),
      }),
    );
    return mapUser(envelope.data);
  }

  override async setUserRole(userId: string, role: string): Promise<AdminUserSummary> {
    const envelope = await firstValueFrom(
      this.usersApi.setUserRole(userId, { role: role as never }),
    );
    return mapUser(envelope.data);
  }

  override async listCouples(
    query: { cursor?: string; limit?: number } = {},
  ): Promise<AdminCursorPage<AdminCoupleSummary>> {
    const envelope = await firstValueFrom(
      this.couplesApi.listCouples({
        ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
      }),
    );
    const data = envelope.data;
    return {
      items: (data?.couples ?? []).map(mapCouple),
      nextCursor: data?.next_cursor ? data.next_cursor : null,
    };
  }

  override async getCouple(coupleId: string): Promise<AdminCoupleDetailSnapshot> {
    const envelope = await firstValueFrom(this.couplesApi.getCouple(coupleId));
    const detail = envelope.data;
    return {
      couple: mapCouple(detail?.couple),
      counts: { ...(detail?.counts ?? {}) },
    };
  }

  override async unpairCouple(coupleId: string): Promise<AdminCoupleSummary> {
    const envelope = await firstValueFrom(this.couplesApi.unpairCouple(coupleId, {}));
    return mapCouple(envelope.data);
  }

  override async listContents(
    query: {
      cursor?: string;
      limit?: number;
      kind?: string;
      status?: string;
      language?: string;
    } = {},
  ): Promise<AdminCursorPage<AdminContentSummary>> {
    const envelope = await firstValueFrom(
      this.contentApi.listContents({
        ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
        ...(query.kind !== undefined ? { kind: query.kind as never } : {}),
        ...(query.status !== undefined ? { status: query.status as never } : {}),
        ...(query.language !== undefined ? { language: query.language as never } : {}),
      }),
    );
    const data = envelope.data;
    return {
      items: (data?.contents ?? []).map(mapContent),
      nextCursor: data?.next_cursor ? data.next_cursor : null,
    };
  }

  override async getContent(contentId: string): Promise<AdminContentSummary> {
    const envelope = await firstValueFrom(this.contentApi.getContent(contentId));
    return mapContent(envelope.data);
  }

  override async listBroadcasts(
    query: { cursor?: string; limit?: number } = {},
  ): Promise<AdminCursorPage<AdminBroadcastSummary>> {
    const envelope = await firstValueFrom(
      this.broadcastsApi.listBroadcasts({
        ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
      }),
    );
    const data = envelope.data;
    return {
      items: (data?.broadcasts ?? []).map(mapBroadcast),
      nextCursor: data?.next_cursor ? data.next_cursor : null,
    };
  }

  override async getBroadcast(broadcastId: string): Promise<AdminBroadcastSummary> {
    const envelope = await firstValueFrom(this.broadcastsApi.getBroadcast(broadcastId));
    return mapBroadcast(envelope.data);
  }
}
