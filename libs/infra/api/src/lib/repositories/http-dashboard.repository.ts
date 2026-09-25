import { Injectable, inject } from '@angular/core';
import { DashboardRepository, type DashboardRange } from '@senbilan/core/application';
import { type DashboardOverview } from '@senbilan/core/domain';
import { ApiClient } from '../http/api-client';
import { type DashboardOverviewDto } from '../dto/api.dto';
import { dashboardFromDto } from '../dto/mappers';

@Injectable()
export class HttpDashboardRepository extends DashboardRepository {
  private readonly api = inject(ApiClient);

  override getOverview(range: DashboardRange, signal?: AbortSignal): Promise<DashboardOverview> {
    return this.api
      .get<DashboardOverviewDto>('/dashboard/overview', {
        params: { range },
        ...(signal !== undefined ? { signal } : {}),
      })
      .then(dashboardFromDto);
  }
}
