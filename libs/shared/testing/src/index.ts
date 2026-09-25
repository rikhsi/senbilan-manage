export {
  FakeAuthRepository,
  FakeClock,
  InMemoryRoleRepository,
  InMemorySessionStorage,
  InMemoryUserRepository,
} from './lib/fakes';
export { buildPage, buildRole, buildSession, buildUser } from './lib/builders';
export { fakeRole, fakeSession, fakeUser } from './lib/fixtures';
export { createMockUseCase, type MockUseCase, type UseCaseLike } from './lib/mock-use-case';
export { createSpyRepo, type SpyRepo } from './lib/spy-repo';
export { createTestQueryClient, provideTestQueryClient } from './lib/provide-test-query-client';
export { getMswServer, resetMsw, setupMsw, setupMswForVitest, startMsw, stopMsw } from './lib/msw';
export {
  provideTestingPlatform,
  TESTING_APP_CONFIG,
  type ProvideTestingPlatformOptions,
} from './lib/provide-testing-platform';
export {
  renderWithProviders,
  type RenderWithProvidersOptions,
  type RenderWithProvidersResult,
} from './lib/render-with-providers';
