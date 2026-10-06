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

Server starts at `http://localhost:5025`  
Swagger docs at `http://localhost:5025/api/docs` (enabled automatically in development)

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

**Development only** — never seed production without intent. The Block 57 tenant has its own production-safe bootstrap: see [Block 57 bootstrap](#block-57-bootstrap-seedblock57).

Generate JWT secrets:

```bash
npm run generate-secrets
```

The Next.js client fetches the live OpenAPI spec from `/api/docs.json` for Orval — no file export step. Ensure the API is running before `npm run dev` in `client/`.

## Environment Variables

| Variable                  | Required | Description                                                                                                           |
| ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV                  | Yes      | development / production / test                                                                                       |
| PORT                      | Yes      | Server port (default **5025**; must match `docker-compose.yml` publish and healthcheck)                               |
| TRUST_PROXY               | No       | `true` behind nginx/ALB (default `false`)                                                                             |
| DEFAULT_SITE_SLUG         | No       | Fallback tenant when `Origin` / `X-Site-Slug` is missing (scripts, server-to-server); usually `buytly`                |
| MONGODB_URI               | Yes      | MongoDB connection string (local in `.env.example`; production: Atlas `mongodb+srv://...`)                            |
| JWT_ACCESS_SECRET         | Yes      | Access token secret (min 32 chars)                                                                                    |
| JWT_REFRESH_SECRET        | Yes      | Reserved for future use; refresh tokens are opaque UUIDs stored hashed in MongoDB                                     |
| JWT_ACCESS_EXPIRES_IN     | No       | Access token TTL (default 15m)                                                                                        |
| JWT_REFRESH_EXPIRES_IN    | No       | Refresh token TTL (default 7d)                                                                                        |
| GCS_PROJECT_ID            | Yes      | GCP project ID                                                                                                        |
| GCS_BUCKET                | Yes      | GCS bucket name                                                                                                       |
| GCS_KEY_FILE              | No       | Path to service account JSON                                                                                          |
| APP_URL                   | Yes      | Fallback frontend URL for email links when no site public URL is known (sites use `SITE_PUBLIC_URL_*` / `publicUrl`)  |
| API_URL                   | Yes      | Public API base for Swagger and logs (e.g. `https://api.buytly.com/api/v1`)                                           |
| CORS_ORIGIN               | Yes      | Allowed origins (comma-separated)                                                                                     |
| SWAGGER_ENABLED           | No       | Expose `/api/docs` (default: on in dev, off in production)                                                            |
| EMAIL_PROVIDER            | No       | `smtp` (default) or `sendgrid`                                                                                        |
| SENDGRID_API_KEY          | Cond.    | Required when `EMAIL_PROVIDER=sendgrid`                                                                               |
| SMTP_HOST                 | Cond.    | Required when `EMAIL_PROVIDER=smtp`                                                                                   |
| SMTP_PORT                 | No       | SMTP port (587 or 465; default 587)                                                                                   |
| SMTP_USER                 | Cond.    | Required when `EMAIL_PROVIDER=smtp`                                                                                   |
| SMTP_PASS                 | Cond.    | Required when `EMAIL_PROVIDER=smtp`                                                                                   |
| SMTP_FROM                 | Yes      | Sender address (verified sender for SendGrid); the display name is set per site, e.g. `Block 57 <address>`            |
| CONTACT_INBOX_EMAIL       | No       | Receives `/contact` submissions for sites without `branding.contactInboxEmail` (default `buytlyonline@gmail.com`)     |
| GCS_ORPHAN_GRACE_HOURS    | No       | Grace period for `npm run cleanup:gcs` (default 48)                                                                   |
| OVERPASS_URL              | No       | Primary Overpass API URL for What's Nearby (falls back to public mirrors)                                             |
| OVERPASS_USER_AGENT       | No       | User-Agent sent to Overpass (recommended in production)                                                               |
| GOOGLE_CLIENT_ID          | Yes      | Google OAuth Web client ID (same as client `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)                                            |
| SITE_PUBLIC_URL_BUILDWISE | No       | Buildwise base for partner `sourceSite.listingUrl` and email links. Dev default `http://localhost:3001` if unset      |
| SITE_PUBLIC_URL_BUYTLY    | No       | Buytly base for platform API listing metadata and email links. Dev default `http://localhost:3000` if unset           |
| SITE_PUBLIC_URL_BLOCK57   | No       | Block 57 base for partner listing links on Buytly and email links. Dev default `http://localhost:3002` if unset       |

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

`SMTP_FROM` must be a plain email address (no display name like `Buytly <...>`). The API adds the display name per site, e.g. `Block 57 <your-address>`.

**Deliverability:** Verification, password-reset and notification links use the request site's public URL (`SITE_PUBLIC_URL_*` when set, otherwise `sites.publicUrl` in production), so each tenant's users land on their own domain. Keep `APP_URL` on your real Buytly domain in production (not `localhost`) — it is the fallback when no site URL is known. Action emails include a plain-text body and a visible URL fallback in addition to the button link.

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
# Edit server/.env — comment local lines, uncomment prod below each pair (include TRUST_PROXY=true, Atlas MONGODB_URI)
# Edit .env — uncomment prod NEXT_PUBLIC_API_URL; set NEXT_PUBLIC_GOOGLE_CLIENT_ID (same as GOOGLE_CLIENT_ID);
#   optional NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; confirm BUILDWISE_SITE_PUBLIC_URL and BUILDWISE_SUPPORT_* for buildwise-web
# Upload gcs-service-account.json to server/
docker compose up -d --build
```

Point **host nginx** at loopback (three virtual hosts):

| Public host                         | Upstream         |
| ----------------------------------- | ---------------- |
| `buytly.com` / `www.buytly.com`     | `127.0.0.1:3025` |
| `buildwise-engineering.com` / `www` | `127.0.0.1:3026` |
| `api.buytly.com`                    | `127.0.0.1:5025` |

TLS (certbot; run after nginx proxies are in place):

```bash
sudo certbot --nginx -d buytly.com -d www.buytly.com
sudo certbot --nginx -d api.buytly.com
sudo certbot --nginx -d buildwise-engineering.com -d www.buildwise-engineering.com
```

Verify: `curl https://api.buytly.com/api/v1/health`

### Production `.env` checklist

**`server/.env` (API runtime — `env_file` in compose):**

```env
NODE_ENV=production
PORT=5025
TRUST_PROXY=true
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
APP_URL=https://buytly.com
API_URL=https://api.buytly.com/api/v1
CORS_ORIGIN=https://buytly.com,https://www.buytly.com,https://buildwise-engineering.com,https://www.buildwise-engineering.com,https://block-57.com,https://www.block-57.com
SWAGGER_ENABLED=false
GCS_KEY_FILE=./gcs-service-account.json
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

Optional in `server/.env`: `SITE_PUBLIC_URL_BUILDWISE` / `SITE_PUBLIC_URL_BUYTLY` / `SITE_PUBLIC_URL_BLOCK57` override partner `listingUrl` bases and email link bases (verify/reset/notification buttons); if unset in production, the API uses `sites.publicUrl` / `primaryDomain` from MongoDB (seeded on startup).

**Repo root `.env` (Next.js **build args** — rebake images after changes):**

```env
NEXT_PUBLIC_API_URL=https://api.buytly.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same-as-GOOGLE_CLIENT_ID>
BUILDWISE_SITE_PUBLIC_URL=https://buildwise-engineering.com
```

Add Google OAuth authorized JavaScript origins: `https://buytly.com`, `https://www.buytly.com`, `https://buildwise-engineering.com`, `https://www.buildwise-engineering.com`.

### Multi-site rollout

1. Deploy API with site middleware (`resolveSite` + seeded `sites` collection).
2. Run once on production DB (skip on a fresh empty DB if you rely on startup seed only): `npm run migrate:multi-site -w server` (from repo root) or `node scripts/migrate-multi-site.js` in `server/`. This backfills `siteId`, grants platform admin permissions, and drops legacy catalog unique index `value_1` in favor of `{ siteId, value }`. New API processes also run that index sync on startup.
3. Build and run all services: `docker compose up -d --build` (`client`, `buildwise-web`, `server`).
4. Nginx + TLS: same three-host layout and certbot commands as [Hostinger VPS — deployment](#hostinger-vps--deployment) above.

Each frontend sends browser `Origin`; the API resolves tenant from host mapping in `sites`. Dev/tests may send `X-Site-Slug: buytly|buildwise|block57`. Per-site accounts: the same email may exist independently on each site.

### Block 57 bootstrap (`seed:block57`)

`scripts/seed-block57.js` prepares the `block57` tenant on any database, including production, after the API has been deployed. It is safe to run again: every step is an upsert, nothing is deleted, and edits made in the dashboard are kept. Steps:

1. Ensure the default sites exist (`ensureDefaultSites`, as on API boot) and load `block57`.
2. Create the Block 57 admin, or update an existing account with that email on `block57`: role `admin`, email verified, **no platform permissions** (it cannot see other sites' data). A new account gets the name "Block 57 Sales" and the site support phone. This account owns the project and its name, email and phone are shown on listings, so use a shared sales mailbox rather than a personal address.
3. Property types (insert only; later label/order/active edits are kept): `executive-studio` Executive Studio, `one-bedroom` 1 Bedroom, `two-bedroom` 2 Bedroom, `townhouse` Townhouse, `urban-villa` Urban Villa, `penthouse` Penthouse.
4. Amenities: inserts the catalog defaults (as the first catalog read would), then sets active on every run: Swimming Pool and Security (defaults, reused), Rooftop Lounge, Padel Court, Fitness Centre, Children's Play Area, Business Lounge, Underground Parking; and inactive: Sea View, Mountain View, Generator. Labels and sort order are only set when a row is inserted. Other sites' catalogs are untouched.
5. Project "Block 57" (slug `block-57`): created once as **draft**, owned by the admin, with placeholder marketing copy, the Block 57 amenities and location "54E First Circular Crescent, Cantonments, Accra, Ghana". The default map pin (lat 5.5786, lng -0.1745) is approximate; confirm it, then pass `BLOCK57_LAT`/`BLOCK57_LNG` on the first run or move the pin in the dashboard. An existing project is never modified (status, copy, location and media belong to the dashboard). A project in the trash stops the script; restore it first.
6. `--units <file>`: upsert units (see below).
7. `--activate`: approve the project the same way an admin does in the dashboard (`adminService.moderateProject(..., "active")`): the project becomes active and its **pending** units become active; draft units stay draft. It needs at least one pending or active unit and is skipped (with the reason printed) otherwise, or when the project is already active with nothing pending, or sold. The owner gets the usual "project approved" notification and email.

The script prints a summary (created / updated / unchanged counts, warnings) and next steps, exits non-zero on any error, and always disconnects.

| Variable                      | Required | Description                                                                                                                                          |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BLOCK57_ADMIN_EMAIL`         | yes      | Admin account on `block57` (shared sales mailbox)                                                                                                    |
| `BLOCK57_ADMIN_PASSWORD`      | yes      | 8–128 characters. Used when the account is created, or with `--reset-admin-password`; otherwise an existing password is left unchanged. Never logged |
| `BLOCK57_LAT` / `BLOCK57_LNG` | no       | Project coordinates (set both). Only used when the project is first created                                                                          |

| Flag                     | Effect                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `--units <file>`         | Upsert units from a JSON array. Relative paths resolve from the directory the command is run from |
| `--activate`             | Approve the project and its pending units (step 7)                                                |
| `--reset-admin-password` | Set the admin password from `BLOCK57_ADMIN_PASSWORD` and revoke the account's refresh tokens      |
| `--help`                 | Print usage                                                                                       |

Local (the variables can also live in `server/.env`):

```bash
cd server
BLOCK57_ADMIN_EMAIL=<sales-mailbox> BLOCK57_ADMIN_PASSWORD='<password>' \
  npm run seed:block57 -- --units scripts/seed/block57-units.example.json --activate
```

Docker (runs inside the API container, so it uses the container's `MONGODB_URI` and GCS credentials). Read the password without echoing it, so it stays out of shell history:

```bash
read -rsp "Block 57 admin password: " BLOCK57_ADMIN_PASSWORD; echo
docker compose exec \
  -e BLOCK57_ADMIN_EMAIL=<sales-mailbox> \
  -e BLOCK57_ADMIN_PASSWORD="$BLOCK57_ADMIN_PASSWORD" \
  server npm run seed:block57

# Units: copy the inventory file into the container, import it, then activate
docker compose cp ./block57-units.json server:/tmp/block57-units.json
docker compose exec \
  -e BLOCK57_ADMIN_EMAIL=<sales-mailbox> \
  -e BLOCK57_ADMIN_PASSWORD="$BLOCK57_ADMIN_PASSWORD" \
  server npm run seed:block57 -- --units /tmp/block57-units.json --activate
unset BLOCK57_ADMIN_PASSWORD
```

**Units file.** A JSON array; each entry is validated with the same rules as `POST /properties`, and the whole file is checked before any unit is written (unknown keys, duplicate titles and unknown or inactive types are errors):

| Field                           | Rules                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                         | Required, 3–200 characters, block-prefixed (e.g. `A-101`). Matched exactly per project on re-runs                                     |
| `type`                          | Required; an active Block 57 property type (step 3)                                                                                   |
| `price`                         | Required whole USD amount > 0 (hidden from the public; see api-rules.md)                                                              |
| `building`, `floor`             | Optional; building up to 50 characters, floor a whole number −5…300. `null` clears on re-run                                          |
| `bedrooms`, `bathrooms`, `area` | Optional; whole numbers, area in m² with up to 2 decimals                                                                             |
| `sortOrder`                     | Optional whole number (default 999)                                                                                                   |
| `status`                        | `pending` (default) or `sold`                                                                                                         |
| `description`                   | Optional, ≥ 10 characters. New units without one get e.g. "2 Bedroom residence in Block C, floor 7, at Block 57, Cantonments, Accra." |

```json
[
  {
    "title": "A-101",
    "type": "executive-studio",
    "building": "A",
    "floor": 1,
    "bedrooms": 0,
    "bathrooms": 1,
    "area": 45,
    "price": 150000
  },
  {
    "title": "B-302",
    "type": "two-bedroom",
    "building": "B",
    "floor": 3,
    "bedrooms": 2,
    "bathrooms": 2,
    "area": 120,
    "price": 350000,
    "status": "sold"
  }
]
```

New units are created through the property service (location copied from the project, owner = project owner, `USD`). On re-runs, a unit whose title already exists on the project is updated with the fields that changed; omitted optional fields are kept. Status only moves forward: `pending` never downgrades an active unit, and a unit that is sold in the database stays sold (a warning is printed). Units in the trash are skipped, and units that are not in the file are left alone. Enter the full inventory before marking units sold: when every unit is sold the project becomes sold automatically and refuses new units.

`scripts/seed/block57-units.example.json` holds six **example** units (one per type across Blocks A/B/C) with placeholder prices and "Example unit" descriptions, for local testing only; the script refuses to import a `*.example.json` file when `NODE_ENV=production`.

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
- [ ] Set `PORT=5025` in `server/.env` (matches Docker publish and healthcheck)
- [ ] Set `TRUST_PROXY=true` behind nginx
- [ ] Use strong, unique JWT secrets (`npm run generate-secrets`)
- [ ] MongoDB Atlas with IP whitelist and TLS
- [ ] GCS bucket with uniform access, no public ACLs
- [ ] `CORS_ORIGIN` includes all frontend origins (Buytly + Buildwise + Block 57 domains for production)
- [ ] `APP_URL=https://buytly.com` (fallback only; email links use each site's `publicUrl` / `SITE_PUBLIC_URL_*`)
- [ ] `API_URL=https://api.buytly.com/api/v1`
- [ ] DNS A records for `@`, `www`, `api` → VPS IP
- [ ] `docker compose up -d --build` running on VPS
- [ ] Host nginx + HTTPS via certbot
- [ ] Health check: `GET https://api.buytly.com/api/v1/health`
- [ ] `SWAGGER_ENABLED=false` in production (unless you need public docs)
- [ ] Gmail SMTP configured (`smtp.gmail.com:587`, app password)
- [ ] `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` match; OAuth origins include production domains
- [ ] Repo root `.env` for Docker Compose — prod `NEXT_PUBLIC_API_URL` and matching `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; rebuild frontends after changes — never committed
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

Frontend env for Docker comes from the repo root `.env` (see `.env.example`) via **compose build args** — values are embedded at image build time. Server runtime env comes from `server/.env` (`env_file` in compose). Email/reset links use each site's public URL: in development the API defaults to `http://localhost:3000` (Buytly), `3001` (Buildwise) and `3002` (Block 57); when the Docker frontends run on other ports (e.g. `http://localhost:3025` / `3026`), set the matching `SITE_PUBLIC_URL_*` in `server/.env`. `APP_URL` is only the fallback.

**BuildKit / buildx:** Frontend Dockerfiles use a plain `npm ci` layer so **classic** `docker compose build` works on minimal VPS images (no `buildx` required). If you see `Docker Compose requires buildx plugin`, it is usually a warning only. Optional faster rebuilds on a machine with BuildKit: `export DOCKER_BUILDKIT=1` before `docker compose build` (install `docker-buildx-plugin` if your distro documents it).

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
