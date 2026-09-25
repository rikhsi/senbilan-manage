/**
 * @param {import('@nx/devkit').Tree} tree
 * @param {{ name: string }} schema
 */
async function generateRepository(tree, schema) {
  const { names, formatFiles, generateFiles, joinPathFragments } = require('@nx/devkit');
  const path = require('node:path');

  const n = names(schema.name.replace(/\.repository$/, '').replace(/Repository$/, ''));
  const fileName = n.fileName.endsWith('-repository')
    ? n.fileName.replace(/-repository$/, '')
    : n.fileName;
  const className = n.className.endsWith('Repository') ? n.className : `${n.className}Repository`;
  const folder = 'libs/core/application/src/lib/ports';
  const target = joinPathFragments(folder, `${fileName}.repository.ts`);

  if (tree.exists(target)) {
    throw new Error(`Repository already exists: ${target}`);
  }

  generateFiles(tree, path.join(__dirname, 'files'), folder, {
    tmpl: '',
    fileName,
    className,
  });

  const indexPath = 'libs/core/application/src/index.ts';
  const index = tree.read(indexPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/ports/${fileName}.repository';\n`;
  if (!index.includes(exportLine.trim())) {
    tree.write(indexPath, `${index.trimEnd()}\n${exportLine}`);
  }

  await formatFiles(tree);
  return () => {
    console.log(`\nCreated ${className} at ${target}`);
  };
}

module.exports = generateRepository;
module.exports.default = generateRepository;
