/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are forbidden at file level. Fix the design, do not lazy-import around it.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'libs-use-public-api-of-other-libs',
      severity: 'error',
      comment: 'Libraries are consumed only through their public API (@senbilan/<group>/<name>).',
      from: { path: '^(libs/[^/]+/[^/]+)/' },
      to: { path: '^libs/[^/]+/[^/]+/src/(?!index\\.ts$)', pathNot: '^$1/' },
    },
    {
      name: 'apps-use-public-api-of-libs',
      severity: 'error',
      from: { path: '^apps/' },
      to: { path: '^libs/[^/]+/[^/]+/src/(?!index\\.ts$)' },
    },
    {
      name: 'core-is-framework-free',
      severity: 'error',
      comment: 'core/domain and core/application must not depend on Angular, RxJS or any UI/state library.',
      from: { path: '^libs/core/' },
      to: {
        path: [
          '^node_modules/@angular/',
          '^node_modules/rxjs',
          '^node_modules/@ionic/',
          '^node_modules/@taiga-ui/',
          '^node_modules/@ngrx/',
          '^node_modules/@tanstack/',
          '^node_modules/@capacitor/',
          '^node_modules/@sentry/',
        ],
      },
    },
    {
      name: 'domain-depends-only-on-domain',
      severity: 'error',
      from: { path: '^libs/core/domain/' },
      to: { path: '^libs/', pathNot: ['^libs/core/domain/', '^libs/shared/util/'] },
    },
    {
      name: 'application-does-not-touch-infra-or-ui',
      severity: 'error',
      from: { path: '^libs/core/application/' },
      to: {
        path: '^libs/',
        pathNot: ['^libs/core/', '^libs/shared/util/'],
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$',
          '\\.d\\.ts$',
          '(^|/)tsconfig\\.json$',
          '(^|/)(babel|webpack|vite|vitest)\\.config\\.(js|cjs|mjs|ts|mts)$',
          '\\.stories\\.ts$',
          '\\.spec\\.ts$',
          'test-setup\\.ts$',
          'index\\.ts$',
        ],
      },
      to: {},
    },
    {
      name: 'not-to-spec',
      severity: 'error',
      from: { pathNot: '\\.spec\\.ts$' },
      to: { path: '\\.spec\\.ts$' },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment: 'Production code must not import devDependencies (test tooling, storybook…).',
      from: {
        path: '^(apps|libs)/',
        pathNot: ['\\.spec\\.ts$', '\\.stories\\.ts$', 'test-setup\\.ts$', '^libs/shared/testing/', '^libs/infra/mock/', '\\.storybook/'],
      },
      to: { dependencyTypes: ['npm-dev'], pathNot: ['^node_modules/@types/'] },
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules'] },
    includeOnly: '^(apps|libs)/',
    exclude: { path: ['\\.spec\\.ts$', '\\.stories\\.ts$', 'test-setup\\.ts$', 'vite\\.config\\.mts$'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      dot: { collapsePattern: '^(apps|libs)/[^/]+/[^/]+' },
      text: { highlightFocused: true },
    },
  },
};
