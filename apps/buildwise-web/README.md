# Buildwise Engineering (Next.js)

Tenant frontend for the shared Buytly API. Sends `X-Site-Slug: buildwise` on every request.

## Local dev

```bash
cp .env.example .env.local   # fill secrets
npm install
npm run dev
```

See [`.env.example`](.env.example) for `NEXT_PUBLIC_SITE_*`, API URL, and support contact vars.

Production Docker/nginx: [server/docs/deployment.md](../../server/docs/deployment.md) (`buildwise-web` on port **3026**).

## Scripts

| Command           | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Dev server                                                          |
| `npm run build`   | Production build                                                    |
| `npm run gen:api` | Regenerate `src/api/generated/` from OpenAPI (`OPENAPI_URL` in env) |
