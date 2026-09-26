# `@senbilan/infra/openapi`

Generated Angular HTTP clients for the **admin** OpenAPI surface
(`https://api.senbilan.uz/docs/admin`).

Clients are **split by backend service** (OpenAPI tag), not dumped into one god-service:

| Tag (source)            | Folder / client |
| ----------------------- | --------------- |
| `AdminBroadcastService` | `broadcast`     |
| `AdminContentService`   | `content`       |
| `AdminCoupleService`    | `couple`        |
| `AdminStatsService`     | `stats`         |
| `AdminUserService`      | `user`          |

Shared DTOs live under `src/lib/generated/models`.

## Sync

Credentials go in **`.env.local`** only (never commit):

```env
OPENAPI_ADMIN_URL=https://api.senbilan.uz/docs/admin/openapi.json
OPENAPI_ADMIN_USER=…
OPENAPI_ADMIN_PASSWORD=…
```

```sh
npm run openapi:sync       # fetch schema + generate
npm run openapi:fetch      # schema only → openapi/admin.swagger.json
npm run openapi:generate   # orval only (offline, uses committed schema)
```

Or via Nx: `nx run infra-openapi:openapi-sync`.

## Usage

```ts
import { UserService, BroadcastService } from '@senbilan/infra/openapi';

// Injectable Angular services — provide HttpClient in the app.
```

Hand-written port adapters stay in `@senbilan/infra/api` and may wrap these clients.
Do not put business rules in generated files — regenerate instead of editing.
