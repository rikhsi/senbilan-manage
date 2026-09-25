import { defineConfig } from 'vitest/config';
import { angularConfig } from '../../../tools/vitest/presets';

export default defineConfig(
  angularConfig({
    name: 'infra-observability',
    root: import.meta.dirname,
    workspaceRoot: '../../..',
  }),
);
