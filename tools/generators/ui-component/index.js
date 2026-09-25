/**
 * @param {import('@nx/devkit').Tree} tree
 * @param {{ name: string }} schema
 */
async function generateUiComponent(tree, schema) {
  const { names, formatFiles, generateFiles, joinPathFragments } = require('@nx/devkit');
  const path = require('node:path');

  const n = names(schema.name.replace(/^app-/, ''));
  const fileName = n.fileName;
  const className = `App${n.className}Component`;
  const selector = `app-${fileName}`;
  const folder = joinPathFragments('libs/design-system/ui/src/lib', fileName);

  if (tree.exists(joinPathFragments(folder, `app-${fileName}.component.ts`))) {
    throw new Error(`UI component already exists: ${folder}`);
  }

  generateFiles(tree, path.join(__dirname, 'files'), folder, {
    tmpl: '',
    fileName,
    className,
    selector,
    classNameShort: n.className,
  });

  const indexPath = 'libs/design-system/ui/src/index.ts';
  const index = tree.read(indexPath, 'utf-8') ?? '';
  const exportLine = `export { ${className} } from './lib/${fileName}/app-${fileName}.component';\n`;
  if (!index.includes(exportLine.trim())) {
    tree.write(indexPath, `${index.trimEnd()}\n${exportLine}`);
  }

  await formatFiles(tree);
  return () => {
    console.log(`\nCreated ${className} (${selector})`);
    console.log('Remember to add a Storybook story.');
  };
}

module.exports = generateUiComponent;
module.exports.default = generateUiComponent;
