import { defineConfig } from 'vitest/config';
import { tsLibConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  tsLibConfig({ name: 'core-domain', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
