import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  AuthRepository,
  DashboardRepository,
  NotificationRepository,
  PermissionRepository,
  RoleRepository,
  UserRepository,
  AdminCatalogRepository,
} from '@senbilan/core/application';
import { ApiClient } from './http/api-client';
import {
  apiBaseUrlInterceptor,
  authInterceptor,
  correlationIdInterceptor,
  errorNormalizationInterceptor,
  loggingInterceptor,
  retryInterceptor,
  timeoutInterceptor,
} from './http/interceptors';
import { HttpAdminCatalogRepository } from './repositories/http-admin-catalog.repository';
import { HttpAuthRepository } from './repositories/http-auth.repository';
import { HttpDashboardRepository } from './repositories/http-dashboard.repository';
import { HttpNotificationRepository } from './repositories/http-notification.repository';
import { HttpPermissionRepository } from './repositories/http-permission.repository';
import { HttpRoleRepository } from './repositories/http-role.repository';
import { HttpUserRepository } from './repositories/http-user.repository';

/**
 * Registers HttpClient, interceptors (order: correlation → baseUrl → auth → timeout →
 * retry → errorNormalization → logging), ApiClient, and HTTP repository bindings.
 *
 * Compose with `provideMockApi()` after this call so mock repositories can
 * override HTTP bindings when `features.mockApi` is true.
 */
export const provideApi = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideHttpClient(
      withInterceptors([
        correlationIdInterceptor,
        apiBaseUrlInterceptor,
        authInterceptor,
        timeoutInterceptor,
        retryInterceptor,
        errorNormalizationInterceptor,
        loggingInterceptor,
      ]),
    ),
    ApiClient,
    HttpAuthRepository,
    HttpUserRepository,
    HttpRoleRepository,
    HttpPermissionRepository,
    HttpNotificationRepository,
    HttpDashboardRepository,
    HttpAdminCatalogRepository,
    { provide: AuthRepository, useExisting: HttpAuthRepository },
    { provide: UserRepository, useExisting: HttpUserRepository },
    { provide: RoleRepository, useExisting: HttpRoleRepository },
    { provide: PermissionRepository, useExisting: HttpPermissionRepository },
    { provide: NotificationRepository, useExisting: HttpNotificationRepository },
    { provide: DashboardRepository, useExisting: HttpDashboardRepository },
    { provide: AdminCatalogRepository, useExisting: HttpAdminCatalogRepository },
  ]);
