import { type DashboardOverview } from '@senbilan/core/domain';

export type DashboardRange = '7d' | '30d' | '90d';

export abstract class DashboardRepository {
  abstract getOverview(range: DashboardRange, signal?: AbortSignal): Promise<DashboardOverview>;
}
