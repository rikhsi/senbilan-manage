import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({
    name: 'design-system-layout',
    root: import.meta.dirname,
    workspaceRoot: '../../..',
  }),
);
