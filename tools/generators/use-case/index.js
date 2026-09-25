/**
 * @param {import('@nx/devkit').Tree} tree
 * @param {{ name: string; domain?: string }} schema
 */
async function generateUseCase(tree, schema) {
  const { names, formatFiles, generateFiles, joinPathFragments } = require('@nx/devkit');
  const path = require('node:path');

  const n = names(schema.name);
  const fileName = n.fileName.endsWith('.use-case')
    ? n.fileName.replace(/\.use-case$/, '')
    : n.fileName;
  const className = n.className.endsWith('UseCase') ? n.className : `${n.className}UseCase`;
  const domain = names(schema.domain || 'shared').fileName;
  const folder = joinPathFragments('libs/core/application/src/lib/use-cases', domain);
  const target = joinPathFragments(folder, `${fileName}.use-case.ts`);

  if (tree.exists(target)) {
    throw new Error(`Use case already exists: ${target}`);
  }

  generateFiles(tree, path.join(__dirname, 'files'), folder, {
    tmpl: '',
    fileName,
    className,
    domain,
  });

  const indexPath = 'libs/core/application/src/index.ts';
  const index = tree.read(indexPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/use-cases/${domain}/${fileName}.use-case';\n`;
  if (!index.includes(exportLine.trim())) {
    tree.write(indexPath, `${index.trimEnd()}\n${exportLine}`);
  }

  await formatFiles(tree);
  return () => {
    console.log(`\nCreated ${className} at ${target}`);
  };
}

module.exports = generateUseCase;
module.exports.default = generateUseCase;
