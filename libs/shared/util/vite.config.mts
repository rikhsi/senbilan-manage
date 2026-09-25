import { defineConfig } from 'vitest/config';
import { tsLibConfig } from '../../../tools/vitest/presets.mts';

export default defineConfig(
  tsLibConfig({ name: 'shared-util', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
