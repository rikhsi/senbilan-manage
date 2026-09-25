import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({ name: 'feature-profile', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
