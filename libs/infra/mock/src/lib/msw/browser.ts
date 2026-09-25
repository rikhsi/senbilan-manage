import { type SetupWorker } from 'msw/browser';
import { createMockHandlers } from './handlers';

let worker: SetupWorker | null = null;

/**
 * Starts the MSW browser worker against `apiBaseUrl`. Safe to call multiple times.
 * Prefer mock repositories (`provideMockApi`) for unit tests — use the worker when
 * you want the real HTTP stack exercised in the browser.
 */
export const startMockWorker = async (apiBaseUrl: string): Promise<SetupWorker | null> => {
  if (typeof window === 'undefined') {
    return null;
  }
  if (worker) {
    return worker;
  }
  const { setupWorker } = await import('msw/browser');
  worker = setupWorker(...createMockHandlers(apiBaseUrl));
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
  return worker;
};

export const stopMockWorker = async (): Promise<void> => {
  if (worker) {
    worker.stop();
    worker = null;
  }
};
