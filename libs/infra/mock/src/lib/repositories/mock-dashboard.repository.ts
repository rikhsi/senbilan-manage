import { Injectable, inject } from '@angular/core';
import { DashboardRepository, type DashboardRange } from '@senbilan/core/application';
import { type DashboardOverview } from '@senbilan/core/domain';
import { MockDataStore } from '../mock-data.store';

@Injectable()
export class MockDashboardRepository extends DashboardRepository {
  private readonly store = inject(MockDataStore);

  override async getOverview(
    range: DashboardRange,
    _signal?: AbortSignal,
  ): Promise<DashboardOverview> {
    const factor = range === '7d' ? 0.7 : range === '90d' ? 1.3 : 1;
    const overview = this.store.db.dashboard;
    return {
      ...overview,
      metrics: overview.metrics.map((m) => ({
        ...m,
        value: Math.round(m.value * factor),
      })),
    };
  }
}
