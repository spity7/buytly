# Deployment Guide

## Prerequisites

- Node.js 20+ (LTS)
- MongoDB 6+ (Atlas recommended for production)
- Google Cloud Platform account (for GCS)
- SMTP: Gmail with an [App Password](https://myaccount.google.com/apppasswords) (2FA required)

## Domain layout (buytly.com)

| Host                            | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `buytly.com` / `www.buytly.com` | Next.js frontend — Docker port **3025** |
| `api.buytly.com`                | Express API — Docker port **5025**      |

Both services run on the same Hostinger VPS via Docker Compose (same pattern as handiz-dashboard).

## Local Development Setup

```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

Server starts at `http://localhost:5000`  
Swagger docs at `http://localhost:5000/api/docs` (enabled automatically in development)

### Demo database seed

Populate MongoDB with realistic UAE listings, users, reviews, bookings, and dashboard data:

```bash
cd server
npm run seed          # append (fails on duplicate emails if users already exist)
npm run seed:reset    # wipe collections first, then seed
```

| Variable        | Default           | Description                                     |
| --------------- | ----------------- | ----------------------------------------------- |
| `SEED_PASSWORD` | `BuytlyDemo2026!` | Shared password for all `@buytly.demo` accounts |
| `SEED_FORCE`    | —                 | Required to run when `NODE_ENV=production`      |

Demo logins: `admin@buytly.demo`, `seller@buytly.demo`, `agent@buytly.demo`, `buyer@buytly.demo` (see seed output for full list). Includes land and archived listings and seller2 reviews.

**`npm run seed:reset`** (recommended) wipes users, listings, and the **listing catalog** collections, then reloads demo property types (only those used by sample listings), amenities, and demo data. All demo listing prices use **`currency: USD`**, consistent with the API (create/update always store USD). Use **`npm run seed`** without reset only to append users when emails are new; catalog rows are skipped if types already exist (demo amenities are upserted).

**Development only** — never seed production without intent.

Generate JWT secrets:

```bash
npm run generate-secrets
```

The Next.js client fetches the live OpenAPI spec from `/api/docs.json` for Orval — no file export step. Ensure the API is running before `npm run dev` in `client/`.

## Environment Variables

| Variable                  | Required | Description                                                                                                           |
| ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV                  | Yes      | development / production / test                                                                                       |
| PORT                      | Yes      | Server port (default 5000)                                                                                            |
| TRUST_PROXY               | No       | `true` behind nginx/ALB (default `false`)                                                                             |
| MONGODB_URI               | Yes      | MongoDB connection string                                                                                             |
| JWT_ACCESS_SECRET         | Yes      | Access token secret (min 32 chars)                                                                                    |
| JWT_REFRESH_SECRET        | Yes      | Reserved for future use; refresh tokens are opaque UUIDs stored hashed in MongoDB                                     |
| JWT_ACCESS_EXPIRES_IN     | No       | Access token TTL (default 15m)                                                                                        |
| JWT_REFRESH_EXPIRES_IN    | No       | Refresh token TTL (default 7d)                                                                                        |
| GCS_PROJECT_ID            | Yes      | GCP project ID                                                                                                        |
| GCS_BUCKET                | Yes      | GCS bucket name                                                                                                       |
| GCS_KEY_FILE              | No       | Path to service account JSON                                                                                          |
| APP_URL                   | Yes      | Frontend URL for password-reset links                                                                                 |
| API_URL                   | Yes      | Public API base for Swagger and logs (e.g. `https://api.buytly.com/api/v1`)                                           |
| CORS_ORIGIN               | Yes      | Allowed origins (comma-separated)                                                                                     |
| SWAGGER_ENABLED           | No       | Expose `/api/docs` (default: on in dev, off in production)                                                            |
| EMAIL_PROVIDER            | No       | `smtp` (default) or `sendgrid`                                                                                        |
| SENDGRID_API_KEY          | Cond.    | Required when `EMAIL_PROVIDER=sendgrid`                                                                               |
| SMTP_HOST                 | Cond.    | Required when `EMAIL_PROVIDER=smtp`                                                                                   |
| SMTP_PORT                 | No       | SMTP port (587 or 465; default 587)                                                                                   |
| SMTP_USER                 | Cond.    | Required when `EMAIL_PROVIDER=smtp`                                                                                   |
| SMTP_PASS                 | Cond.    | Required when `EMAIL_PROVIDER=smtp`                                                                                   |
| SMTP_FROM                 | Yes      | From email address (verified sender for SendGrid)                                                                     |
| CONTACT_INBOX_EMAIL       | No       | Receives `/contact` form submissions (default `buytlyonline@gmail.com`)                                               |
| GCS_ORPHAN_GRACE_HOURS    | No       | Grace period for `npm run cleanup:gcs` (default 48)                                                                   |
| OVERPASS_URL              | No       | Primary Overpass API URL for What's Nearby (falls back to public mirrors)                                             |
| OVERPASS_USER_AGENT       | No       | User-Agent sent to Overpass (recommended in production)                                                               |
| GOOGLE_CLIENT_ID          | Yes      | Google OAuth Web client ID (same as client `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)                                            |
| SITE_PUBLIC_URL_BUILDWISE | No       | Partner listing links from Buytly marketplace (`sourceSite.listingUrl`). Dev default `http://localhost:3001` if unset |
| SITE_PUBLIC_URL_BUYTLY    | No       | Buytly first-party listing base in platform API metadata. Dev default `http://localhost:3000` if unset                |

**Docker Compose (repo root `.env`):** copy `.env.example` → `.env` at the repo root. Never commit `.env`. Required for client build/runtime:

| Variable                            | Required                 | Description                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`               | Yes                      | Public API base baked into the Next.js bundle                                                                                                                                                                             |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`      | Yes (for Google sign-in) | Same value as `GOOGLE_CLIENT_ID` in `server/.env`                                                                                                                                                                         |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`   | No                       | Google Maps JavaScript API key for map demo pages                                                                                                                                                                         |
| `NEXT_PUBLIC_SUPPORT_PHONE`         | No                       | E.164 support line for footer/mobile menu WhatsApp (default `+96171601751`)                                                                                                                                               |
| `NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY` | No                       | Human-readable support number shown in UI (default `+961 71 601 751`)                                                                                                                                                     |
| `NEXT_PUBLIC_SUPPORT_EMAIL`         | No                       | Support email in footer and mailto links (default `buytlyonline@gmail.com`)                                                                                                                                               |
| `BUILDWISE_SUPPORT_PHONE`           | No                       | Buildwise footer/WhatsApp (default `+96171703703`) — `buildwise-web` build arg                                                                                                                                            |
| `BUILDWISE_SUPPORT_PHONE_DISPLAY`   | No                       | Buildwise display number (default `+961 71 703 703`)                                                                                                                                                                      |
| `BUILDWISE_SUPPORT_EMAIL`           | No                       | Buildwise support email (default `info@buildwise-engineering.com`)                                                                                                                                                        |
| `BUILDWISE_SITE_PUBLIC_URL`         | No                       | Buildwise public site URL for invoice links/metadata (default `https://buildwise-engineering.com`) — `buildwise-web` build arg only; not the API partner-link override (use `SITE_PUBLIC_URL_BUILDWISE` in `server/.env`) |

**Per-app Next.js env** (local dev: `client/.env.local` or `apps/buildwise-web/.env.local`; see each app’s `.env.example`):

| Variable                      | Buytly (`client`) | Buildwise (`apps/buildwise-web`)                                                                                              |
| ----------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_SLUG`       | `buytly`          | `buildwise`                                                                                                                   |
| `NEXT_PUBLIC_SITE_NAME`       | `Buytly`          | `Buildwise Engineering`                                                                                                       |
| `NEXT_PUBLIC_SITE_PUBLIC_URL` | — (optional)      | Buildwise: canonical URL in UI/metadata (local dev: `http://localhost:3001`). Buytly client: optional `http://localhost:3000` |

`docker-compose.yml` passes site slug/name, public URL, and support fields as **build args** only (`NEXT_PUBLIC_*` is baked at `docker compose build` time). Changing root `.env` requires `docker compose build client buildwise-web` (or `--build` on `up`).

Production setup: copy `server/.env.example` → `.env` on the server, then comment local lines and uncomment the prod line below each pair. Default email is **SMTP** (Gmail); switch to **SendGrid** for higher volume.

## Email configuration

`email.service.js` sends branded HTML + plain-text templates (`email.templates.js`). Set `EMAIL_PROVIDER=smtp` (default) or `EMAIL_PROVIDER=sendgrid`.

### SMTP (Gmail)

Use port **587** (STARTTLS). `SMTP_USER` and `SMTP_FROM` must be the same Gmail address.

1. Enable 2FA on your Google account
2. Create an [App Password](https://myaccount.google.com/apppasswords)
3. Set in `.env` (local and production):

| Variable  | Value                     |
| --------- | ------------------------- |
| SMTP_HOST | `smtp.gmail.com`          |
| SMTP_PORT | `587`                     |
| SMTP_USER | your Gmail address        |
| SMTP_PASS | 16-character app password |
| SMTP_FROM | same as `SMTP_USER`       |

`SMTP_FROM` must be a plain email address (no display name like `Buytly <...>`).

**Deliverability:** Set `APP_URL` to your real frontend domain in production (not `localhost`) so verification and password-reset links use a trusted domain. Action emails include a plain-text body and a visible URL fallback in addition to the button link.

**Gmail limits:** ~500 emails/day for free accounts. For higher volume, use SendGrid below.

**Optional:** To send from `@buytly.com`, set up Google Workspace or a Hostinger mailbox — not required for the current setup.

### SendGrid (production)

1. Create a SendGrid account and verify your sender domain or single sender.
2. Create an API key with **Mail Send** permission.
3. Set in `server/.env`:

| Variable         | Value                                       |
| ---------------- | ------------------------------------------- |
| EMAIL_PROVIDER   | `sendgrid`                                  |
| SENDGRID_API_KEY | your API key                                |
| SMTP_FROM        | verified sender (e.g. `noreply@buytly.com`) |

Alternatively, SendGrid SMTP relay works with `EMAIL_PROVIDER=smtp`, `SMTP_HOST=smtp.sendgrid.net`, `SMTP_USER=apikey`, `SMTP_PASS=<SENDGRID_API_KEY>`.

## GCS orphan cleanup

Uploaded media keys are stored in MongoDB (`users.avatar`, property/project media and floor plans); orphaned objects can remain when uploads fail or media is replaced. Run periodically on the VPS:

```bash
cd server
npm run cleanup:gcs:dry-run   # preview orphans older than grace period
npm run cleanup:gcs           # delete orphans
```

Set `GCS_ORPHAN_GRACE_HOURS` (default 48) to avoid deleting in-flight uploads. Schedule via cron, e.g. weekly: `0 3 * * 0 cd /path/to/buytly/server && npm run cleanup:gcs`.

## GCS site-prefix migration (legacy flat keys)

If the bucket still has root-level `avatars/`, `projects/`, or `properties/` alongside `sites/{slug}/...`, run once after `npm run migrate:multi-site` (every document must have `siteId`):

```bash
cd server
npm run migrate:gcs-site-prefix:dry-run   # preview oldKey -> newKey mappings
npm run migrate:gcs-site-prefix         # copy in GCS, update MongoDB, delete old objects
npm run cleanup:gcs:dry-run             # preview unreferenced legacy stragglers
npm run cleanup:gcs                       # delete orphans (optional but recommended)
```

The script is idempotent: keys already under `sites/` are skipped. Take a MongoDB backup and review dry-run output before applying. Google profile avatars and manual uploads both use `sites/{slug}/avatars/...` after the code change bundled with this migration.

## Hostinger (buytly.com) — DNS

In **Hostinger hPanel → Domains → buytly.com → DNS / Nameservers**:

| Type | Name  | Value        | TTL  |
| ---- | ----- | ------------ | ---- |
| A    | `@`   | `<VPS IPv4>` | 3600 |
| A    | `www` | `<VPS IPv4>` | 3600 |
| A    | `api` | `<VPS IPv4>` | 3600 |

Use the same VPS IP for all three when running frontend + API on one machine.

Propagation can take up to 24–48 hours (often minutes).

## Hostinger VPS — deployment

Same flow as handiz-dashboard: Docker Compose on the VPS, host nginx + certbot for SSL.

| Service       | Host port | Domain                      |
| ------------- | --------- | --------------------------- |
| client        | 3025      | buytly.com / www            |
| buildwise-web | 3026      | buildwise-engineering.com   |
| server        | 5025      | api.buytly.com (shared API) |

(handiz-dashboard uses 3016 / 5016 on the same VPS — no conflict)

```bash
git clone <your-repo-url> /var/www/buytly
cd /var/www/buytly
cp server/.env.example server/.env
cp .env.example .env
# Edit server/.env — comment local lines, uncomment prod below each pair (include TRUST_PROXY=true)
# Edit .env — set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID (same as GOOGLE_CLIENT_ID), optional NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# Upload gcs-service-account.json to server/
docker compose up -d --build
```

Point host nginx at `127.0.0.1:3025` (frontend) and `127.0.0.1:5025` (API), then:

```bash
sudo certbot --nginx -d buytly.com -d www.buytly.com
sudo certbot --nginx -d api.buytly.com
```

Verify: `curl https://api.buytly.com/api/v1/health`

### Production `.env` checklist

```env
NODE_ENV=production
PORT=5000
TRUST_PROXY=true
APP_URL=https://buytly.com
API_URL=https://api.buytly.com/api/v1
CORS_ORIGIN=https://buytly.com,https://www.buytly.com,https://buildwise-engineering.com,https://www.buildwise-engineering.com
SWAGGER_ENABLED=false
GCS_KEY_FILE=./gcs-service-account.json
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

Add Google OAuth authorized JavaScript origins: `https://buytly.com`, `https://www.buytly.com`, `https://buildwise-engineering.com`, `https://www.buildwise-engineering.com`.

### Multi-site rollout

1. Deploy API with site middleware (`resolveSite` + seeded `sites` collection).
2. Run once on production DB: `npm run migrate:multi-site -w server` (from repo root) or `node scripts/migrate-multi-site.js` in `server/`. This backfills `siteId`, grants platform admin permissions, and drops legacy catalog unique index `value_1` in favor of `{ siteId, value }`. New API processes also run that index sync on startup.
3. Build and run both frontends: `docker compose up -d --build` (services `client`, `buildwise-web`, `server`).
4. Host nginx:
   - `buytly.com` / `www` → `127.0.0.1:3025`
   - `buildwise-engineering.com` / `www` → `127.0.0.1:3026`
   - `api.buytly.com` → `127.0.0.1:5025`
5. TLS: `sudo certbot --nginx -d buildwise-engineering.com -d www.buildwise-engineering.com` (in addition to Buytly hosts).

Each frontend sends browser `Origin`; the API resolves tenant from host mapping in `sites`. Dev/tests may send `X-Site-Slug: buytly|buildwise`. Per-site accounts: the same email may exist independently on each site.

## MongoDB Atlas Setup

1. Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write permissions
3. Whitelist your server IP (or 0.0.0.0/0 for development only)
4. Copy the connection string to `MONGODB_URI`

**Upgrading:** Older databases may still have **global** unique indexes on `users.email` and/or `users.googleId` from before multi-site (`siteId`) tenancy. Those block the same email or Google account on a second site (e.g. Buytly vs Buildwise). On API startup, `ensureUserIndexes()` drops legacy global `email_1` / `googleId_1` indexes and runs `User.syncIndexes()` so only `{ siteId, email }` and `{ siteId, googleId }` partial uniques remain.

Manual fix (if needed):

```javascript
// mongosh
db.users.dropIndex("email_1"); // only if key is { email: 1 } without siteId
db.users.dropIndex("googleId_1"); // only if key is { googleId: 1 } without siteId
```

Email is anonymized on `DELETE /users/me`, so re-registration works with the partial per-site unique index.

## Google Cloud Storage Setup

1. Create a GCP project
2. Enable Cloud Storage API
3. Create a bucket (regional, uniform access) — e.g. `buytly-media`
4. Create a service account with `Storage Object Admin` role
5. Download JSON key file → set `GCS_KEY_FILE` path
6. On GCP Compute/Cloud Run, use workload identity instead of key files

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `TRUST_PROXY=true` behind nginx
- [ ] Use strong, unique JWT secrets (`npm run generate-secrets`)
- [ ] MongoDB Atlas with IP whitelist and TLS
- [ ] GCS bucket with uniform access, no public ACLs
- [ ] `CORS_ORIGIN` includes all frontend origins (Buytly + Buildwise domains for production)
- [ ] `APP_URL=https://buytly.com` for password-reset links
- [ ] `API_URL=https://api.buytly.com/api/v1`
- [ ] DNS A records for `@`, `www`, `api` → VPS IP
- [ ] `docker compose up -d --build` running on VPS
- [ ] Host nginx + HTTPS via certbot
- [ ] Health check: `GET https://api.buytly.com/api/v1/health`
- [ ] `SWAGGER_ENABLED=false` in production (unless you need public docs)
- [ ] Gmail SMTP configured (`smtp.gmail.com:587`, app password)
- [ ] `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` match; OAuth origins include production domains
- [ ] Repo root `.env` for Docker Compose (client build args) — never committed
- [ ] `server/.env` never committed — use server-only secrets
- [ ] GitHub Actions CI passing (`.github/workflows/ci.yml`)
- [ ] MongoDB indexes created (auto-created on first run via Mongoose)
- [ ] Graceful shutdown tested (SIGTERM handling)
- [ ] Backup strategy for MongoDB
- [ ] GCS orphan cleanup scheduled (`npm run cleanup:gcs` — see above)

## Docker

Same layout as handiz-dashboard:

| File                            | Purpose                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| `docker-compose.yml`            | `client`, `buildwise-web`, `server`; ports, volumes                   |
| `client/Dockerfile`             | Buytly Next.js standalone → `node server.js` :3025                    |
| `apps/buildwise-web/Dockerfile` | Buildwise Next.js standalone → `node server.js` :3026                 |
| `server/Dockerfile`             | `npm ci --omit=dev` → `npm start` :5025                               |
| Repo root `.dockerignore`       | Build context for frontends; excludes `.env*`, `server/`, `packages/` |
| Repo root `.gitignore`          | Secrets, `node_modules/`, `**/.next/`, coverage (workspaces)          |

Frontend env for Docker comes from the repo root `.env` (see `.env.example`) via **compose build args** — values are embedded at image build time. Server runtime env comes from `server/.env` (`env_file` in compose). Optional: set `APP_URL` in `server/.env` to the public site users open in the browser (email/reset links); local dev often uses `http://localhost:3000` / `3001`, Docker frontends use `http://localhost:3025` / `3026`.

All three services define **healthchecks** in `docker-compose.yml` and in their Dockerfiles:

| Service       | Check                                     |
| ------------- | ----------------------------------------- |
| server        | `GET http://127.0.0.1:5025/api/v1/health` |
| client        | `GET http://127.0.0.1:3025`               |
| buildwise-web | `GET http://127.0.0.1:3026`               |

## CI/CD

GitHub Actions workflow [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs on every push and pull request (and can be re-run manually via **workflow_dispatch**):

| Job               | Steps                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| **server**        | `npm ci --no-workspaces`, `npm run lint`, `npm test` (MongoDB 7 service container) |
| **client**        | `npm ci --no-workspaces`, `npm run build` (uses committed `src/api/generated/`)    |
| **buildwise-web** | `npm ci --no-workspaces`, `npm run build` (Buildwise tenant env)                   |

Regenerate and commit `client/src/api/generated/` after OpenAPI changes (`npm run gen:api` with the API running locally).

## Health Check

```
GET /api/v1/health
```

Response (healthy):

```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-01-01T00:00:00.000Z",
    "services": {
      "mongodb": "connected"
    }
  }
}
```

Returns **503** with `"status": "degraded"` if MongoDB is disconnected (body still has `success: true`).
