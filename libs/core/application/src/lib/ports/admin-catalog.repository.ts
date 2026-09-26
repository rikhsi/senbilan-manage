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

/** A couple member. The list API does not mark a role; the first member is the creator. */
export interface AdminCoupleMember {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
}

export interface AdminCoupleSummary {
  readonly id: string;
  readonly status: string;
  /** First member. A waiting couple has only this person. */
  readonly creator: AdminCoupleMember | null;
  /** Second member. Absent until someone joins. */
  readonly partner: AdminCoupleMember | null;
  readonly startedOn: string | null;
  readonly createdAt: string | null;
}

export interface AdminCoupleDetailSnapshot {
  readonly couple: AdminCoupleSummary;
  readonly counts: Readonly<Record<string, number>>;
}

export interface AdminContentUnit {
  readonly index: number;
  readonly title: string;
  readonly body: string;
  readonly url: string;
  readonly updatedAt: string | null;
}

export interface AdminContentSummary {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly kind: string;
  readonly status: string;
  readonly language: string;
  readonly tags: readonly string[];
  readonly unitCount: number;
  readonly coverUrl: string | null;
  readonly coverMediaId: string | null;
  readonly publishedAt: string | null;
  readonly updatedAt: string | null;
  readonly createdAt: string | null;
  readonly createdBy: string;
  readonly updatedBy: string;
}

/** Full content with ordered units (GetContent). */
export interface AdminContentDetail extends AdminContentSummary {
  readonly units: readonly AdminContentUnit[];
}

export interface AdminContentUnitInput {
  readonly title: string;
  readonly body: string;
  readonly url: string;
}

export interface AdminCreateContentInput {
  readonly kind: string;
  readonly title: string;
  readonly description: string;
  readonly language: string;
  readonly tags: readonly string[];
  readonly url: string;
  readonly coverMediaId: string;
  readonly units: readonly AdminContentUnitInput[];
}

export interface AdminUpdateContentInput {
  readonly title?: string;
  readonly description?: string;
  readonly language?: string;
  readonly tags?: readonly string[];
  readonly updateTags?: boolean;
  readonly url?: string;
  readonly coverMediaId?: string;
}

export interface AdminBroadcastSummary {
  readonly id: string;
  readonly title: string;
  readonly textUz: string;
  readonly textRu: string;
  readonly status: string;
  readonly contentId: string;
  readonly url: string;
  readonly sentCount: number;
  readonly mutedCount: number;
  readonly failedCount: number;
  readonly createdBy: string;
  readonly requestedBy: string;
  readonly queuedAt: string | null;
  readonly startedAt: string | null;
  readonly sentAt: string | null;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}

export interface AdminMediaSummary {
  readonly id: string;
  readonly ownerId: string;
  readonly coupleId: string;
  readonly purpose: string;
  readonly contentType: string;
  readonly sizeBytes: string;
  readonly width: number;
  readonly height: number;
  readonly status: string;
  readonly createdAt: string | null;
}

export interface AdminSystemSnapshot {
  readonly version: string;
  readonly environment: string;
  readonly schemaVersion: string;
  readonly startedAt: string | null;
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
  readonly includeDeleted?: boolean;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface AdminListCouplesQuery {
  readonly status?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface AdminListContentsQuery {
  readonly status?: string;
  readonly kind?: string;
  readonly language?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface AdminListMediaQuery {
  readonly ownerId?: string;
  readonly coupleId?: string;
  readonly purpose?: string;
  readonly status?: string;
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
    query?: AdminListCouplesQuery,
    signal?: AbortSignal,
  ): Promise<AdminCursorPage<AdminCoupleSummary>>;

  abstract getCouple(coupleId: string, signal?: AbortSignal): Promise<AdminCoupleDetailSnapshot>;
  abstract unpairCouple(coupleId: string): Promise<AdminCoupleSummary>;

  abstract listContents(
    query?: AdminListContentsQuery,
    signal?: AbortSignal,
  ): Promise<AdminCursorPage<AdminContentSummary>>;

  abstract getContent(contentId: string, signal?: AbortSignal): Promise<AdminContentDetail>;

  abstract createContent(input: AdminCreateContentInput): Promise<AdminContentDetail>;

  abstract updateContent(
    contentId: string,
    input: AdminUpdateContentInput,
  ): Promise<AdminContentDetail>;

  abstract deleteContent(contentId: string): Promise<void>;

  abstract publishContent(contentId: string): Promise<AdminContentDetail>;

  abstract unpublishContent(contentId: string): Promise<AdminContentDetail>;

  abstract addContentUnit(
    contentId: string,
    input: AdminContentUnitInput,
  ): Promise<AdminContentDetail>;

  abstract updateContentUnit(
    contentId: string,
    index: number,
    input: AdminContentUnitInput,
  ): Promise<AdminContentDetail>;

  abstract deleteContentUnit(contentId: string, index: number): Promise<AdminContentDetail>;

  abstract listBroadcasts(
    query?: { cursor?: string; limit?: number },
    signal?: AbortSignal,
  ): Promise<AdminCursorPage<AdminBroadcastSummary>>;

  abstract getBroadcast(broadcastId: string, signal?: AbortSignal): Promise<AdminBroadcastSummary>;

  abstract listMedia(
    query?: AdminListMediaQuery,
    signal?: AbortSignal,
  ): Promise<AdminCursorPage<AdminMediaSummary>>;

  abstract deleteMedia(mediaId: string): Promise<void>;

  abstract getSystem(signal?: AbortSignal): Promise<AdminSystemSnapshot>;
}
