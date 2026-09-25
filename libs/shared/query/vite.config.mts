import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({ name: 'shared-query', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
