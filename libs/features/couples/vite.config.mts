import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({
    name: 'feature-couples',
    root: import.meta.dirname,
    workspaceRoot: '../../..',
  }),
);
