import { defineConfig } from 'vitest/config';
import { tsLibConfig } from '../../../tools/vitest/presets';

/** Node env: MSW server + QueryClient / spy helpers; no Angular TestBed. */
export default defineConfig(
  tsLibConfig({ name: 'shared-testing', root: import.meta.dirname, workspaceRoot: '../../..' }),
);
