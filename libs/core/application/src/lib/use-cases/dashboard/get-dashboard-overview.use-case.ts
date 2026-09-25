import { type DashboardOverview } from '@senbilan/core/domain';
import { type DashboardRange, type DashboardRepository } from '../../ports/dashboard.repository';

export class GetDashboardOverviewUseCase {
  constructor(private readonly dashboard: DashboardRepository) {}

  execute(range: DashboardRange, signal?: AbortSignal): Promise<DashboardOverview> {
    return this.dashboard.getOverview(range, signal);
  }
}
