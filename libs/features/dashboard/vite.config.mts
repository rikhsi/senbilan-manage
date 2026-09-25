import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({
    name: 'feature-dashboard',
    root: import.meta.dirname,
    workspaceRoot: '../../..',
  }),
);
