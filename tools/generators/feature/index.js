/**
 * @param {import('@nx/devkit').Tree} tree
 * @param {{ name: string; directory?: string }} schema
 */
async function generateFeature(tree, schema) {
  const {
    names,
    formatFiles,
    generateFiles,
    joinPathFragments,
    updateJson,
  } = require('@nx/devkit');
  const path = require('node:path');

  const n = names(schema.name);
  const featureName = n.fileName;
  const projectName = `feature-${featureName}`;
  const classPrefix = featureName;
  const dir = schema.directory
    ? joinPathFragments('libs/features', schema.directory, featureName)
    : joinPathFragments('libs/features', featureName);

  if (tree.exists(joinPathFragments(dir, 'project.json'))) {
    throw new Error(`Feature already exists: ${dir}`);
  }

  const depth = dir.split(/[/\\]/).length;
  const offsetFromRoot = Array(depth).fill('..').join('/');

  generateFiles(tree, path.join(__dirname, 'files'), dir, {
    tmpl: '',
    featureName,
    projectName,
    classPrefix,
    className: n.className,
    propertyName: n.propertyName,
    offsetFromRoot,
    sourceRoot: `${dir}/src`.replace(/\\/g, '/'),
    constantName: n.constantName,
  });

  updateJson(tree, 'tsconfig.base.json', (json) => {
    json.compilerOptions ??= {};
    json.compilerOptions.paths ??= {};
    json.compilerOptions.paths[`@senbilan/features/${featureName}`] = [
      `./${dir}/src/index.ts`.replace(/\\/g, '/'),
    ];
    return json;
  });

  await formatFiles(tree);
  return () => {
    console.log(`\nCreated ${projectName} at ${dir}`);
    console.log(`Import as @senbilan/features/${featureName}`);
  };
}

module.exports = generateFeature;
module.exports.default = generateFeature;
