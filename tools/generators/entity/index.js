/**
 * @param {import('@nx/devkit').Tree} tree
 * @param {{ name: string }} schema
 */
async function generateEntity(tree, schema) {
  const {
    names,
    formatFiles,
    generateFiles,
    joinPathFragments,
    updateJson,
  } = require('@nx/devkit');
  const path = require('node:path');

  const n = names(schema.name);
  const entityName = n.fileName;
  const projectName = `entity-${entityName}`;
  const dir = joinPathFragments('libs/entities', entityName);

  if (tree.exists(joinPathFragments(dir, 'project.json'))) {
    throw new Error(`Entity already exists: ${dir}`);
  }

  const depth = dir.split(/[/\\]/).length;
  const offsetFromRoot = Array(depth).fill('..').join('/');

  generateFiles(tree, path.join(__dirname, 'files'), dir, {
    tmpl: '',
    entityName,
    projectName,
    className: n.className,
    propertyName: n.propertyName,
    offsetFromRoot,
    sourceRoot: `${dir}/src`.replace(/\\/g, '/'),
  });

  updateJson(tree, 'tsconfig.base.json', (json) => {
    json.compilerOptions ??= {};
    json.compilerOptions.paths ??= {};
    json.compilerOptions.paths[`@senbilan/entities/${entityName}`] = [
      `./${dir}/src/index.ts`.replace(/\\/g, '/'),
    ];
    return json;
  });

  await formatFiles(tree);
  return () => {
    console.log(`\nCreated ${projectName} at ${dir}`);
  };
}

module.exports = generateEntity;
module.exports.default = generateEntity;
