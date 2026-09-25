import { type RequestHandler } from 'msw';
import { setupServer, type SetupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

let server: SetupServer | null = null;

/** Creates (or replaces) the shared MSW node server with the given handlers. */
export const setupMsw = (...handlers: RequestHandler[]): SetupServer => {
  if (server) {
    server.close();
  }
  server = setupServer(...handlers);
  return server;
};

export const startMsw = (): void => {
  if (!server) {
    throw new Error('setupMsw() must be called before startMsw()');
  }
  server.listen({ onUnhandledRequest: 'error' });
};

export const resetMsw = (): void => {
  server?.resetHandlers();
};

export const stopMsw = (): void => {
  server?.close();
  server = null;
};

export const getMswServer = (): SetupServer | null => server;

/**
 * Creates an MSW server and wires Vitest lifecycle hooks (listen / reset / close).
 * Call once per test file with the handlers you need.
 */
export const setupMswForVitest = (...handlers: RequestHandler[]): SetupServer => {
  const instance = setupMsw(...handlers);
  beforeAll(() => startMsw());
  afterEach(() => resetMsw());
  afterAll(() => stopMsw());
  return instance;
};
