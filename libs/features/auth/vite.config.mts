import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets.mts';

export default defineConfig(
  angularConfig({ name: 'feature-auth', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
