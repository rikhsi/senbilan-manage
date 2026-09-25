import { defineConfig } from 'vitest/config';
import { tsLibConfig } from '../../../tools/vitest/presets.mts';

export default defineConfig(
  tsLibConfig({ name: 'core-application', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
