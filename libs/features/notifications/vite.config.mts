import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets.mts';

export default defineConfig(
  angularConfig({ name: 'feature-notifications', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
