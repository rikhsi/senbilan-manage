import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({ name: 'feature-users', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
