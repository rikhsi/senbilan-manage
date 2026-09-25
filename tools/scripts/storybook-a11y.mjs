#!/usr/bin/env node
/**
 * Documents Storybook a11y workflow. `@storybook/addon-a11y` is already wired in
 * `libs/design-system/ui/.storybook/main.ts`. CI runs `build-storybook`.
 *
 * Automated `@storybook/test-runner` is not installed (heavy + needs a static
 * server). Use the Accessibility panel locally, or add test-runner later.
 */
console.log(`
storybook:a11y
──────────────
• Addon: @storybook/addon-a11y (enabled in design-system-ui .storybook/main.ts)
• Local:  npm run storybook  → open any story → "Accessibility" panel
• CI:     npm run build-storybook (compiles stories; addon ships with the build)

To add automated axe checks later:
  npm i -D @storybook/test-runner
  npx test-storybook --url http://127.0.0.1:6006
`);
process.exit(0);
