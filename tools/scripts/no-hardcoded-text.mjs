#!/usr/bin/env node
/**
 * Scans Angular templates under libs/features, libs/entities, libs/design-system
 * for Text nodes with Latin/Cyrillic letters (outside {{ }} / BoundText).
 * Exit 1 on any hit.
 */
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { HARDCODED_COPY_RE } from '../eslint-plugin/no-hardcoded-text.mjs';

const require = createRequire(import.meta.url);
const parser = require('@angular-eslint/template-parser');

const root = process.cwd();
const SCAN_ROOTS = ['libs/features', 'libs/entities', 'libs/design-system'];
const INLINE_TEMPLATE_RE = /template:\s*`([\s\S]*?)`/g;

const walk = (dir, acc = []) => {
  if (!existsSync(dir)) {
    return acc;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.storybook') {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
      continue;
    }
    if (
      entry.name.endsWith('.html') ||
      (entry.name.endsWith('.ts') &&
        !entry.name.includes('.spec.') &&
        !entry.name.includes('.stories.') &&
        !entry.name.includes('.test.'))
    ) {
      acc.push(full);
    }
  }
  return acc;
};

/** Walk template AST without following circular sourceSpan / parent links. */
const collectTextHits = (templateSource, filePath) => {
  const hits = [];
  let ast;
  try {
    const result = parser.parseForESLint(templateSource, { filePath });
    ast = result.ast;
  } catch {
    return hits;
  }

  const seen = new WeakSet();
  const visit = (node) => {
    if (!node || typeof node !== 'object' || seen.has(node)) {
      return;
    }
    seen.add(node);

    if (
      node.type === 'Text' &&
      typeof node.value === 'string' &&
      HARDCODED_COPY_RE.test(node.value)
    ) {
      const text = node.value.trim();
      if (text) {
        hits.push(text);
      }
    }

    // Prefer structural children only (avoids AST metadata cycles).
    if (Array.isArray(node.nodes)) {
      node.nodes.forEach(visit);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(visit);
    }
    if (Array.isArray(node.attributes)) {
      node.attributes.forEach(visit);
    }
    if (Array.isArray(node.inputs)) {
      node.inputs.forEach(visit);
    }
    if (Array.isArray(node.outputs)) {
      node.outputs.forEach(visit);
    }
    if (Array.isArray(node.references)) {
      node.references.forEach(visit);
    }
    if (Array.isArray(node.variables)) {
      node.variables.forEach(visit);
    }
    if (node.template && typeof node.template === 'object') {
      visit(node.template);
    }
    if (node.value && typeof node.value === 'object') {
      visit(node.value);
    }
  };
  visit(ast);
  return hits;
};

const violations = [];

for (const relRoot of SCAN_ROOTS) {
  const absRoot = join(root, relRoot);
  if (!existsSync(absRoot) || !statSync(absRoot).isDirectory()) {
    continue;
  }
  for (const file of walk(absRoot)) {
    const source = readFileSync(file, 'utf8');
    const rel = relative(root, file).split('\\').join('/');

    if (file.endsWith('.html')) {
      for (const text of collectTextHits(source, file)) {
        violations.push({ file: rel, text });
      }
      continue;
    }

    INLINE_TEMPLATE_RE.lastIndex = 0;
    let match;
    while ((match = INLINE_TEMPLATE_RE.exec(source)) !== null) {
      for (const text of collectTextHits(match[1], `${file}.inline.html`)) {
        violations.push({ file: rel, text });
      }
    }
  }
}

if (violations.length === 0) {
  console.log('no-hardcoded-text — OK (no letter text nodes outside interpolations)');
  process.exit(0);
}

console.error(`no-hardcoded-text — ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}: "${v.text.length > 80 ? `${v.text.slice(0, 77)}…` : v.text}"`);
}
process.exit(1);
