import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  AuthRepository,
  DashboardRepository,
  NotificationRepository,
  PermissionRepository,
  RoleRepository,
  UserRepository,
} from '@senbilan/core/application';
import {
  HttpAuthRepository,
  HttpDashboardRepository,
  HttpNotificationRepository,
  HttpPermissionRepository,
  HttpRoleRepository,
  HttpUserRepository,
} from '@senbilan/infra/api';
import { type AppConfig, APP_CONFIG } from '@senbilan/shared/config';
import { MockDataStore } from './mock-data.store';
import { MockAuthRepository } from './repositories/mock-auth.repository';
import { MockDashboardRepository } from './repositories/mock-dashboard.repository';
import { MockNotificationRepository } from './repositories/mock-notification.repository';
import { MockPermissionRepository } from './repositories/mock-permission.repository';
import { MockRoleRepository } from './repositories/mock-role.repository';
import { MockUserRepository } from './repositories/mock-user.repository';

export interface ProvideMockApiOptions {
  /**
   * Reserved — prefer `startMockWorker(apiBaseUrl)` when you need MSW on top of
   * the HTTP stack instead of mock repositories.
   */
  readonly startWorker?: boolean;
}

const pick =
  <TMock, THttp>(select: (config: AppConfig, mock: TMock, http: THttp) => TMock | THttp) =>
  (config: AppConfig, mock: TMock, http: THttp): TMock | THttp =>
    select(config, mock, http);

/**
 * Registers mock repository implementations and binds application ports to
 * mock **or** HTTP depending on `APP_CONFIG.features.mockApi`.
 *
 * ```ts
 * provideObservability(),
 * provideStorage(),
 * provideApi(),      // HttpClient + interceptors + Http*Repository classes
 * provideMockApi(),  // rebinds ports: mock when mockApi, else HTTP
 * ```
 *
 * Unit tests can inject `Mock*Repository` / `MockDataStore` directly without MSW.
 * For browser HTTP + MSW, keep `mockApi: false` (or skip mock repo binding) and
 * call `startMockWorker(environment.apiBaseUrl)`.
 */
export const provideMockApi = (_options: ProvideMockApiOptions = {}): EnvironmentProviders =>
  makeEnvironmentProviders([
    MockDataStore,
    MockAuthRepository,
    MockUserRepository,
    MockRoleRepository,
    MockPermissionRepository,
    MockNotificationRepository,
    MockDashboardRepository,
    {
      provide: AuthRepository,
      useFactory: pick((c, mock, http) => (c.features.mockApi ? mock : http)),
      deps: [APP_CONFIG, MockAuthRepository, HttpAuthRepository],
    },
    {
      provide: UserRepository,
      useFactory: pick((c, mock, http) => (c.features.mockApi ? mock : http)),
      deps: [APP_CONFIG, MockUserRepository, HttpUserRepository],
    },
    {
      provide: RoleRepository,
      useFactory: pick((c, mock, http) => (c.features.mockApi ? mock : http)),
      deps: [APP_CONFIG, MockRoleRepository, HttpRoleRepository],
    },
    {
      provide: PermissionRepository,
      useFactory: pick((c, mock, http) => (c.features.mockApi ? mock : http)),
      deps: [APP_CONFIG, MockPermissionRepository, HttpPermissionRepository],
    },
    {
      provide: NotificationRepository,
      useFactory: pick((c, mock, http) => (c.features.mockApi ? mock : http)),
      deps: [APP_CONFIG, MockNotificationRepository, HttpNotificationRepository],
    },
    {
      provide: DashboardRepository,
      useFactory: pick((c, mock, http) => (c.features.mockApi ? mock : http)),
      deps: [APP_CONFIG, MockDashboardRepository, HttpDashboardRepository],
    },
  ]);
