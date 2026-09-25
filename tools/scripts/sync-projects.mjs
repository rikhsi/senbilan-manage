/**
 * Keeps generated project boilerplate consistent. Idempotent — run after adding a project:
 *   node tools/scripts/sync-projects.mjs
 *
 * 1. vite.config.mts  → uses the shared presets from tools/vitest/presets.ts
 * 2. project.json     → `typecheck` target: Angular projects use `ngc` (templates are
 *                        type-checked with strictTemplates), plain TS libs use `tsc -b`.
 *                       `lint-styles` target is present on every project.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();

const walk = (dir, depth = 0) => {
  const out = [];
  if (!existsSync(dir)) return out;
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

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const projects = [...walk(join(root, 'apps')), ...walk(join(root, 'libs'))];

for (const projectDir of projects) {
  const projectFile = join(projectDir, 'project.json');
  const project = readJson(projectFile);
  const rel = relative(projectDir, root).split(sep).join('/');
  const isApp = existsSync(join(projectDir, 'tsconfig.app.json'));
  const isE2e = project.tags?.includes('layer:e2e') || projectDir.endsWith('-e2e');
  const tsconfig = existsSync(join(projectDir, 'tsconfig.json'))
    ? readJson(join(projectDir, 'tsconfig.json'))
    : {};
  const isAngular = Boolean(tsconfig.angularCompilerOptions) || isApp;
  const hasSpecConfig = existsSync(join(projectDir, 'tsconfig.spec.json'));

  // ---- 1. vite config ---------------------------------------------------------
  if (hasSpecConfig && !isE2e) {
    const preset = isAngular ? 'angularConfig' : 'tsLibConfig';
    const content = `import { defineConfig } from 'vitest/config';
import { ${preset} } from '${rel}/tools/vitest/presets';

export default defineConfig(
  ${preset}({ name: '${project.name}', root: import.meta.dirname, workspaceRoot: '${rel}' }),
);
`;
    writeFileSync(join(projectDir, 'vite.config.mts'), content);
  }

  // ---- 2. typecheck target ----------------------------------------------------
  const steps = [];
  if (isE2e) {
    steps.push('tsc -p tsconfig.json --noEmit');
  } else if (isApp) {
    steps.push('ngc -p tsconfig.app.json --noEmit');
    if (hasSpecConfig) steps.push('tsc -p tsconfig.spec.json --noEmit');
  } else if (isAngular) {
    steps.push('ngc -p tsconfig.lib.json --noEmit');
    if (hasSpecConfig) steps.push('tsc -p tsconfig.spec.json --noEmit');
  } else {
    steps.push('tsc -b tsconfig.json --noEmit');
  }

  project.targets ??= {};
  project.targets.typecheck = {
    executor: 'nx:run-commands',
    options: { cwd: '{projectRoot}', commands: steps, parallel: false },
  };
  project.targets['lint-styles'] ??= {};
  writeJson(projectFile, project);
  console.log(
    `synced ${relative(root, projectDir)} (${isE2e ? 'e2e' : isApp ? 'app' : isAngular ? 'angular lib' : 'ts lib'})`,
  );
}
