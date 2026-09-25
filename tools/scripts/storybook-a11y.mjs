#!/usr/bin/env node
/**
 * Builds Storybook (if needed), serves the static build, runs @storybook/test-runner
 * with axe-playwright checks from `.storybook/test-runner.ts`.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const staticDir = join(root, 'libs/design-system/ui/storybook-static');
const port = process.env.STORYBOOK_A11Y_PORT || '6006';
const url = `http://127.0.0.1:${port}`;

const run = (command, args, opts = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...opts,
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited ${code}`));
      }
    });
  });

const main = async () => {
  if (!existsSync(staticDir) || process.env.STORYBOOK_A11Y_REBUILD === '1') {
    console.log('storybook:a11y — building Storybook…');
    await run('npx', ['nx', 'build-storybook', 'design-system-ui']);
  }

  console.log(`storybook:a11y — serving ${staticDir} on ${url}`);
  const server = spawn('npx', ['http-server', staticDir, '-p', port, '-c-1', '--silent'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  try {
    await run('npx', ['wait-on', `${url}/index.html`]);
    await run('npx', [
      'test-storybook',
      '--url',
      url,
      '--config-dir',
      'libs/design-system/ui/.storybook',
    ]);
  } finally {
    server.kill('SIGTERM');
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
