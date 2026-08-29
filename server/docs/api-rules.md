# API Rules

## Base URL

```
/api/v1
```

## Response Format

All successful responses follow:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

Paginated list responses include:

```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Error Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

## HTTP Status Codes

| Code | Usage                                    |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 201  | Resource created                         |
| 400  | Validation error / bad request           |
| 401  | Authentication required or invalid token |
| 403  | Insufficient permissions                 |
| 404  | Resource not found                       |
| 409  | Conflict (duplicate resource)            |
| 429  | Rate limit exceeded                      |
| 500  | Internal server error                    |
| 503  | Service degraded (health check)          |

## Pagination

Query parameters:

- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20, max: 100)

Example: `GET /api/v1/properties?page=2&limit=10`

## Authentication

Protected routes require:

```
Authorization: Bearer <access_token>
```

Obtain tokens via `POST /api/v1/auth/login` or `POST /api/v1/auth/register` (requires `confirmPassword` matching `password`).

Verify email via `POST /api/v1/auth/verify-email`. Resend with `POST /api/v1/auth/resend-verification`.

Delete account via `DELETE /api/v1/users/me` with `{ password }` in the body.

Refresh expired access tokens via `POST /api/v1/auth/refresh` with the refresh token in the body.

## Sorting & Filtering

Property list supports:

- `sortBy` — `price`, `createdAt`, `viewCount`
- `sortOrder` — `asc`, `desc`
- `minPrice`, `maxPrice`, `type`, `listingType`, `status`, `city`, `bedrooms`
- `status` on public `GET /properties` — only `active` (default), `sold`, or `rented`; other values return 400
- `search` — Full-text search on title/description
- `lat`, `lng`, `radiusKm` — Geo-radius search (all three required). When combined with `search`, radius filtering uses `$geoWithin` instead of distance sorting so MongoDB accepts the query.

## Versioning

Current version: `v1`. All routes are prefixed with `/api/v1`.

## Rate Limiting

- Global: 200 requests per 15 minutes per IP
- Auth endpoints: 20 requests per 15 minutes per IP

## Notifications

`GET /api/v1/notifications` supports `unread=true` (unread only) or `unread=false` (read only). Omit for all.

`PATCH /api/v1/notifications/:id/read` is idempotent — re-marking an already-read notification does not change `readAt`.

## Documentation

Interactive Swagger UI: `/api/docs`
OpenAPI JSON: `/api/docs.json`

Swagger `servers` base URL is `/api/v1` — path annotations in `*.routes.js` must be **relative** (e.g. `/health`, `/auth/login`), not `/api/v1/health`.

On Windows, `swagger.js` normalizes glob paths to forward slashes so `swagger-jsdoc` discovers all route files.

### Orval / client generation

Shared component schemas, parameters, and error responses live in `server/src/config/swagger.schemas.js`. Each endpoint defines:

- `operationId` — stable function name for generated clients
- `summary` / `description` — human-readable docs
- Request body and query parameter schemas with examples
- Response schemas (`$ref` to `#/components/schemas/*`) including paginated wrappers
- Standard error responses (`400`, `401`, `403`, `404`, `409`, `429`)

Example Orval config (see `client/orval.config.js`):

```js
// client/orval.config.js — thin axios clients per tag, not react-query hooks
module.exports = defineConfig({
  buytly: {
    input: { target: specUrl },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/buytly.ts",
      client: "axios",
      override: {
        mutator: {
          path: "./src/lib/api/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
```

**Client generation workflow**

1. Keep the API server running (`cd server && npm run dev` locally, or point `OPENAPI_URL` at production).
2. Run the frontend (`cd client && npm run dev`) — Orval fetches `/api/docs.json` from the running API. After Swagger annotation changes, nodemon restarts the API and the client watcher regenerates clients.
3. Generated axios clients live under `client/src/api/generated/` (one file per OpenAPI tag). Types are in `buytly.schemas.ts`. `scripts/generate-orval-barrel.mjs` composes `buytlyApi` in `index.ts`. Import via `@/lib/api` (`buytlyApi`, types). Write React Query hooks in app code when needed.
4. Copy `client/.env.example` → `client/.env.local` and set `NEXT_PUBLIC_API_URL` and `OPENAPI_URL` (both required).
