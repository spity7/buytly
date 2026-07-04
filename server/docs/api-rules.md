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

Obtain tokens via `POST /api/v1/auth/login` or `POST /api/v1/auth/register`.

Refresh expired access tokens via `POST /api/v1/auth/refresh` with the refresh token in the body.

## Sorting & Filtering

Property list supports:

- `sortBy` — `price`, `createdAt`, `viewCount`
- `sortOrder` — `asc`, `desc`
- `minPrice`, `maxPrice`, `type`, `listingType`, `status`, `city`, `bedrooms`
- `search` — Full-text search on title/description
- `lat`, `lng`, `radiusKm` — Geo-radius search

## Versioning

Current version: `v1`. All routes are prefixed with `/api/v1`.

## Rate Limiting

- Global: 200 requests per 15 minutes per IP
- Auth endpoints: 20 requests per 15 minutes per IP

## Documentation

Interactive Swagger UI: `/api/docs`
OpenAPI JSON: `/api/docs.json`

Swagger `servers` base URL is `/api/v1` — path annotations in `*.routes.js` must be **relative** (e.g. `/health`, `/auth/login`), not `/api/v1/health`.

On Windows, `swagger.js` normalizes glob paths to forward slashes so `swagger-jsdoc` discovers all route files.
