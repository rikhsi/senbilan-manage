import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets.mts';

export default defineConfig(
  angularConfig({ name: 'design-system-layout', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
