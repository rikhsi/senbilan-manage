/**
 * Admin OpenAPI catalog — plain DTOs for the manage console.
 * Field shapes mirror swagger `admin/v1` responses (snake_case kept at the wire
 * edge; adapters map into these camelCase view models).
 */

export interface AdminStatsSnapshot {
  readonly usersTotal: number;
  readonly usersNew1d: number;
  readonly usersNew7d: number;
  readonly usersNew30d: number;
  readonly usersBlocked: number;
  readonly couplesPaired: number;
  readonly couplesWaiting: number;
  readonly pushesSent24h: number;
  readonly broadcastsQueued: number;
  readonly contentPublished: number;
}

export interface AdminUserSummary {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly telegramId: string;
  readonly language: string;
  readonly status: string;
  readonly role: string;
  readonly plan: string;
  readonly planExpiresAt: string | null;
  readonly coupleId: string;
  readonly createdAt: string | null;
  readonly deletedAt: string | null;
}

export interface AdminUserDetailSnapshot {
  readonly user: AdminUserSummary;
  readonly photoUrl: string | null;
  readonly coupleId: string | null;
  readonly activeSessions: number;
  readonly pushDevices: number;
  readonly updatedAt: string | null;
}

export interface AdminCoupleSummary {
  readonly id: string;
  readonly status: string;
  readonly creatorName: string;
  readonly partnerName: string;
  readonly createdAt: string | null;
}

export interface AdminCoupleDetailSnapshot {
  readonly couple: AdminCoupleSummary;
  readonly counts: Readonly<Record<string, number>>;
}

export interface AdminContentSummary {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly status: string;
  readonly language: string;
  readonly updatedAt: string | null;
}

export interface AdminBroadcastSummary {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly createdAt: string | null;
  readonly sentAt: string | null;
}

export interface AdminCursorPage<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
}

export interface AdminListUsersQuery {
  readonly q?: string;
  readonly status?: string;
  readonly plan?: string;
  readonly role?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export abstract class AdminCatalogRepository {
  abstract getStats(signal?: AbortSignal): Promise<AdminStatsSnapshot>;

  abstract listUsers(
    query?: AdminListUsersQuery,
    signal?: AbortSignal,
  ): Promise<AdminCursorPage<AdminUserSummary>>;

  abstract getUser(userId: string, signal?: AbortSignal): Promise<AdminUserDetailSnapshot>;

  abstract blockUser(userId: string): Promise<AdminUserSummary>;
  abstract unblockUser(userId: string): Promise<AdminUserSummary>;
  abstract deleteUser(userId: string): Promise<void>;
  abstract setUserPlan(
    userId: string,
    plan: string,
    expiresAt?: string | null,
  ): Promise<AdminUserSummary>;
  abstract setUserRole(userId: string, role: string): Promise<AdminUserSummary>;

  abstract listCouples(
    query?: { cursor?: string; limit?: number },
    signal?: AbortSignal,
  ): Promise<AdminCursorPage<AdminCoupleSummary>>;

  abstract getCouple(coupleId: string, signal?: AbortSignal): Promise<AdminCoupleDetailSnapshot>;
  abstract unpairCouple(coupleId: string): Promise<AdminCoupleSummary>;

  abstract listContents(
    query?: {
      cursor?: string;
      limit?: number;
      kind?: string;
      status?: string;
      language?: string;
    },
    signal?: AbortSignal,
  ): Promise<AdminCursorPage<AdminContentSummary>>;

  abstract getContent(contentId: string, signal?: AbortSignal): Promise<AdminContentSummary>;

  abstract listBroadcasts(
    query?: { cursor?: string; limit?: number },
    signal?: AbortSignal,
  ): Promise<AdminCursorPage<AdminBroadcastSummary>>;

  abstract getBroadcast(broadcastId: string, signal?: AbortSignal): Promise<AdminBroadcastSummary>;
}
