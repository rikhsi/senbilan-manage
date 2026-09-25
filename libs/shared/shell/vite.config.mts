import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({ name: 'shared-shell', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
