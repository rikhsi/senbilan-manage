# @senbilan/workspace generators

Local Nx generators for Senbilan Manage scaffolding.

## Invoke

```bash
npx nx g @senbilan/workspace:feature users
npx nx g @senbilan/workspace:entity order
npx nx g @senbilan/workspace:ui-component chip
npx nx g @senbilan/workspace:use-case create-order --domain=orders
npx nx g @senbilan/workspace:repository order
```

Or via npm scripts:

```bash
npm run g:feature -- users
npm run g:entity -- order
npm run g:ui -- chip
npm run g:use-case -- create-order --domain=orders
npm run g:repository -- order
```

List:

```bash
npx nx list @senbilan/workspace
```
