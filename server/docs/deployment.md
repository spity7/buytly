# Deployment Guide

## Prerequisites

- Node.js 20+ (LTS)
- MongoDB 6+ (Atlas recommended for production)
- Google Cloud Platform account (for GCS)
- SMTP: Gmail with an [App Password](https://myaccount.google.com/apppasswords) (2FA required)

## Domain layout (buytly.com)

| Host                            | Purpose                                      |
| ------------------------------- | -------------------------------------------- |
| `buytly.com` / `www.buytly.com` | Frontend (future) — `APP_URL`, `CORS_ORIGIN` |
| `api.buytly.com`                | Backend API — `API_URL`, nginx + SSL         |

The repo is API-only today. Point `api.buytly.com` at your VPS; reserve apex/`www` for the Next.js app when it ships.

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

Generate JWT secrets:

```bash
npm run generate-secrets
```

The Next.js client fetches the live OpenAPI spec from `/api/docs.json` for Orval — no file export step. Ensure the API is running before `npm run dev` in `client/`.

## Environment Variables

| Variable               | Required | Description                                                                       |
| ---------------------- | -------- | --------------------------------------------------------------------------------- |
| NODE_ENV               | Yes      | development / production / test                                                   |
| PORT                   | Yes      | Server port (default 5000)                                                        |
| TRUST_PROXY            | No       | `true` behind nginx/ALB (default `false`)                                         |
| MONGODB_URI            | Yes      | MongoDB connection string                                                         |
| JWT_ACCESS_SECRET      | Yes      | Access token secret (min 32 chars)                                                |
| JWT_REFRESH_SECRET     | Yes      | Reserved for future use; refresh tokens are opaque UUIDs stored hashed in MongoDB |
| JWT_ACCESS_EXPIRES_IN  | No       | Access token TTL (default 15m)                                                    |
| JWT_REFRESH_EXPIRES_IN | No       | Refresh token TTL (default 7d)                                                    |
| GCS_PROJECT_ID         | Yes      | GCP project ID                                                                    |
| GCS_BUCKET             | Yes      | GCS bucket name                                                                   |
| GCS_KEY_FILE           | No       | Path to service account JSON                                                      |
| APP_URL                | Yes      | Frontend URL for password-reset links                                             |
| API_URL                | Yes      | Public API base for Swagger and logs (e.g. `https://api.buytly.com/api/v1`)       |
| CORS_ORIGIN            | Yes      | Allowed origins (comma-separated)                                                 |
| SWAGGER_ENABLED        | No       | Expose `/api/docs` (default: on in dev, off in production)                        |
| SMTP_HOST              | Yes      | SMTP server host                                                                  |
| SMTP_PORT              | Yes      | SMTP port (587 or 465)                                                            |
| SMTP_USER              | Yes      | SMTP username                                                                     |
| SMTP_PASS              | Yes      | SMTP password                                                                     |
| SMTP_FROM              | Yes      | From email address                                                                |
| REDIS_URL              | No       | Redis connection URL (optional)                                                   |

Production setup: copy `server/.env.example` → `.env` on the server, then comment local lines and uncomment the prod line below each pair. **SMTP** stays on Gmail — same values in dev and production.

## SMTP Configuration (Gmail)

The app uses Nodemailer (`email.service.js`) with branded HTML + plain-text templates (`email.templates.js`). Use port **587** (STARTTLS). `SMTP_USER` and `SMTP_FROM` must be the same Gmail address.

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

**Gmail limits:** ~500 emails/day for free accounts. For higher volume later, consider SendGrid or Google Workspace.

**Optional:** To send from `@buytly.com`, set up Google Workspace or a Hostinger mailbox — not required for the current setup.

## Hostinger (buytly.com) — DNS

In **Hostinger hPanel → Domains → buytly.com → DNS / Nameservers**:

| Type | Name  | Value        | TTL  |
| ---- | ----- | ------------ | ---- |
| A    | `@`   | `<VPS IPv4>` | 3600 |
| A    | `www` | `<VPS IPv4>` | 3600 |
| A    | `api` | `<VPS IPv4>` | 3600 |

Use the same VPS IP for all three if you run API + future frontend on one machine, or point `api` at a dedicated API server.

Propagation can take up to 24–48 hours (often minutes).

## Hostinger VPS — API deployment

Requires a **VPS** plan (shared hosting does not run Node.js well). KVM VPS recommended.

### 1. Server bootstrap

```bash
# On Ubuntu 22.04+ VPS
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 2. Deploy application

```bash
git clone <your-repo-url> /var/www/buytly
cd /var/www/buytly/server
cp .env.example .env
npm run generate-secrets   # paste output into .env
# Edit .env: comment local lines, uncomment prod line below each pair
npm ci --omit=dev
mkdir -p logs
pm2 start src/server.js --name buytly-api
pm2 save
pm2 startup   # run the command it prints
```

Upload `gcs-service-account.json` to `server/` (never commit it).

### 3. Nginx + SSL

Configure nginx as a reverse proxy to `127.0.0.1:5000` for `api.buytly.com`, then obtain SSL:

```bash
sudo certbot --nginx -d api.buytly.com
```

Set `TRUST_PROXY=true` in `.env` so rate limits and HTTPS headers work behind nginx.

Verify: `curl https://api.buytly.com/api/v1/health`

### 4. Production `.env` checklist

```env
NODE_ENV=production
TRUST_PROXY=true
APP_URL=https://buytly.com
API_URL=https://api.buytly.com/api/v1
CORS_ORIGIN=https://buytly.com,https://www.buytly.com
SWAGGER_ENABLED=false
```

## MongoDB Atlas Setup

1. Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write permissions
3. Whitelist your server IP (or 0.0.0.0/0 for development only)
4. Copy the connection string to `MONGODB_URI`

**Upgrading:** If you previously deployed with a global unique index on `users.email`, drop it after deploy so soft-deleted accounts can free their email via the partial index:

```javascript
// mongosh
db.users.dropIndex("email_1");
```

Mongoose recreates `email_1` as a partial unique index (`deletedAt: null`) on startup. Email is also anonymized on `DELETE /users/me`, so re-registration works even before the index migration.

## Google Cloud Storage Setup

1. Create a GCP project
2. Enable Cloud Storage API
3. Create a bucket (regional, uniform access) — e.g. `buytly-media`
4. Create a service account with `Storage Object Admin` role
5. Download JSON key file → set `GCS_KEY_FILE` path
6. On GCP Compute/Cloud Run, use workload identity instead of key files

## Redis Setup (Optional)

For caching, deploy Redis (Redis Cloud, AWS ElastiCache, or local):

```
REDIS_URL=redis://localhost:6379
```

If unset, caching is disabled — the app works without Redis.

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `TRUST_PROXY=true` behind nginx
- [ ] Use strong, unique JWT secrets (`npm run generate-secrets`)
- [ ] MongoDB Atlas with IP whitelist and TLS
- [ ] GCS bucket with uniform access, no public ACLs
- [ ] `CORS_ORIGIN` restricted to `https://buytly.com,https://www.buytly.com`
- [ ] `APP_URL=https://buytly.com` for password-reset links
- [ ] `API_URL=https://api.buytly.com/api/v1`
- [ ] DNS A records for `@`, `www`, `api` → VPS IP
- [ ] HTTPS via Let's Encrypt (`certbot`)
- [ ] PM2 or systemd for process management
- [ ] Health check monitored: `GET https://api.buytly.com/api/v1/health`
- [ ] `SWAGGER_ENABLED=false` in production (unless you need public docs)
- [ ] Gmail SMTP configured (`smtp.gmail.com:587`, app password)
- [ ] `.env` never committed — use server-only secrets
- [ ] MongoDB indexes created (auto-created on first run via Mongoose)
- [ ] Graceful shutdown tested (SIGTERM handling)
- [ ] Backup strategy for MongoDB
- [ ] GCS lifecycle rules for orphaned media cleanup

## Docker (Optional)

Add a `Dockerfile` under `server/` when you are ready to containerize. Run with `--env-file .env` and expose port `5000`.

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
      "mongodb": "connected",
      "redis": "connected"
    }
  }
}
```

`services.redis` values:

- `"not_configured"` — `REDIS_URL` is unset (caching disabled)
- `"connected"` — Redis is configured and reachable
- `"disconnected"` — `REDIS_URL` is set but Redis is not connected

Returns **503** with `"status": "degraded"` if MongoDB is disconnected (body still has `success: true`).
