/**
 * Fetch admin OpenAPI (Swagger 2) and generate Angular clients split by service.
 *
 *   npm run openapi:sync
 *   npm run openapi:fetch
 *   npm run openapi:generate
 *
 * Credentials (never commit):
 *   OPENAPI_ADMIN_USER / OPENAPI_ADMIN_PASSWORD  — or `.env.local`
 *   OPENAPI_ADMIN_URL — defaults to https://api.senbilan.uz/docs/admin/openapi.json
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
loadEnv({ path: join(root, '.env.local') });
loadEnv({ path: join(root, '.env') });

const SPEC_OUT = join(root, 'libs/infra/openapi/openapi/admin.swagger.json');
const ORVAL_CONFIG = join(root, 'libs/infra/openapi/orval.config.ts');
const GENERATED_DIR = join(root, 'libs/infra/openapi/src/lib/generated');
const DEFAULT_URL = 'https://api.senbilan.uz/docs/admin/openapi.json';

/** gRPC-gateway service tags → short folder / client names */
const TAG_ALIASES = {
  AdminAuthService: 'auth',
  AdminBroadcastService: 'broadcast',
  AdminContentService: 'content',
  AdminCoupleService: 'couple',
  AdminMediaService: 'media',
  AdminStatsService: 'stats',
  AdminUserService: 'user',
};

const DEF_PREFIXES = ['senbilan.admin.v1.', 'senbilan.v1.', 'google.type.', 'google.rpc.'];

const aliasTag = (tag) => {
  if (TAG_ALIASES[tag]) {
    return TAG_ALIASES[tag];
  }
  return tag
    .replace(/^Admin/, '')
    .replace(/Service$/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
};

/** Shorten protobuf FQNs → local schema names (AdminUser, ListUsersResponse, …). */
const shortenDefName = (name) => {
  let next = name;
  for (const prefix of DEF_PREFIXES) {
    if (next.startsWith(prefix)) {
      next = next.slice(prefix.length);
      break;
    }
  }
  // Nested gRPC body types: AdminUserService.BlockUserBody → BlockUserBody
  next = next.replace(/^Admin\w+Service\./, '');
  return next || name;
};

const shortenOperationId = (operationId) => {
  if (typeof operationId !== 'string') {
    return operationId;
  }
  return operationId.replace(/^Admin\w+Service_/, '');
};

const rewriteRefs = (node, rename) => {
  if (Array.isArray(node)) {
    for (const item of node) {
      rewriteRefs(item, rename);
    }
    return;
  }
  if (!node || typeof node !== 'object') {
    return;
  }
  if (typeof node.$ref === 'string' && node.$ref.startsWith('#/definitions/')) {
    const from = node.$ref.slice('#/definitions/'.length);
    const to = rename.get(from) ?? shortenDefName(from);
    node.$ref = `#/definitions/${to}`;
  }
  for (const value of Object.values(node)) {
    rewriteRefs(value, rename);
  }
};

const normalizeSpec = (spec) => {
  const next = structuredClone(spec);

  // Tags
  for (const pathItem of Object.values(next.paths ?? {})) {
    if (!pathItem || typeof pathItem !== 'object') {
      continue;
    }
    for (const op of Object.values(pathItem)) {
      if (!op || typeof op !== 'object') {
        continue;
      }
      if (Array.isArray(op.tags)) {
        op.tags = op.tags.map(aliasTag);
      }
      if (typeof op.operationId === 'string') {
        op.operationId = shortenOperationId(op.operationId);
      }
    }
  }
  if (Array.isArray(next.tags)) {
    next.tags = next.tags.map((tag) => ({
      ...tag,
      name: aliasTag(tag.name),
    }));
  } else {
    next.tags = Object.values(TAG_ALIASES).map((name) => ({ name }));
  }

  // Definitions / $ref
  const definitions = next.definitions ?? {};
  const rename = new Map();
  for (const key of Object.keys(definitions)) {
    rename.set(key, shortenDefName(key));
  }
  // Resolve collisions by keeping the first and suffixing duplicates.
  const used = new Set();
  for (const [from, to] of rename) {
    let candidate = to;
    let i = 2;
    while (used.has(candidate)) {
      candidate = `${to}${i}`;
      i += 1;
    }
    used.add(candidate);
    rename.set(from, candidate);
  }
  const shortened = {};
  for (const [from, def] of Object.entries(definitions)) {
    shortened[rename.get(from)] = def;
  }
  next.definitions = shortened;
  rewriteRefs(next, rename);

  return next;
};

const fetchSpec = async () => {
  const url = process.env.OPENAPI_ADMIN_URL ?? DEFAULT_URL;
  const user = process.env.OPENAPI_ADMIN_USER;
  const password = process.env.OPENAPI_ADMIN_PASSWORD;

  if (!user || !password) {
    console.error(
      'Missing OPENAPI_ADMIN_USER / OPENAPI_ADMIN_PASSWORD.\n' +
        'Add them to .env.local (see .env.example) and retry.',
    );
    process.exit(1);
  }

  const auth = Buffer.from(`${user}:${password}`, 'utf8').toString('base64');
  console.log(`Fetching ${url} …`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Fetch failed: HTTP ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const raw = await response.json();
  const normalized = normalizeSpec(raw);
  mkdirSync(dirname(SPEC_OUT), { recursive: true });
  writeFileSync(SPEC_OUT, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');

  const tags = new Set();
  for (const pathItem of Object.values(normalized.paths ?? {})) {
    for (const op of Object.values(pathItem ?? {})) {
      if (op && typeof op === 'object' && Array.isArray(op.tags)) {
        op.tags.forEach((t) => tags.add(t));
      }
    }
  }
  console.log(`Wrote ${SPEC_OUT}`);
  console.log(`Services (tags): ${[...tags].sort().join(', ')}`);
};

const writeGeneratedBarrel = () => {
  const entries = readdirSync(GENERATED_DIR, { withFileTypes: true });
  const services = entries
    .filter((entry) => entry.isDirectory() && entry.name !== 'models')
    .map((entry) => entry.name)
    .sort();

  const lines = [
    '/**',
    ' * Auto-generated barrel — do not edit. Rewritten by openapi-sync.',
    ' */',
    '',
    "export * from './models';",
    ...services.map((name) => `export * from './${name}/${name}.service';`),
    '',
  ];
  writeFileSync(join(GENERATED_DIR, 'index.ts'), lines.join('\n'), 'utf8');
  console.log(`Barrel: ${services.join(', ')}`);
};

const normalizeLocalSpec = () => {
  const raw = JSON.parse(readFileSync(SPEC_OUT, 'utf8'));
  const normalized = normalizeSpec(raw);
  writeFileSync(SPEC_OUT, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  console.log(`Normalized definitions in ${SPEC_OUT}`);
  const sample = Object.keys(normalized.definitions ?? {}).slice(0, 8);
  console.log(`Sample models: ${sample.join(', ')}`);
};

const generate = async () => {
  normalizeLocalSpec();
  console.log('Running orval …');
  // Use the programmatic API — the orval CLI breaks with this workspace's
  // hoisted `commander` (terser pins an old major).
  const { generate: runOrval } = await import('orval');
  await runOrval(ORVAL_CONFIG);
  writeGeneratedBarrel();
};

const mode = process.argv[2] ?? 'sync';

if (mode === 'fetch') {
  await fetchSpec();
} else if (mode === 'generate') {
  await generate();
} else if (mode === 'sync') {
  await fetchSpec();
  await generate();
} else {
  console.error(`Unknown mode "${mode}". Use sync | fetch | generate.`);
  process.exit(1);
}
