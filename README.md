# Buytly

Monorepo for the Buytly real estate marketplace — **Next.js frontend** + **Express API**.

## Structure

```
buytly/
├── client/                 # Buytly Next.js frontend
├── apps/buildwise-web/     # Buildwise Engineering tenant frontend
├── server/                 # Express API (multi-tenant)
└── docker-compose.yml
```

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

- App: `http://localhost:3000` (use a different port if Buytly client is already running)

## Production

| Host                            | Service                                   |
| ------------------------------- | ----------------------------------------- |
| `buytly.com` / `www.buytly.com` | Buytly Next.js (`client`, 3025)           |
| `buildwise-engineering.com`     | Buildwise Next.js (`buildwise-web`, 3026) |
| `api.buytly.com`                | Shared Express API (5025)                 |

Deploy on Hostinger VPS with Docker Compose (same flow as handiz-dashboard):

1. Copy `server/.env.example` → `server/.env` and fill production values (`TRUST_PROXY=true` in production)
2. Copy `.env.example` → `.env` at the repo root and set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and optional `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Upload `server/gcs-service-account.json`
4. Run `docker compose up -d --build`
5. Point host nginx + certbot at ports 3025 (Buytly), 3026 (Buildwise), and 5025 (API)

CI runs on every push and pull request via [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (server lint + test with MongoDB, Buytly client build, Buildwise web build).

Full guide: [server/docs/deployment.md](server/docs/deployment.md)

## Documentation

| Doc                                                  | Description                              |
| ---------------------------------------------------- | ---------------------------------------- |
| [deployment.md](server/docs/deployment.md)           | Docker, DNS, nginx, SSL, env vars        |
| [architecture.md](server/docs/architecture.md)       | System design and request lifecycle      |
| [api-rules.md](server/docs/api-rules.md)             | Response format, pagination, rate limits |
| [auth-flow.md](server/docs/auth-flow.md)             | JWT lifecycle and role permissions       |
| [database-schema.md](server/docs/database-schema.md) | MongoDB collections and indexes          |
| [modules.md](server/docs/modules.md)                 | Endpoint reference per module            |

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

Commit `client/src/api/generated/` after API changes so CI and Docker builds do not require a running API for codegen.

## Keeping docs in sync

Code and docs must stay aligned. Cursor enforces this via:

- **`.cursor/rules/docs-sync.mdc`** — always-on rule: update `server/docs/` (and rules when conventions change) in the same change as implementation
- **`.cursor/hooks.json`** — on agent stop, prompts a docs sync follow-up if `server/src/` changed but docs did not

When you add endpoints, schemas, auth rules, env vars, or architecture changes, update the matching file in `server/docs/` (see the mapping in `docs-sync.mdc`).
