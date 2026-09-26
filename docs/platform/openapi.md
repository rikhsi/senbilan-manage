# Admin OpenAPI sync

Source: [admin Swagger UI](https://api.senbilan.uz/docs/admin) →
`/docs/admin/openapi.json` (Swagger 2.0 / gRPC-gateway).

## Library

`libs/infra/openapi` → `@senbilan/infra/openapi`

Orval generates **one Angular `*Service` per OpenAPI tag** after tags are
normalized to short names:

| Upstream tag            | Client folder |
| ----------------------- | ------------- |
| `AdminAuthService`      | `auth`        |
| `AdminBroadcastService` | `broadcast`   |
| `AdminContentService`   | `content`     |
| `AdminCoupleService`    | `couple`      |
| `AdminMediaService`     | `media`       |
| `AdminStatsService`     | `stats`       |
| `AdminUserService`      | `user`        |

Admin login: `POST /admin/v1/auth/login` (phone + password + `device_id`).
Token refresh/logout use the app API: `POST /v1/auth/refresh` and
`POST /v1/auth/logout` (refresh token in body).

Shared DTOs: `src/lib/generated/models`. Spec snapshot:
`openapi/admin.swagger.json`.

## Commands

| Script                     | Action                                  |
| -------------------------- | --------------------------------------- |
| `npm run openapi:sync`     | Fetch + generate (needs Basic auth env) |
| `npm run openapi:fetch`    | Spec only                               |
| `npm run openapi:generate` | Orval only (offline)                    |

Env (`.env.local`, never commit):

```env
OPENAPI_ADMIN_URL=https://api.senbilan.uz/docs/admin/openapi.json
OPENAPI_ADMIN_USER=
OPENAPI_ADMIN_PASSWORD=
```

Hand-written ports stay in `@senbilan/infra/api` and may wrap these services.
Do not edit `src/lib/generated/**` by hand.
