# Buytly

Monorepo for the Buytly real estate marketplace — **Next.js frontend** + **Express API**.

## Structure

```
buytly/
├── client/                 # Buytly Next.js frontend
├── apps/buildwise-web/     # Buildwise Engineering tenant frontend
├── apps/block57-web/       # Block 57 tenant frontend
├── server/                 # Express API (multi-tenant)
└── docker-compose.yml
```

## Tenant sites

One API serves every frontend. Each app is a tenant (a `sites` document) chosen by its `NEXT_PUBLIC_SITE_SLUG`, sent as `X-Site-Slug`:

| Slug        | App                  | Dev port | Prod port |
| ----------- | -------------------- | -------- | --------- |
| `buytly`    | `client/`            | 3000     | 3025      |
| `buildwise` | `apps/buildwise-web` | 3001     | 3026      |
| `block57`   | `apps/block57-web`   | 3002     | 3027      |

The tenant apps started as copies of `client/` (`block57-web` via `buildwise-web`), so a fix to shared code (API client, auth, dashboard) may need applying to each app.

## Quick start (local)

**API:**

```bash
cd server
cp .env.example .env   # fill in your values
npm install
npm run dev
```

- API: `http://localhost:5025/api/v1`
- Swagger: `http://localhost:5025/api/docs`

**Frontend** (requires API running for Orval codegen):

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

- App: `http://localhost:3000`

**Buildwise frontend** (tenant site; same API, `X-Site-Slug: buildwise`):

```bash
cd apps/buildwise-web
cp .env.example .env.local
npm install
npm run dev
```

- App: `http://localhost:3001`

**Block 57 frontend** (tenant site; same API, `X-Site-Slug: block57`). Needs the API running and the Block 57 project from `npm run seed:block57` in `server/` (see [Block 57 bootstrap](server/docs/deployment.md#block-57-bootstrap-seedblock57)):

```bash
cd apps/block57-web
cp .env.example .env.local
npm install
npm run dev
```

- App: `http://localhost:3002`

## Production

| Host                                | Service                                   |
| ----------------------------------- | ----------------------------------------- |
| `buytly.com` / `www.buytly.com`     | Buytly Next.js (`client`, 3025)           |
| `buildwise-engineering.com`         | Buildwise Next.js (`buildwise-web`, 3026) |
| `block-57.com` / `www.block-57.com` | Block 57 Next.js (`block57-web`, 3027)    |
| `api.buytly.com`                    | Shared Express API (5025)                 |

Deploy on Hostinger VPS with Docker Compose (same flow as handiz-dashboard):

1. Copy `server/.env.example` → `server/.env` and fill production values (`TRUST_PROXY=true` in production)
2. Copy `.env.example` → `.env` at the repo root and set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and optional `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Upload `server/gcs-service-account.json`
4. Run `docker compose up -d --build`
5. Point host nginx + certbot at ports 3025 (Buytly), 3026 (Buildwise), 3027 (Block 57), and 5025 (API)
6. Block 57: run `seed:block57` once the API is up, then follow the [WordPress cutover checklist](server/docs/deployment.md#block-57-cutover-from-wordpress)

CI runs on every push and pull request via [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (server lint + test with MongoDB, Buytly client build, Buildwise web build, Block 57 web build).

Full guide: [server/docs/deployment.md](server/docs/deployment.md)

## Documentation

| Doc                                                  | Description                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| [deployment.md](server/docs/deployment.md)           | Docker, DNS, nginx, SSL, env vars, Block 57 bootstrap and cutover |
| [architecture.md](server/docs/architecture.md)       | System design and request lifecycle                               |
| [api-rules.md](server/docs/api-rules.md)             | Response format, pagination, rate limits                          |
| [auth-flow.md](server/docs/auth-flow.md)             | JWT lifecycle and role permissions                                |
| [database-schema.md](server/docs/database-schema.md) | MongoDB collections and indexes                                   |
| [modules.md](server/docs/modules.md)                 | Endpoint reference per module                                     |

## Scripts

**Server** (`server/`):

| Command                    | Description             |
| -------------------------- | ----------------------- |
| `npm run dev`              | Start with nodemon      |
| `npm start`                | Start production server |
| `npm run generate-secrets` | Generate JWT secrets    |
| `npm test`                 | Run tests once          |

**Client** (`client/`):

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Orval codegen + Next.js dev server           |
| `npm run gen:api` | Regenerate `src/api/generated/` from OpenAPI |
| `npm run build`   | Production build                             |
| `npm start`       | Start production server                      |

Commit `src/api/generated/` in `client/`, `apps/buildwise-web/` and `apps/block57-web/` after API changes so CI and Docker builds do not require a running API for codegen.

## Keeping docs in sync

Code and docs must stay aligned. Cursor enforces this via:

- **`.cursor/rules/docs-sync.mdc`** — always-on rule: update `server/docs/` (and rules when conventions change) in the same change as implementation
- **`.cursor/hooks.json`** — on agent stop, prompts a docs sync follow-up if `server/src/` changed but docs did not

When you add endpoints, schemas, auth rules, env vars, or architecture changes, update the matching file in `server/docs/` (see the mapping in `docs-sync.mdc`).
