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

## Property create/update numeric fields

- **`price`** — positive **integer** (whole USD; no cents).
- **Location** — set only on **projects** (`location.coordinates` required `[lng, lat]` on project create; must not be `[0, 0]`). Unit (`property`) create/update payloads must not include `location`; the server copies the parent project’s location onto each unit (and re-syncs on unit update).
- **`area`** — optional; when set, positive number with **at most 2 decimal places** (sqm).
- **Floor plan `price`** — optional non-negative **integer** USD.
- **Floor plan `area`** — same rules as listing `area`.
- **`building`** — optional string (trimmed, max 50), e.g. block `"A"`. **`floor`** — optional **integer** from -5 to 300. Send `null` (or a blank `building`) to clear; cleared and never-set values are both omitted from responses. Neither is a material field, so editing them keeps an active unit active.

## Sorting & Filtering

Property list supports:

- `sortBy` — `price`, `createdAt`, `viewCount`
- `sortOrder` — `asc`, `desc`
- `minPrice`, `maxPrice`, `type`, `status`, `city`, `bedrooms`
- `status` on public `GET /properties` and `GET /projects` — omit for **active + sold**, or pass `active` or `sold` to filter; other values return 400
- Public `GET /properties/:id` — `active` and `sold` listings on public parent projects are visible without auth; other statuses require owner, agent, or admin
- `viewCount` — incremented on `GET /properties/:id` and `GET /projects/:id` (and slug) only for `active` records and only when the request is not from a user who can manage that listing (owner, agent, or admin)
- Public `GET /projects` — `kind`, `city`, geo radius, `search`, pagination; list items include `unitCount`, `priceMin`, `priceMax`
- Sites that hide prices ignore `minPrice`/`maxPrice` and `sortBy=price` on public lists — see [Hidden prices](#hidden-prices)
- `search` — Full-text search on title/description
- `lat`, `lng`, `radiusKm` — Geo-radius search (all three required). When combined with `search`, radius filtering uses `$geoWithin` instead of distance sorting so MongoDB accepts the query.

`GET /properties/:id/nearby` returns schools, medical facilities, and transit stops within 5 km using OpenStreetMap (Overpass API). The server tries multiple public Overpass mirrors (configurable via `OVERPASS_URL`) with a `User-Agent` header. Same visibility rules as `GET /properties/:id`. When all mirrors fail, the endpoint still returns 200 with empty categories and `unavailable: true` (failures are not cached).

`GET /catalog/nearby?lat=&lng=` uses the same Overpass lookup for dashboard map previews before a listing is saved (public, no auth).

## Hidden prices

A site with `features.hidePublicPrices: true` (Block 57) does not reveal listing prices to viewers who cannot manage the listing. **Managers** are the unit/project owner, its assigned agent, and admins of that site (the same rule as `canManageProperty` / `canManageProject`). Everyone else, including anonymous visitors and logged-in buyers, gets:

- units: `price: null` and `priceLabel: "Price on request"` (other fields unchanged);
- projects: `priceMin: null`, `priceMax: null` and `priceLabel: "Price on request"`.

Stored prices are never changed, and responses for sites without the flag are unchanged (no `priceLabel` key). Implemented in `src/shared/priceVisibility.js`; site flags come from the cached `siteService` site list (no per-listing queries).

| Read path                                                                                                                           | Rule                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /properties`, `GET /projects`, `GET /agents/:id/properties`                                                                    | Public, no auth: always hidden on such a site. `minPrice`/`maxPrice` are ignored and `sortBy=price` falls back to `createdAt`, so results do not reveal prices.                                                                                                    |
| `GET /properties/:id`, `GET /projects/:id`, `GET /projects/slug/:slug` (project + embedded `units`), `GET /projects/:id/properties` | Optional auth: hidden unless the caller manages the project (project range and all units) or the unit (that unit).                                                                                                                                                 |
| `GET /favorites`, `GET /bookings/my`, `GET /transactions/my`, `GET /transactions/:id`, `POST /transactions` response                | Populated `property` / `propertyId` is hidden unless the caller manages that unit. Transaction `amount` (the buyer's own offer) is not hidden.                                                                                                                     |
| `GET /platform/featured-listings`, `GET /platform/featured-projects` (Buytly)                                                       | The listing's **source** site decides, not the request site; no viewer counts as a manager. Hidden-price units never match `minPrice`/`maxPrice`, and with `sortBy=price` they are listed after all priced units (newest first) so position does not reveal price. |

Dashboard and moderation reads (`/properties/mine`, `/projects/mine`, `/admin/*`, `GET /bookings/agent`) and write responses (create/update/restore by a manager) keep real prices. Buytly platform admins moderating partner listings through `/admin/*` count as managers there.

## Versioning

Current version: `v1`. All routes are prefixed with `/api/v1`.

## Rate Limiting

- Global: 200 requests per 15 minutes per IP
- Auth endpoints: 20 requests per 15 minutes per IP
- Contact form (`POST /contact`): 10 requests per hour per IP

## Notifications

`GET /api/v1/notifications` supports:

- `unread=true` (unread only) or `unread=false` (read only). Omit for all.
- `type=booking|transaction|property|system|auth` — filter by notification category.

`PATCH /api/v1/notifications/:id/read` is idempotent — re-marking an already-read notification does not change `readAt`.

`DELETE /api/v1/notifications/:id` removes a notification for the authenticated user only.

Each notification includes a `data` object with optional `href` for client deep linking (e.g. `/dashboard-bookings?highlight=<id>`). Dashboard tables resolve `?highlight=` across pages and filters, scroll to the matching row, then remove the query param from the URL while the row highlight animation plays. Review notifications link to `/single-v1/<propertyId>#property-reviews`.

**Client polling:** Dashboard bell polls `GET /notifications/unread-count` every 30 seconds while the tab is focused. The header notification panel lists the eight most recent notifications (read and unread); unread rows stay visually highlighted and the subtitle shows the unread count. Mark-read, mark-all-read, and delete mutations optimistically update the React Query notification cache (badge count, header panel, and notifications page) before revalidating from the server. Clicking a notification refetches the related dashboard list queries (properties, bookings, transactions) so deep-linked rows show current server state without a manual refresh; tables with `?highlight=` also bypass stale placeholder data until the row is shown.

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

## Buytly platform marketplace (cross-site)

- Tenant sites (e.g. Buildwise, Block 57) scope `GET /properties` and `GET /projects` to their own `siteId` (`X-Site-Slug: buildwise`, `X-Site-Slug: block57`).
- The Buytly platform site (`X-Site-Slug: buytly`) uses `GET /platform/featured-listings` and `GET /platform/featured-projects` for the public marketplace: **Buytly first-party** active/sold listings plus partner tenants (opt-in rules). Use `partnersOnly=true` for partner-only feeds. Partner rows include `sourceSite.listingUrl` for off-site links; first-party rows use on-site URLs.
- Tenants with `platformListingPolicy: optIn` appear on the marketplace only when `visibleOnPlatform: true` on the **project** and each **unit** (defaults `false`). Sellers cannot set this flag — `PATCH /properties` and `PATCH /projects` reject `visibleOnPlatform` with **403**. Tenant-site owner JSON omits `visibleOnPlatform`.
- Buytly platform admins (`role: admin` on `X-Site-Slug: buytly`) set featuring via `PATCH /admin/properties/:id/platform-featured` and `PATCH /admin/projects/:id/platform-featured` with `{ visibleOnPlatform: boolean }` (target must be a partner tenant listing; enable only when status is `active` or `sold`; units require the parent project featured first).
- Public marketplace status filter: omit `status` → `active` + `sold`; `status=sold` or `status=active` narrows the set.
- Buytly platform admins (`role: admin` on the platform site) on `GET /admin/properties` and `GET /admin/projects`: omit `siteId` to list all active **tenant** partner sites plus the Buytly platform site; pass `?siteId=` to scope to one site.
- Contact inquiries are **never** cross-site: `GET /admin/inquiries` and `PATCH /admin/inquiries/:id` always use the request site (a `siteId` query is ignored), so Buytly platform admins only see Buytly inquiries and other sites' ids return 404.

**Client generation workflow**

1. Keep the API server running (`cd server && npm run dev` locally, or point `OPENAPI_URL` at production).
2. Run the frontend (`cd client && npm run dev`) — Orval fetches `/api/docs.json` from the running API. After Swagger annotation changes, nodemon restarts the API and the client watcher regenerates clients.
3. Generated axios clients live under `client/src/api/generated/` (one file per OpenAPI tag). Types are in `buytly.schemas.ts`. `scripts/generate-orval-barrel.mjs` composes `buytlyApi` in `index.ts`. Import via `@/lib/api` (`buytlyApi`, types). Write React Query hooks in app code when needed.
4. Copy `client/.env.example` → `client/.env.local` and set `NEXT_PUBLIC_API_URL` and `OPENAPI_URL` (both required).
