/**
 * Rewrites every project's vite.config.mts to use the shared presets in tools/vitest/presets.mts.
 * Idempotent; run after generating a new project: `node tools/scripts/sync-vitest-configs.mjs`.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();

const walk = (dir, depth = 0) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory() || entry === 'node_modules') continue;
    if (existsSync(join(full, 'project.json'))) {
      out.push(full);
    } else if (depth < 2) {
      out.push(...walk(full, depth + 1));
    }
  }
  return out;
};

const projects = [...walk(join(root, 'apps')), ...walk(join(root, 'libs'))];

for (const projectDir of projects) {
  const project = JSON.parse(readFileSync(join(projectDir, 'project.json'), 'utf8'));
  const hasSpecConfig = existsSync(join(projectDir, 'tsconfig.spec.json'));
  if (!hasSpecConfig) continue;

  const isAngular = existsSync(join(projectDir, 'src', 'test-setup.ts'));
  const rel = relative(projectDir, root).split(sep).join('/');
  const preset = isAngular ? 'angularConfig' : 'tsLibConfig';
  const content = `import { defineConfig } from 'vitest/config';
import { ${preset} } from '${rel}/tools/vitest/presets.mts';

export default defineConfig(
  ${preset}({ name: '${project.name}', root: import.meta.dirname, workspaceRoot: '${rel}' }),
);
`;
  const target = join(projectDir, 'vite.config.mts');
  const legacy = join(projectDir, 'vitest.config.mts');
  writeFileSync(target, content);
  if (existsSync(legacy)) {
    writeFileSync(legacy, content);
  }
  console.log(`synced ${relative(root, target)}`);
}
