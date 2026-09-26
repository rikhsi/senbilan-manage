export {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PHONE,
  DEMO_ADMIN_PASSWORD,
  createMockDb,
  permissionDescriptors,
  ROLE_DEFS,
  type MockDb,
} from './lib/fixtures/mock-db';
export { getMockDb, resetMockDb, MockDataStore } from './lib/mock-data.store';
export { MockAuthRepository } from './lib/repositories/mock-auth.repository';
export { MockUserRepository } from './lib/repositories/mock-user.repository';
export { MockRoleRepository } from './lib/repositories/mock-role.repository';
export { MockPermissionRepository } from './lib/repositories/mock-permission.repository';
export { MockNotificationRepository } from './lib/repositories/mock-notification.repository';
export { MockDashboardRepository } from './lib/repositories/mock-dashboard.repository';
export { createMockHandlers } from './lib/msw/handlers';
export { startMockWorker, stopMockWorker } from './lib/msw/browser';
export { provideMockApi, type ProvideMockApiOptions } from './lib/provide-mock-api';
