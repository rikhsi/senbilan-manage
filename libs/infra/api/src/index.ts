export {
  SKIP_AUTH,
  RETRY_POLICY,
  TIMEOUT_MS,
  SILENT_ERRORS,
  DEFAULT_RETRY_POLICY,
  type RetryPolicy,
} from './lib/http/http-context.tokens';
export { ApiClient, type ApiEnvelope, type ApiRequestOptions } from './lib/http/api-client';
export { mapHttpErrorToAppError, type ApiErrorBody } from './lib/http/map-http-error';
export { toHttpParams } from './lib/http/page-params';
export {
  correlationIdInterceptor,
  authInterceptor,
  timeoutInterceptor,
  retryInterceptor,
  errorNormalizationInterceptor,
  loggingInterceptor,
} from './lib/http/interceptors';

export * from './lib/dto/api.dto';
export {
  userFromDto,
  userToDto,
  roleFromDto,
  roleToDto,
  sessionFromDto,
  sessionToDto,
  tokensFromDto,
  authResultFromDto,
  notificationFromDto,
  permissionDescriptorFromDto,
  userWithRolesFromDto,
  dashboardFromDto,
} from './lib/dto/mappers';

export { HttpAuthRepository } from './lib/repositories/http-auth.repository';
export { HttpUserRepository } from './lib/repositories/http-user.repository';
export { HttpRoleRepository } from './lib/repositories/http-role.repository';
export { HttpPermissionRepository } from './lib/repositories/http-permission.repository';
export { HttpNotificationRepository } from './lib/repositories/http-notification.repository';
export { HttpDashboardRepository } from './lib/repositories/http-dashboard.repository';
export { provideApi } from './lib/provide-api';
