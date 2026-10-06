# Block 57 (Next.js)

Tenant frontend for **Block 57**, a single residential development in Cantonments, Accra, served by the shared Buytly API. Sends `X-Site-Slug: block57` on every request.

Started as a copy of [`apps/buildwise-web`](../buildwise-web); it keeps the auth, favorites and dashboard pages.

## Requirements

- The API must know the `block57` site (registered by `ensureDefaultSites` in `server/`).
- The project and its units come from the server seed: `npm run seed:block57` in `server/` (or `docker compose exec server npm run seed:block57`). It creates the project with slug `block-57`, which must match `NEXT_PUBLIC_BLOCK57_PROJECT_SLUG`. Don't rename the project in the dashboard: that changes its slug and the site would need a rebuild.

## Local dev

```bash
cp .env.example .env.local   # fill secrets
npm install                  # or from repo root, or: npm ci --no-workspaces
npm run dev                  # http://localhost:3002
```

Environment variables (see [`.env.example`](.env.example)):

| Variable                                                                                      | Purpose                                                              |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                                                                         | Buytly API base, e.g. `http://localhost:5025/api/v1`                 |
| `NEXT_PUBLIC_SITE_SLUG`                                                                       | Tenant slug sent as `X-Site-Slug` — `block57`                        |
| `NEXT_PUBLIC_SITE_NAME`                                                                       | Display name — `Block 57`                                            |
| `NEXT_PUBLIC_SITE_PUBLIC_URL`                                                                 | Public origin (`http://localhost:3002`, prod `https://block-57.com`) |
| `NEXT_PUBLIC_BLOCK57_PROJECT_SLUG`                                                            | Slug of the Block 57 project in the API — `block-57`                 |
| `NEXT_PUBLIC_SHOW_PRICES`                                                                     | `true` to show prices on the public site (default `false`)           |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`                                                                | Google sign-in (must match the server)                               |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`                                                             | Dashboard map picker                                                 |
| `NEXT_PUBLIC_SUPPORT_PHONE`, `NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY`, `NEXT_PUBLIC_SUPPORT_EMAIL` | Contact details (`+233 244 777 772`, `info@block-57.com`)            |
| `OPENAPI_URL`                                                                                 | Spec for `npm run gen:api`                                           |

All `NEXT_PUBLIC_*` values are inlined at build time; changing them needs a rebuild.

Production Docker/nginx: [server/docs/deployment.md](../../server/docs/deployment.md) (`block57-web` on port **3027**; build from repo root with `docker compose build block57-web`).

## App structure

- **Two root layouts** (route groups, so URLs are unchanged). Moving between them reloads the page, so neither group's global CSS leaks into the other.
  - `src/app/(site)`: the public Block 57 site. Own stylesheet `src/styles/block57/global.scss`, no Bootstrap/Homez. Lighter providers (`QueryProvider liveSync={false}`, auth, toaster). Unknown URLs hit `(site)/[...not_found]`, which returns a real 404 with `(site)/not-found.js`.
  - `src/app/(app)`: login, register, password/email pages and `dashboard-*`, on the Homez/Bootstrap theme with `ClientLayout`. Every page is `noindex`.
- **Auth entry**: `/login/` (`AUTH_ENTRY_PATH`) renders sign-in/sign-up inline. It reads `?auth=signin|signup`, plus `next` (same-origin paths only), `role` and `intent`. `/register/` redirects there with `auth=signup`. Build links with `buildAuthEntryUrl()` (`src/lib/auth/authIntent.js`).
- **Trailing slashes**: `trailingSlash: true` matches the WordPress URLs. Redirect sources in `next.config.js` must end with `/`. Compare pathnames with `normalizePath` / `isSamePath` (`src/lib/url/normalizePath.js`).
- **Dashboard accent**: `--primary-color` / `--primary-color-rgb` in `public/scss/_style.scss` `:root` (provisional bronze `#9a7b4f`).

## Brand assets (placeholders)

The logos (`public/images/block57-logo-white.png`, `block57-logo-dark.png`) and favicons (`public/images/block57-favicon.png`, `favicon-16x16.png`, `favicon-32x32.png`, `src/app/icon.png`, `src/app/apple-icon.png`) are **placeholders**: a plain "BLOCK 57" wordmark and a "57" tile. Replace them with the real Block 57 assets once they are captured from block-57.com. After replacing `block57-favicon.png`, run `npm run gen:favicons` (Windows/PowerShell) or resize the files by hand.

## Scripts

| Command           | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Dev server on port 3002 (plus the API codegen watcher)              |
| `npm run build`   | Production build                                                    |
| `npm start`       | Serve the production build on port 3027                             |
| `npm run gen:api` | Regenerate `src/api/generated/` from OpenAPI (`OPENAPI_URL` in env) |
