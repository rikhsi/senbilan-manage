import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({ name: 'infra-mock', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
