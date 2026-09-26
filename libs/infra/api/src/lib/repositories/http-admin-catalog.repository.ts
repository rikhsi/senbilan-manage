/* eslint-disable max-lines -- OpenAPI catalog adapter for all admin modules */
import {
  AdminCatalogRepository,
  type AdminBroadcastSummary,
  type AdminContentDetail,
  type AdminContentSummary,
  type AdminContentUnit,
  type AdminContentUnitInput,
  type AdminCoupleDetailSnapshot,
  type AdminCoupleMember,
  type AdminCoupleSummary,
  type AdminCreateContentInput,
  type AdminCursorPage,
  type AdminListContentsQuery,
  type AdminListCouplesQuery,
  type AdminListMediaQuery,
  type AdminListUsersQuery,
  type AdminMediaSummary,
  type AdminStatsSnapshot,
  type AdminSystemSnapshot,
  type AdminUpdateContentInput,
  type AdminUserDetailSnapshot,
  type AdminUserSummary,
} from '@senbilan/core/application';
import {
  type AdminCoupleSummary as WireCouple,
  type AdminMedia,
  type AdminUser,
  type Broadcast,
  BroadcastService,
  type Content,
  ContentService,
  CoupleService,
  MediaService,
  type Stats,
  StatsService,
  type SystemInfo,
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

const mapCoupleMember = (user: AdminUser | null | undefined): AdminCoupleMember | null => {
  if (!user) {
    return null;
  }
  const id = str(user.id);
  const name = str(user.name);
  const phone = str(user.phone);
  if (id.length === 0 && name.trim().length === 0 && phone.trim().length === 0) {
    return null;
  }
  return { id, name, phone };
};

const formatCalendarDate = (
  value: { year?: number; month?: number; day?: number } | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }
  const year = value.year ?? 0;
  const month = value.month ?? 0;
  const day = value.day ?? 0;
  if (year === 0 && month === 0 && day === 0) {
    return null;
  }
  const parts = [
    year > 0 ? String(year) : '',
    month > 0 ? String(month).padStart(2, '0') : '',
    day > 0 ? String(day).padStart(2, '0') : '',
  ].filter((part) => part.length > 0);
  return parts.length > 0 ? parts.join('-') : null;
};

const mapCouple = (couple: WireCouple | null | undefined): AdminCoupleSummary => {
  const members = couple?.members ?? [];
  return {
    id: str(couple?.id),
    status: str(couple?.status),
    creator: mapCoupleMember(members[0]),
    partner: mapCoupleMember(members[1]),
    startedOn: formatCalendarDate(couple?.started_on),
    createdAt: couple?.created_at ?? null,
  };
};

const mapContentUnit = (unit: {
  index?: number;
  title?: string;
  body?: string;
  url?: string;
  updated_at?: string | null;
}): AdminContentUnit => ({
  index: unit.index ?? 0,
  title: str(unit.title),
  body: str(unit.body),
  url: str(unit.url),
  updatedAt: unit.updated_at ?? null,
});

const mapContent = (content: Content | null | undefined): AdminContentSummary => {
  const cover = content?.cover ?? null;
  return {
    id: str(content?.id),
    title: str(content?.title),
    description: str(content?.description),
    url: str(content?.url),
    kind: str(content?.kind),
    status: str(content?.status),
    language: str(content?.language),
    tags: content?.tags ?? [],
    unitCount: num(content?.unit_count),
    coverUrl: cover?.url ? str(cover.url) : null,
    coverMediaId: cover?.id ? str(cover.id) : null,
    publishedAt: content?.published_at ?? null,
    updatedAt: content?.updated_at ?? null,
    createdAt: content?.created_at ?? null,
    createdBy: str(content?.created_by),
    updatedBy: str(content?.updated_by),
  };
};

const mapContentDetail = (content: Content | null | undefined): AdminContentDetail => ({
  ...mapContent(content),
  units: (content?.units ?? []).map(mapContentUnit),
});

const mapBroadcast = (item: Broadcast | null | undefined): AdminBroadcastSummary => ({
  id: str(item?.id),
  title: str(item?.text_ru || item?.text_uz || item?.id),
  textUz: str(item?.text_uz),
  textRu: str(item?.text_ru),
  status: str(item?.status),
  contentId: str(item?.content_id),
  url: str(item?.url),
  sentCount: num(item?.sent_count),
  mutedCount: num(item?.muted_count),
  failedCount: num(item?.failed_count),
  createdBy: str(item?.created_by),
  requestedBy: str(item?.requested_by),
  queuedAt: item?.queued_at ?? null,
  startedAt: item?.started_at ?? null,
  sentAt: item?.sent_at ?? null,
  createdAt: item?.created_at ?? null,
  updatedAt: item?.updated_at ?? null,
});

const mapMedia = (item: AdminMedia | null | undefined): AdminMediaSummary => ({
  id: str(item?.id),
  ownerId: str(item?.owner_id),
  coupleId: str(item?.couple_id),
  purpose: str(item?.purpose),
  contentType: str(item?.content_type),
  sizeBytes: str(item?.size_bytes),
  width: item?.width ?? 0,
  height: item?.height ?? 0,
  status: str(item?.status),
  createdAt: item?.created_at ?? null,
});

const mapSystem = (info: SystemInfo | null | undefined): AdminSystemSnapshot => ({
  version: str(info?.version),
  environment: str(info?.environment),
  schemaVersion: str(info?.schema_version),
  startedAt: info?.started_at ?? null,
});

@Injectable()
export class HttpAdminCatalogRepository extends AdminCatalogRepository {
  private readonly statsApi = inject(StatsService);
  private readonly usersApi = inject(UserService);
  private readonly couplesApi = inject(CoupleService);
  private readonly contentApi = inject(ContentService);
  private readonly broadcastsApi = inject(BroadcastService);
  private readonly mediaApi = inject(MediaService);

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
    query: AdminListCouplesQuery = {},
  ): Promise<AdminCursorPage<AdminCoupleSummary>> {
    const envelope = await firstValueFrom(
      this.couplesApi.listCouples({
        ...(query.status ? { status: query.status } : {}),
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
    query: AdminListContentsQuery = {},
  ): Promise<AdminCursorPage<AdminContentSummary>> {
    const envelope = await firstValueFrom(
      this.contentApi.listContents({
        ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
        ...(query.kind ? { kind: query.kind as never } : {}),
        ...(query.status ? { status: query.status as never } : {}),
        ...(query.language ? { language: query.language as never } : {}),
      }),
    );
    const data = envelope.data;
    return {
      items: (data?.contents ?? []).map(mapContent),
      nextCursor: data?.next_cursor ? data.next_cursor : null,
    };
  }

  override async getContent(contentId: string): Promise<AdminContentDetail> {
    const envelope = await firstValueFrom(this.contentApi.getContent(contentId));
    return mapContentDetail(envelope.data);
  }

  override async createContent(input: AdminCreateContentInput): Promise<AdminContentDetail> {
    const envelope = await firstValueFrom(
      this.contentApi.createContent({
        kind: input.kind as never,
        title: input.title,
        description: input.description,
        language: input.language as never,
        tags: [...input.tags],
        ...(input.url ? { url: input.url } : {}),
        ...(input.coverMediaId ? { cover_media_id: input.coverMediaId } : {}),
        units: input.units.map((unit) => ({
          title: unit.title,
          ...(unit.body ? { body: unit.body } : {}),
          ...(unit.url ? { url: unit.url } : {}),
        })),
      }),
    );
    return mapContentDetail(envelope.data);
  }

  override async updateContent(
    contentId: string,
    input: AdminUpdateContentInput,
  ): Promise<AdminContentDetail> {
    const envelope = await firstValueFrom(
      this.contentApi.updateContent(contentId, {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.language !== undefined ? { language: input.language as never } : {}),
        ...(input.updateTags ? { update_tags: true, tags: [...(input.tags ?? [])] } : {}),
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.coverMediaId !== undefined ? { cover_media_id: input.coverMediaId } : {}),
      }),
    );
    return mapContentDetail(envelope.data);
  }

  override async deleteContent(contentId: string): Promise<void> {
    await firstValueFrom(this.contentApi.deleteContent(contentId));
  }

  override async publishContent(contentId: string): Promise<AdminContentDetail> {
    const envelope = await firstValueFrom(this.contentApi.publishContent(contentId, {}));
    return mapContentDetail(envelope.data);
  }

  override async unpublishContent(contentId: string): Promise<AdminContentDetail> {
    const envelope = await firstValueFrom(this.contentApi.unpublishContent(contentId, {}));
    return mapContentDetail(envelope.data);
  }

  override async addContentUnit(
    contentId: string,
    input: AdminContentUnitInput,
  ): Promise<AdminContentDetail> {
    const envelope = await firstValueFrom(
      this.contentApi.addUnit(contentId, {
        title: input.title,
        ...(input.body ? { body: input.body } : {}),
        ...(input.url ? { url: input.url } : {}),
      }),
    );
    return mapContentDetail(envelope.data);
  }

  override async updateContentUnit(
    contentId: string,
    index: number,
    input: AdminContentUnitInput,
  ): Promise<AdminContentDetail> {
    const envelope = await firstValueFrom(
      this.contentApi.updateUnit(contentId, index, {
        title: input.title,
        body: input.body,
        ...(input.url ? { url: input.url } : { url: '' }),
      }),
    );
    return mapContentDetail(envelope.data);
  }

  override async deleteContentUnit(contentId: string, index: number): Promise<AdminContentDetail> {
    const envelope = await firstValueFrom(this.contentApi.deleteUnit(contentId, index));
    return mapContentDetail(envelope.data);
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

  override async listMedia(
    query: AdminListMediaQuery = {},
  ): Promise<AdminCursorPage<AdminMediaSummary>> {
    const envelope = await firstValueFrom(
      this.mediaApi.listMedia({
        ...(query.ownerId ? { owner_id: query.ownerId } : {}),
        ...(query.coupleId ? { couple_id: query.coupleId } : {}),
        ...(query.purpose ? { purpose: query.purpose } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
      }),
    );
    const data = envelope.data;
    return {
      items: (data?.media ?? []).map(mapMedia),
      nextCursor: data?.next_cursor ? data.next_cursor : null,
    };
  }

  override async deleteMedia(mediaId: string): Promise<void> {
    await firstValueFrom(this.mediaApi.deleteMedia(mediaId, {}));
  }

  override async getSystem(): Promise<AdminSystemSnapshot> {
    const envelope = await firstValueFrom(this.statsApi.getSystemInfo());
    return mapSystem(envelope.data);
  }
}
