/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';
import { type UserConfig } from 'vitest/config';

interface PresetOptions {
  /** Project name shown in the reporter, e.g. `feature-users`. */
  name: string;
  /** Absolute path of the project root (`import.meta.dirname`). */
  root: string;
  /** Path from the project root to the workspace root, e.g. `../../..`. */
  workspaceRoot: string;
}

const base = ({ name, root, workspaceRoot }: PresetOptions): UserConfig => ({
  root,
  cacheDir: `${workspaceRoot}/node_modules/.vite/${name}`,
  plugins: [tsconfigPaths({ root: workspaceRoot })],
  test: {
    name,
    watch: false,
    globals: true,
    passWithNoTests: true,
    include: ['src/**/*.{test,spec}.{ts,mts}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: `${workspaceRoot}/coverage/${name}`,
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.stories.ts', 'src/index.ts', 'src/test-setup.ts', 'src/testing/**'],
    },
  },
});

/** Pure TypeScript library: node environment, no Angular compiler. */
export const tsLibConfig = (options: PresetOptions): UserConfig => {
  const config = base(options);
  return { ...config, test: { ...config.test, environment: 'node' } };
};

/** Angular library or application: jsdom + Analog Angular plugin + TestBed setup. */
export const angularConfig = (options: PresetOptions): UserConfig => {
  const config = base(options);
  return {
    ...config,
    plugins: [angular(), ...(config.plugins ?? [])],
    test: {
      ...config.test,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
    },
  };
};
