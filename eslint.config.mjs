import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import angularTemplateParser from '@angular-eslint/template-parser';
import noHardcodedTextPlugin from './tools/eslint-plugin/no-hardcoded-text.mjs';

/**
 * Architectural dependency rules.
 *
 * Every project carries two tags:
 *   layer:*  – FSD position (app | features | entities | shared | infra | core | e2e)
 *   kind:*   – technical role (see docs/ARCHITECTURE.md §Tags)
 *
 * Constraints are expressed on `kind` because it is the more precise axis.
 * A violation here fails `nx lint` and therefore CI.
 */
const depConstraints = [
  // --- pure TypeScript core -------------------------------------------------
  { sourceTag: 'kind:domain', onlyDependOnLibsWithTags: ['kind:util'] },
  { sourceTag: 'kind:application', onlyDependOnLibsWithTags: ['kind:domain', 'kind:util'] },

  // --- shared building blocks ---------------------------------------------
  { sourceTag: 'kind:util', onlyDependOnLibsWithTags: ['kind:util'] },
  {
    sourceTag: 'kind:util-ng',
    onlyDependOnLibsWithTags: ['kind:util', 'kind:util-ng', 'kind:domain', 'kind:application'],
  },
  { sourceTag: 'kind:tokens', onlyDependOnLibsWithTags: [] },
  {
    sourceTag: 'kind:i18n',
    onlyDependOnLibsWithTags: ['kind:util', 'kind:util-ng', 'kind:application', 'kind:domain'],
  },
  {
    sourceTag: 'kind:ui',
    onlyDependOnLibsWithTags: ['kind:tokens', 'kind:ui', 'kind:util', 'kind:util-ng', 'kind:i18n'],
  },
  {
    // Taiga / Ionic wrappers + theme bridges (disposable; not design-system).
    sourceTag: 'kind:vendor',
    onlyDependOnLibsWithTags: [
      'kind:vendor',
      'kind:ui',
      'kind:tokens',
      'kind:util',
      'kind:util-ng',
      'kind:i18n',
    ],
  },
  {
    sourceTag: 'kind:platform',
    onlyDependOnLibsWithTags: [
      'kind:util',
      'kind:util-ng',
      'kind:application',
      'kind:domain',
      'kind:platform',
    ],
  },
  {
    sourceTag: 'kind:state',
    onlyDependOnLibsWithTags: [
      'kind:application',
      'kind:domain',
      'kind:util',
      'kind:util-ng',
      'kind:i18n',
      'kind:platform',
      'kind:state',
      'kind:tokens',
    ],
  },

  // --- adapters -----------------------------------------------------------
  {
    sourceTag: 'kind:infrastructure',
    onlyDependOnLibsWithTags: [
      'kind:application',
      'kind:domain',
      'kind:util',
      'kind:util-ng',
      'kind:platform',
      'kind:infrastructure',
    ],
  },

  // --- presentation -------------------------------------------------------
  {
    sourceTag: 'kind:entity',
    onlyDependOnLibsWithTags: [
      'kind:application',
      'kind:domain',
      'kind:ui',
      'kind:vendor',
      'kind:tokens',
      'kind:util',
      'kind:util-ng',
      'kind:i18n',
      'kind:state',
    ],
  },
  {
    sourceTag: 'kind:feature',
    onlyDependOnLibsWithTags: [
      'kind:entity',
      'kind:ui',
      'kind:vendor',
      'kind:tokens',
      'kind:state',
      'kind:application',
      'kind:domain',
      'kind:util',
      'kind:util-ng',
      'kind:i18n',
      'kind:platform',
    ],
  },

  // --- composition roots ---------------------------------------------------
  { sourceTag: 'kind:testing', onlyDependOnLibsWithTags: ['*'] },
  { sourceTag: 'kind:app', onlyDependOnLibsWithTags: ['*'] },
];

/** Design system must stay vendor-free (Taiga / Ionic only in vendors or apps). */
const dsVendorForbidden = [
  {
    group: ['@taiga-ui/*', '@ionic/*'],
    message:
      'design-system is vendor-free. Put Taiga/Ionic wrappers in @senbilan/vendors/ui or import stock kits only from apps/*.',
  },
];

/** Features/entities use DS or vendor wrappers — not raw kits. */
const presentationVendorForbidden = [
  {
    group: ['@taiga-ui/*', '@ionic/*'],
    message:
      'Import vendor kits only via @senbilan/vendors/ui wrappers, or stock components directly from apps/*.',
  },
];

/** Framework / browser packages that must never leak into the pure core. */
const coreForbiddenImports = [
  { group: ['@angular/*'], message: 'core/* is framework-agnostic: no Angular here.' },
  { group: ['rxjs', 'rxjs/*'], message: 'core/* must not depend on RxJS.' },
  {
    group: ['@ionic/*', '@taiga-ui/*', '@angular/cdk*'],
    message: 'UI libraries are not allowed in core/*.',
  },
  { group: ['@ngrx/*', '@tanstack/*'], message: 'State libraries are not allowed in core/*.' },
  { group: ['@capacitor/*', '@sentry/*'], message: 'Platform SDKs are not allowed in core/*.' },
];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/storybook-static',
      '**/.angular',
      '**/android',
      '**/ios',
      '**/vitest.config.*.timestamp*',
      'libs/infra/openapi/src/lib/generated/**',
      'libs/infra/openapi/openapi/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          banTransitiveDependencies: true,
          allowCircularSelfDependency: false,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints,
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public', overrides: { parameterProperties: 'off' } },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-nested-ternary': 'error',
      'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // Pure core: no framework code at all.
    files: ['libs/core/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: coreForbiddenImports }],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'localStorage',
        'sessionStorage',
        'navigator',
        'fetch',
        'XMLHttpRequest',
      ],
    },
  },
  {
    files: ['libs/design-system/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: dsVendorForbidden }],
    },
  },
  {
    files: ['libs/features/**/*.ts', 'libs/entities/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: presentationVendorForbidden }],
    },
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.stories.ts',
      '**/testing/**/*.ts',
      '**/mock/**/*.ts',
      '**/.storybook/**/*.{ts,tsx}',
    ],
    rules: {
      'max-lines': 'off',
      'no-nested-ternary': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  {
    files: ['libs/infra/observability/**/*.ts'],
    rules: {
      'no-console': ['error', { allow: ['log', 'info', 'debug', 'warn', 'error'] }],
    },
  },
  {
    files: ['libs/features/**/*.html', 'libs/entities/**/*.html', 'libs/design-system/**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@senbilan': noHardcodedTextPlugin,
    },
    rules: {
      // Start as warn — tighten to error once backlog is clean.
      '@senbilan/no-hardcoded-text': 'warn',
    },
  },
  {
    files: ['libs/features/**/*.ts', 'libs/entities/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.stories.ts', '**/testing/**', '**/i18n/**'],
    plugins: {
      '@senbilan': noHardcodedTextPlugin,
    },
    rules: {
      '@senbilan/no-hardcoded-text-ts': 'warn',
    },
  },
  eslintConfigPrettier,
];
