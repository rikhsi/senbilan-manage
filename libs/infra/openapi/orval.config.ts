import { defineConfig } from 'orval';

/**
 * Generates one Angular service per OpenAPI tag (admin domain services).
 * Tags are normalized to short names by `tools/scripts/openapi-sync.mjs`
 * before generation (broadcast, content, couple, stats, user).
 */
export default defineConfig({
  admin: {
    input: {
      target: './openapi/admin.swagger.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/lib/generated/services.ts',
      schemas: './src/lib/generated/models',
      client: 'angular',
      clean: true,
      prettier: true,
      indexFiles: true,
      override: {
        title: (title) => title.replace(/\s+/g, ''),
      },
    },
  },
});
