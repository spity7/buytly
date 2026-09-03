# Buytly

Monorepo for the Buytly real estate marketplace — **Next.js frontend** + **Express API**.

## Structure

```
buytly/
├── client/          # Next.js frontend
├── server/          # Express API
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

- API: `http://localhost:5000/api/v1`
- Swagger: `http://localhost:5000/api/docs`

**Frontend** (requires API running for Orval codegen):

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

- App: `http://localhost:3000`

## Production (buytly.com)

| Host                            | Service          |
| ------------------------------- | ---------------- |
| `buytly.com` / `www.buytly.com` | Next.js frontend |
| `api.buytly.com`                | Express API      |

Deploy on Hostinger VPS with Docker Compose (same flow as handiz-dashboard):

1. Copy `server/.env.example` → `server/.env` and fill production values
2. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `docker-compose.yml`
3. Upload `server/gcs-service-account.json`
4. Run `docker compose up -d --build`
5. Point host nginx + certbot at ports 3025 (frontend) and 5025 (API)

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

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Orval codegen + Next.js dev server |
| `npm run build` | Production build                   |
| `npm start`     | Start production server            |

## Keeping docs in sync

Code and docs must stay aligned. Cursor enforces this via:

- **`.cursor/rules/docs-sync.mdc`** — always-on rule: update `server/docs/` (and rules when conventions change) in the same change as implementation
- **`.cursor/hooks.json`** — on agent stop, prompts a docs sync follow-up if `server/src/` changed but docs did not

When you add endpoints, schemas, auth rules, env vars, or architecture changes, update the matching file in `server/docs/` (see the mapping in `docs-sync.mdc`).
