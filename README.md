# Buytly Dashboard

Monorepo for the Buytly real estate marketplace. Currently contains the **backend API** only; the frontend dashboard will live here as the project grows.

## Structure

```
buytly-dashboard/
└── server/          # Node.js / Express REST API
    ├── src/         # Application source
    ├── docs/        # Architecture, API rules, auth flow, schemas
    └── tests/       # Vitest + Supertest
```

## Quick start

```bash
cd server
cp .env.example .env   # fill in your values
npm install
npm run dev
```

- API: `http://localhost:5000/api/v1`
- Swagger: `http://localhost:5000/api/docs`

## Documentation

All backend docs live in [`server/docs/`](server/docs/):

| Doc                                                  | Description                              |
| ---------------------------------------------------- | ---------------------------------------- |
| [architecture.md](server/docs/architecture.md)       | System design and request lifecycle      |
| [api-rules.md](server/docs/api-rules.md)             | Response format, pagination, rate limits |
| [auth-flow.md](server/docs/auth-flow.md)             | JWT lifecycle and role permissions       |
| [database-schema.md](server/docs/database-schema.md) | MongoDB collections and indexes          |
| [modules.md](server/docs/modules.md)                 | Endpoint reference per module            |
| [deployment.md](server/docs/deployment.md)           | Env vars and production checklist        |

## Scripts

Run from `server/`:

| Command              | Description             |
| -------------------- | ----------------------- |
| `npm run dev`        | Start with nodemon      |
| `npm start`          | Start production server |
| `npm test`           | Run tests once          |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint`       | ESLint check            |

Integration tests need MongoDB (default: `mongodb://127.0.0.1:27017/buytly-test`). Unit tests run without it.

## Production (buytly.com)

The API is designed to run at **`https://api.buytly.com`** with the frontend at **`https://buytly.com`**.

1. Copy `server/.env.example` → `.env` on your VPS — comment local lines, uncomment prod below each pair
2. Run `npm run generate-secrets` and fill MongoDB, GCS, and Gmail SMTP values
3. Follow the [Hostinger VPS + DNS guide](server/docs/deployment.md#hostinger-buytlycom--dns)

Docker/nginx configs can be added later when you deploy.

## Keeping docs in sync

Code and docs must stay aligned. Cursor enforces this via:

- **`.cursor/rules/docs-sync.mdc`** — always-on rule: update `server/docs/` (and rules when conventions change) in the same change as implementation
- **`.cursor/hooks.json`** — on agent stop, prompts a docs sync follow-up if `server/src/` changed but docs did not

When you add endpoints, schemas, auth rules, env vars, or architecture changes, update the matching file in `server/docs/` (see the mapping in `docs-sync.mdc`).
