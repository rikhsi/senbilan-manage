import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({ name: 'design-system-ui', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
