import type { StorybookConfig } from '@storybook/angular';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { mergeConfig } from 'vite';

const require = createRequire(import.meta.url);

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-themes'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/angular'),
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      css: {
        preprocessorOptions: {
          scss: {
            // Same include path apps use via stylePreprocessorOptions
            loadPaths: ['libs/design-system/tokens/src/styles'],
          },
        },
      },
    });
  },
};

export default config;
