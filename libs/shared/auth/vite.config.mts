import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({ name: 'shared-auth', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
