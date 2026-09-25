#!/usr/bin/env node
/**
 * Compare i18n keys across ru / en / uz for:
 *   - apps/.../public/assets/i18n
 *   - libs/features/.../src/lib/i18n
 *   - libs/entities/.../src/lib/i18n (if present)
 *
 * Flags:
 *   --unused       Report keys present in all locales but never referenced in
 *                  source (heuristic). Exit 0 unless --unused-fail is also set.
 *   --unused-fail  Treat unused keys as failures (with --unused).
 *
 * Also runs tools/scripts/no-hardcoded-text.mjs (template letter scan).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const LOCALES = ['ru', 'en', 'uz'];
const args = new Set(process.argv.slice(2));
const reportUnused = args.has('--unused') || args.has('--unused-fail');
const unusedFail = args.has('--unused-fail');

const flattenKeys = (value, prefix = '', out = new Set()) => {
  if (value === null || value === undefined) {
    return out;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    if (prefix) {
      out.add(prefix);
    }
    return out;
  }
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      flattenKeys(child, next, out);
    } else {
      out.add(next);
    }
  }
  return out;
};

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON: ${file} (${error instanceof Error ? error.message : error})`);
  }
};

const walkDirs = (dir, depth = 0, acc = []) => {
  if (!existsSync(dir)) {
    return acc;
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory() || entry === 'node_modules') {
      continue;
    }
    if (entry === 'i18n' || full.endsWith(`${join('assets', 'i18n')}`)) {
      acc.push(full);
    } else if (depth < 5) {
      walkDirs(full, depth + 1, acc);
    }
  }
  return acc;
};

const groupLocaleFiles = (dir) => {
  const groups = new Map();
  if (!existsSync(dir)) {
    return groups;
  }
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.json')) {
      continue;
    }
    const base = name.slice(0, -'.json'.length);
    for (const locale of LOCALES) {
      if (base === locale) {
        const key = '_root';
        if (!groups.has(key)) {
          groups.set(key, {});
        }
        groups.get(key)[locale] = join(dir, name);
        break;
      }
      if (base.endsWith(`.${locale}`)) {
        const scope = base.slice(0, -(locale.length + 1));
        if (!groups.has(scope)) {
          groups.set(scope, {});
        }
        groups.get(scope)[locale] = join(dir, name);
        break;
      }
    }
  }
  return groups;
};

const walkSourceFiles = (dir, acc = []) => {
  if (!existsSync(dir)) {
    return acc;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'out-tsc') {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(full, acc);
      continue;
    }
    if (/\.(ts|html|mjs|js)$/.test(entry.name) && !entry.name.includes('.spec.')) {
      acc.push(full);
    }
  }
  return acc;
};

const i18nDirs = [
  ...walkDirs(join(root, 'apps')),
  ...walkDirs(join(root, 'libs', 'features')),
  ...walkDirs(join(root, 'libs', 'entities')),
  ...walkDirs(join(root, 'libs', 'shared', 'i18n')),
].filter((dir) => {
  const rel = relative(root, dir).split('\\').join('/');
  return rel.includes('/i18n') || rel.endsWith('/i18n') || rel.includes('assets/i18n');
});

const uniqueDirs = [...new Set(i18nDirs.map((d) => d.split('\\').join('/')))];

let failed = false;
const problems = [];
const allKeysByGroup = new Map();

for (const dir of uniqueDirs) {
  const groups = groupLocaleFiles(dir);
  if (groups.size === 0) {
    continue;
  }

  for (const [groupName, files] of groups) {
    const present = LOCALES.filter((locale) => files[locale]);
    const missingLocales = LOCALES.filter((locale) => !files[locale]);

    if (missingLocales.length > 0 && present.length > 0) {
      failed = true;
      problems.push({
        dir: relative(root, dir).split('\\').join('/'),
        group: groupName,
        message: `missing locale file(s): ${missingLocales.join(', ')}`,
      });
    }

    if (present.length < 2) {
      continue;
    }

    const keySets = Object.fromEntries(
      present.map((locale) => [locale, flattenKeys(readJson(files[locale]))]),
    );
    const union = new Set(present.flatMap((locale) => [...keySets[locale]]));
    const groupId = `${relative(root, dir).split('\\').join('/')}:${groupName}`;
    allKeysByGroup.set(groupId, union);

    for (const locale of present) {
      const missing = [...union].filter((key) => !keySets[locale].has(key)).sort();
      if (missing.length > 0) {
        failed = true;
        problems.push({
          dir: relative(root, dir).split('\\').join('/'),
          group: groupName,
          message: `${locale} missing keys (${missing.length}): ${missing.slice(0, 12).join(', ')}${
            missing.length > 12 ? `, …+${missing.length - 12}` : ''
          }`,
        });
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`i18n:check — ${problems.length} problem(s):\n`);
  for (const p of problems) {
    const label = p.group === '_root' ? p.dir : `${p.dir} [${p.group}]`;
    console.error(`  ${label}: ${p.message}`);
  }
} else {
  console.log(`i18n:check — OK (${uniqueDirs.length} folder(s), locales ${LOCALES.join('/')})`);
}

if (reportUnused) {
  const corpus = [
    ...walkSourceFiles(join(root, 'apps')),
    ...walkSourceFiles(join(root, 'libs', 'features')),
    ...walkSourceFiles(join(root, 'libs', 'entities')),
    ...walkSourceFiles(join(root, 'libs', 'design-system')),
  ]
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

  const unused = [];
  for (const [groupId, keys] of allKeysByGroup) {
    for (const key of keys) {
      const candidates = [key];
      const scopeGuess = groupId.split(':').pop();
      if (scopeGuess && scopeGuess !== '_root' && !key.startsWith(`${scopeGuess}.`)) {
        candidates.push(`${scopeGuess}.${key}`);
      }
      if (!candidates.some((c) => corpus.includes(c))) {
        unused.push(`${groupId} → ${key}`);
      }
    }
  }

  if (unused.length > 0) {
    const msg = `i18n:check — ${unused.length} possibly unused key(s) (heuristic):\n${unused
      .slice(0, 40)
      .map((u) => `  ${u}`)
      .join('\n')}${unused.length > 40 ? `\n  …+${unused.length - 40} more` : ''}`;
    if (unusedFail) {
      console.error(msg);
      failed = true;
    } else {
      console.warn(msg);
    }
  } else {
    console.log('i18n:check — no unused keys detected (heuristic)');
  }
}

const hardcoded = spawnSync(process.execPath, [join(root, 'tools/scripts/no-hardcoded-text.mjs')], {
  cwd: root,
  stdio: 'inherit',
});

if (hardcoded.status !== 0) {
  failed = true;
}

process.exit(failed ? 1 : 0);
