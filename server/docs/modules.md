# Modules Reference

## auth

**Responsibility:** User registration, login, JWT token management, password reset.

| Endpoint                  | Method | Auth   | Input                                  | Output         |
| ------------------------- | ------ | ------ | -------------------------------------- | -------------- |
| /auth/register            | POST   | Public | email, password, confirmPassword, role | user + tokens  |
| /auth/login               | POST   | Public | email, password                        | user + tokens  |
| /auth/google              | POST   | Public | idToken, role? (new sign-ups)          | user + tokens  |
| /auth/refresh             | POST   | Public | refreshToken                           | new token pair |
| /auth/logout              | POST   | Public | refreshToken                           | success        |
| /auth/verify-email        | POST   | Public | token (issuing site only)              | user           |
| /auth/resend-verification | POST   | Public | email                                  | message        |
| /auth/forgot-password     | POST   | Public | email                                  | message        |
| /auth/reset-password      | POST   | Public | token (issuing site only), password    | success        |
| /auth/change-password     | POST   | User   | currentPassword, newPassword           | success        |

**Dependencies:** users (User model), token.service, email.service, siteBrand, notifications

Verify and reset emails link to the request site's public URL (`buildSiteLink`, `APP_URL` only as fallback) and carry the site's name — see [auth-flow.md](./auth-flow.md#email-links).

---

## contact

**Responsibility:** Public contact / inquire form — stores each submission as an `Inquiry` for the current site, then emails the site inbox.

| Endpoint | Method | Auth   | Input                                                                                                               | Output  |
| -------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------- | ------- |
| /contact | POST   | Public | firstName, lastName, email, message; optional phone, residenceType, unitId, unitLabel, pagePath, website (honeypot) | success |

Rate limit: 10 requests / hour / IP.

**Payload:** `firstName`, `lastName` (1–80), `email`, `message` (10–5000) are required. Optional: `phone` (≤ 40), `residenceType` (≤ 80), `unitLabel` (≤ 80), `unitId` (24-hex ObjectId), `pagePath` (≤ 300, site path starting with a single `/`, no whitespace) and `website` (honeypot, any value; never fails validation). Strings are trimmed; blank optional fields count as not provided; unknown keys (e.g. `siteId`, `status`) are dropped.

**Behaviour:**

1. **Honeypot** — any `website` value other than `""` or `null` (including whitespace or a very long string) returns the normal `201` ("Your message has been sent.") but nothing is stored or emailed. The field is never rejected by validation, so a bot gets no hint that it gave itself away.
2. **Store first** — an `inquiries` document is created with the request `siteId`, the submitted fields, `status: new` and `emailDelivered: false`. `unitId` is kept only when that unit belongs to the current site (otherwise stored as `null`; `unitLabel` is kept as sent). `sourceUrl` is the site public base URL (`resolveSitePublicBaseUrl`, falling back to `APP_URL`) plus `pagePath` when sent.
3. **Inbox email** — sent to the site's `branding.contactInboxEmail`, falling back to `CONTACT_INBOX_EMAIL`, with Reply-To set to the submitter. Subject and body name the site (e.g. `Block 57 contact form — {name}`). Includes phone, residence type, unit label and the source URL when present. On success `emailDelivered` is set to `true`.
4. **Auto-reply** — sent to the submitter after the inbox email, branded with the site name; Reply-To is the site's `branding.supportEmail` when set.
5. Email failures are logged (`console.error`) and the request still returns `201`; an inbox failure leaves `emailDelivered: false` and skips the auto-reply.

Admins review inquiries via `GET /admin/inquiries` (see [admin](#admin)).

**Dependencies:** inquiries (Inquiry model), properties (unit ownership check), sites (public URL), email.service

---

## users

**Responsibility:** Profile management, preferences, saved searches, avatar upload.

| Endpoint                           | Method   | Auth   | Input                                                                                 | Output                 |
| ---------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------- | ---------------------- |
| /users/me                          | GET      | User   | —                                                                                     | full profile           |
| /users/me                          | PATCH    | User   | firstName, lastName, phoneCountryCode, phoneNumber (empty `phoneNumber` clears phone) | updated profile        |
| /users/me                          | DELETE   | User   | password (local accounts)                                                             | success                |
| /users/me/preferences              | PATCH    | User   | budget, locations, types                                                              | preferences            |
| /users/me/notification-preferences | PATCH    | User   | email/inApp toggles per category                                                      | notification prefs     |
| /users/me/saved-searches           | POST/GET | User   | name, filters                                                                         | searches               |
| /users/me/saved-searches/:id       | DELETE   | User   | —                                                                                     | success                |
| /users/me/social-links             | PATCH    | User   | social URLs                                                                           | updated profile        |
| /users/me/avatar                   | POST     | User   | multipart file                                                                        | avatar + signed URL    |
| /users/me/avatar                   | DELETE   | User   | —                                                                                     | success                |
| /users/:id                         | GET      | Public | —                                                                                     | limited public profile |

**Dependencies:** gcs.service, image.service (via gcs upload)

---

## catalog

**Responsibility:** Admin-managed property types and amenities; public read for forms and filters; coordinate-based nearby preview before a listing exists.

| Endpoint                          | Method | Auth   | Input                    | Output                               |
| --------------------------------- | ------ | ------ | ------------------------ | ------------------------------------ |
| /catalog/property-types           | GET    | Public | —                        | active types + public `listingCount` |
| /catalog/amenities                | GET    | Public | —                        | active amenities                     |
| /catalog/nearby                   | GET    | Public | lat, lng                 | nearby POI preview                   |
| /admin/catalog/property-types     | GET    | Admin  | —                        | all types + `listingCount`           |
| /admin/catalog/property-types     | POST   | Admin  | value, label, sortOrder  | created type                         |
| /admin/catalog/property-types/:id | PATCH  | Admin  | label, sortOrder, active | updated type                         |
| /admin/catalog/property-types/:id | DELETE | Admin  | —                        | deleted (if unused)                  |
| /admin/catalog/amenities          | GET    | Admin  | —                        | all amenities + `listingCount`       |
| /admin/catalog/amenities          | POST   | Admin  | value, label, sortOrder  | created amenity                      |
| /admin/catalog/amenities/:id      | PATCH  | Admin  | label, sortOrder, active | updated amenity                      |
| /admin/catalog/amenities/:id      | DELETE | Admin  | —                        | deleted (if unused)                  |

Default **amenities** are upserted on the first catalog API access per server process (missing values only). **Property types are admin- or seed-managed only** — they are not auto-created on catalog reads. Types can be deactivated or deleted when unused unless marked protected in catalog defaults. `npm run seed:reset` loads demo listing types plus demo amenities. Run `npm run catalog:prune-legacy-types` to drop unused legacy bootstrap types from an existing DB. Listing create/update validates `type` and `amenities` against active catalog entries. Catalog **`value` (slug / stored amenity string) is immutable** after creation — updates change label, sort order, and active flag only. Admin create/update rejects **duplicate display names** (case-insensitive) and duplicate property-type slugs on create. **`currency` is always stored as `USD`** on properties (client cannot override).

**Dependencies:** nearby.service

---

## projects

**Responsibility:** Project-centric listing container. Holds shared location, amenities, and marketing media; sellable **units** are properties linked by `projectId`. All commerce is **sale-only** (no `listingType`).

| Endpoint                     | Method       | Auth         | Input                               | Output                                                                                      |
| ---------------------------- | ------------ | ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| /projects                    | GET          | Public       | city, geo, search, pagination       | projects + aggregated unitCount                                                             |
| /projects/mine               | GET          | Seller/Agent | status, search, pagination, trashed | owner's projects                                                                            |
| /projects/:id                | GET          | Public       | includeUnits?                       | project detail (media signed URLs; `includeUnits=true` embeds units with signed media URLs) |
| /projects                    | POST         | Seller/Agent | title, location, …                  | created project                                                                             |
| /projects/:id                | PATCH/DELETE | Owner/Agent  | updates                             | updated/deleted                                                                             |
| /projects/:id/properties     | GET/POST     | Owner/Agent  | unit payloads (POST)                | units under project                                                                         |
| /projects/:id/media          | POST         | Owner/Agent  | file                                | media item                                                                                  |
| /admin/projects              | GET          | Admin        | status, search, pagination          | all projects                                                                                |
| /admin/projects/:id/moderate | PATCH        | Admin        | status                              | moderated project                                                                           |

Publish rules: ≥ 1 **live** (non-trashed) unit when status is `pending` or `active`. When the last live unit on a project is archived (seller delete or admin archive), a parent in `active` or `pending` is moved back to `draft` so the public site does not show a project without a sellable unit. Marking an **active** project `sold` (seller `PATCH` or admin moderate) sets **all** non-trashed units on that project to `sold`. Owner project detail includes `trashedUnitCount` (units in trash while the project is not trashed). **Unit vs project status:** sellers may set units to `pending` under a `draft` project, but **admins may only activate a unit when its parent project is `active` or `sold`**. Project submission moves all `draft` units on that project to `pending` together with the project. When a seller submits a project for review, **draft units** on that project are moved to `pending` and admins are notified. Approving a project (`admin` → `active`) also sets **pending units** on that project to `active`. Returning a project to `draft` (`admin` moderate) sets **active** and **pending** units on that project back to `draft`. Public project/unit payloads only expose units with status `active` or `sold` to non-owners, and public property list/detail requires the parent project to be `active` or `sold` (non-trashed). Pending project submissions notify admins (`project.pending_review`). Project gallery uploads use `POST /projects/:id/media` (multipart field `media`); reorder via `PUT /projects/:id/media/order`.

**Soft delete / trash:** `DELETE /projects/:id` sets `deletedAt` and `status: archived`, and trashes **all** units on that project using the **same** `deletedAt` timestamp (including units already in trash individually). Admin `PATCH /admin/projects/:id/moderate` with `status: archived` uses the same cascade. Trashed projects appear in `GET /projects/mine?trashed=true` only (not the default list). `PATCH /projects/:id/restore` clears the project trash flag and restores units that share that project trash timestamp. Admin moderation back to a non-archived status restores matching units the same way. Owners/agents can load trashed projects/units by id for restore; every other viewer (anonymous, or logged in without managing the listing) only matches `deletedAt: null`. Sellers cannot mutate units (including media) while the parent project is trashed.

**Permanent delete:** `DELETE /projects/:id/permanent` removes a **trashed** project, all its units, GCS media, favorites, reviews, and non-blocking bookings/transactions. Blocked (409) when any unit has open visit bookings or purchase/transaction records. `DELETE /properties/:id/permanent` applies the same rules to a single trashed unit.

**Dependencies:** properties (units), gcs.service, notifications

---

## properties

**Responsibility:** Sellable **units** under a project. Location is inherited from the parent project on create/update. Geo search, filtering, media management.

| Endpoint                          | Method       | Auth                   | Input                                                                                    | Output                                   |
| --------------------------------- | ------------ | ---------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| /properties                       | GET          | Public                 | filters, pagination                                                                      | property list                            |
| /properties/mine                  | GET          | Seller/Agent           | pagination, status, type, search (partial title/description), sortBy, sortOrder, trashed | user's listings (trashed=true for trash) |
| /properties/:id/restore           | PATCH        | Owner/Agent/Admin      | —                                                                                        | restored draft listing                   |
| /properties/:id                   | GET          | Public                 | —                                                                                        | property detail                          |
| /properties/:id/nearby            | GET          | Public (optional auth) | —                                                                                        | nearby POIs (OpenStreetMap, 5 km radius) |
| /properties                       | POST         | Seller/Agent           | property data (**projectId** required)                                                   | created property                         |
| /properties/:id                   | PATCH/DELETE | Owner/Agent            | updates                                                                                  | updated/deleted                          |
| /properties/:id/media             | POST         | Owner/Agent            | file (image or one video)                                                                | media item                               |
| /properties/:id/media/order       | PUT          | Owner/Agent            | `{ imageIds: ObjectId[] }` — all listing images, order = cover first                     | property                                 |
| /properties/:id/media/:mediaId    | DELETE       | Owner/Agent            | —                                                                                        | success                                  |
| /properties/:id/floor-plans/image | POST         | Owner/Agent            | image file                                                                               | gcsKey + url                             |
| /properties/mine/reviews          | GET          | Seller/Agent/Admin     | pagination                                                                               | reviews + stats on managed listings      |
| /properties/:id/reviews           | GET          | Public (optional auth) | pagination                                                                               | reviews + stats                          |
| /properties/:id/reviews/check     | GET          | Optional auth          | —                                                                                        | hasReviewed                              |
| /properties/:id/reviews           | POST         | User                   | rating, title, text                                                                      | review                                   |
| /properties/:id/reviews/:reviewId | DELETE       | Author/Admin           | —                                                                                        | success                                  |

Create/update payloads accept optional `floorPlans[]`, `virtualTourUrl`, `building` (string, max 50) and `floor` (integer -5..300); `null` (or a blank `building`) clears `building`/`floor`, and unset values are omitted from responses. Each floor plan level has **title** and **image** (`gcsKey` from `/floor-plans/image`; unit sale price is only on the property). Floor plans are allowed for **any** catalog property type. Images are uploaded via `/floor-plans/image` and referenced by `gcsKey` in the array. Listing media supports multiple images plus **one** optional video (`POST /properties/:id/media` returns 400 when a second video is uploaded). Image `order` starts at 0 for the cover photo (cards, map pins, gallery hero). Reorder with `PUT /properties/:id/media/order` passing every image id exactly once. The public property page shows photos in the gallery and the video in a separate Video section. **What's Nearby** is not stored on the listing — it is generated from latitude/longitude via `GET /properties/:id/nearby`.

Non-admin create/update cannot publish directly: `status: "active"` is stored as `pending`. Omitting `status` on PATCH keeps the current status unless **material fields** change on an active listing (title, description, price, amenities, floor plans, etc.) — then status becomes `pending` again. `building`, `floor` and `sortOrder` are not material. Media add/remove on an active listing also triggers re-review. Non-admins may set `status: "sold"` only when the listing is currently **active**; `archived` remains admin-only (seller trash). Marking a unit sold syncs the parent project to `sold` when every non-trashed unit on the project is sold. Unit payloads must not include `location` (API rejects unknown `location` on create/update); each unit stores a copy of the parent project’s location for search/geo, refreshed on unit update and when the project location changes.

**Soft delete / trash:** `DELETE /properties/:id` sets `deletedAt` and `status: archived`. Trashed listings appear in `GET /properties/mine?trashed=true` only when the parent project is **not** trashed (units trashed with a project are restored via `PATCH /projects/:id/restore`, not per-unit restore). The default `GET /properties/mine` list also excludes units whose parent project is trashed. `PATCH /properties/:id/restore` clears `deletedAt` and sets `status: draft` when the parent project is active; returns **400** if the parent project is still in trash. Admin un-archive via moderate clears `deletedAt` when the parent project is not trashed; moderating an archived unit back to `active` also re-publishes a parent project that was demoted to `draft` when that unit was the last live listing. Admin archive via moderate uses the same soft-delete semantics.

**Permanent delete:** `DELETE /properties/:id/permanent` — see projects section above (trash required; booking/transaction guards).

`viewCount` on `GET /properties/:id` and `GET /projects/:id` (and slug) increments only for **active** listings/projects when the caller is not the owner, assigned agent, or admin (dashboard previews and edits do not count). Project and unit counters are independent (`shouldIncrementListingView` in `property-status.js`).

Property detail responses populate `agentId` (when set) else `ownerId` with name, role, phone fields, and avatar; `attachMediaUrls` adds signed read URLs on nested contact avatars when `gcsKey` is present.

Public `GET /properties` without a `status` query includes **active and sold** units whose parent project is `active` or `sold`. Pass `status=active` or `status=sold` to narrow results. The `projectId` query parameter is intersected with that allowlist (unknown or non-public projects return an empty page). The public list accepts only `active` or `sold` as a status filter (draft/pending/archived return 400). Public `GET /properties/:id` and `GET /properties/:id/nearby` require a public parent project for `active` and `sold` units. Public `GET /properties/:id` allows anonymous access for `active` and `sold` listings on public projects; `draft`, `pending`, and `archived` are visible only to the owner, assigned agent, or admin (optional auth). A logged-in buyer, another seller or an unassigned agent gets the same result as an anonymous visitor on every detail read (`GET /properties/:id`, `/properties/:id/nearby`, `/projects/:id`, `/projects/slug/:slug`, `/projects/:id/properties`); `PATCH`, permanent delete and media/floor-plan writes on a listing they do not manage still return 404 — see `api-rules.md` → Detail read visibility. Agent profile listings (`GET` by agent) use the same parent-project filter. **Admins** may also `GET`/`PATCH` soft-deleted (`archived`) listings through the property endpoints; restoring via `PATCH` with a non-archived status clears `deletedAt` when the parent project is not trashed. New units cannot be added to **sold** projects.

Pending unit submissions notify all active admins (includes `projectId` / `projectTitle` when available). Admin moderation notifies the listing owner.

**Hidden prices:** on a site with `features.hidePublicPrices` (Block 57), unit and project reads by viewers who cannot manage the listing return `price: null` / `priceMin: null` / `priceMax: null` plus `priceLabel: "Price on request"`; the public list ignores price filters and price sort. The same applies to favorites, buyer bookings and transactions, and to the Buytly platform feeds (by the listing's source site). Full rules: [api-rules.md](./api-rules.md#hidden-prices).

**Dependencies:** gcs.service, image.service (via gcs upload), notifications

---

## agents

**Responsibility:** Agent profiles, listing counts, agent property listings.

| Endpoint               | Method | Auth   | Input           | Output          |
| ---------------------- | ------ | ------ | --------------- | --------------- |
| /agents                | GET    | Public | city, specialty | agent list      |
| /agents/me             | GET    | Agent  | —               | agent profile   |
| /agents/:id            | GET    | Public | —               | agent profile   |
| /agents/me             | PATCH  | Agent  | profile data    | updated profile |
| /agents/:id/properties | GET    | Public | pagination      | agent listings  |

**Dependencies:** properties, gcs.service

---

## favorites

**Responsibility:** Save/remove liked properties. Only **active** listings can be favorited.

| Endpoint                     | Method   | Auth | Input      | Output             |
| ---------------------------- | -------- | ---- | ---------- | ------------------ |
| /favorites                   | GET/POST | User | propertyId | favorites list     |
| /favorites/:propertyId       | DELETE   | User | —          | success            |
| /favorites/check/:propertyId | GET      | User | —          | isFavorite boolean |

POST returns 404 if the property is not active.

**Dependencies:** properties, gcs.service

---

## bookings

**Responsibility:** Schedule property visits, agent approval workflow.

| Endpoint             | Method | Auth               | Input                   | Output            |
| -------------------- | ------ | ------------------ | ----------------------- | ----------------- |
| /bookings            | POST   | Buyer              | propertyId, scheduledAt | booking           |
| /bookings/my         | GET    | Buyer              | filters                 | buyer bookings    |
| /bookings/agent      | GET    | Seller/Agent       | filters                 | assigned bookings |
| /bookings/:id/status | PATCH  | Seller/Agent/Admin | status                  | updated booking   |
| /bookings/:id/cancel | PATCH  | Buyer              | —                       | cancelled booking |

**Dependencies:** properties, notifications

---

## transactions

**Responsibility:** Purchase transaction tracking and status management (`type: buy` only).

| Endpoint                 | Method | Auth         | Input                    | Output              |
| ------------------------ | ------ | ------------ | ------------------------ | ------------------- |
| /transactions            | POST   | Buyer        | propertyId, type, amount | transaction         |
| /transactions/my         | GET    | User         | pagination, status, type | user transactions   |
| /transactions/:id        | GET    | User         | —                        | transaction detail  |
| /transactions/:id/status | PATCH  | Seller/Agent | status                   | updated transaction |

Completing a transaction sets the property to `sold`, then sets the parent project to `sold` when every non-trashed unit on that project is sold. Seller or admin `PATCH` / moderate of a unit to `sold` triggers the same parent sync when all units are sold. The project owner is notified via `project.status_changed` when the project auto-transitions to `sold`. Listing caches are invalidated. Public project detail by slug/id is available for `active` and `sold` projects; unit lists on the project page separate available (`active`) and `sold` units.

**Dependencies:** properties, notifications

---

## admin

**Responsibility:** User management, listing moderation, contact inquiries, platform analytics.

| Endpoint                                | Method | Auth                  | Input                                                                          | Output                                             |
| --------------------------------------- | ------ | --------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- |
| /admin/sites                            | GET    | Admin                 | —                                                                              | tenant sites (platform admin / cross-site)         |
| /admin/users                            | GET    | Admin                 | role, isActive, deleted (`true`/`false`/`all`)                                 | user list (includes deletedEmail for soft-deleted) |
| /admin/users/:id                        | GET    | Admin                 | —                                                                              | user detail + related counts                       |
| /admin/users/:id/status                 | PATCH  | Admin                 | isActive                                                                       | updated user (active users only)                   |
| /admin/users/:id/role                   | PATCH  | Admin                 | role                                                                           | updated user                                       |
| /admin/properties                       | GET    | Admin                 | pagination, status, type, search, sortBy, sortOrder, `siteId` (platform admin) | all listings (includes archived / soft-deleted)    |
| /admin/properties/:id/moderate          | PATCH  | Admin                 | status                                                                         | moderated listing                                  |
| /admin/properties/:id/platform-featured | PATCH  | Admin (platform site) | `{ visibleOnPlatform }`                                                        | partner listing marketplace featuring              |
| /admin/projects/:id/platform-featured   | PATCH  | Admin (platform site) | `{ visibleOnPlatform }`                                                        | partner project marketplace featuring              |
| /admin/projects                         | GET    | Admin                 | pagination, status, search, sortBy, sortOrder, `siteId` (platform admin)       | all projects                                       |
| /admin/projects/:id/moderate            | PATCH  | Admin                 | status                                                                         | moderated project                                  |
| /admin/inquiries                        | GET    | Admin                 | pagination, status (`new`/`contacted`/`closed`), search                        | current site's inquiries, newest first             |
| /admin/inquiries/:id                    | PATCH  | Admin                 | `{ status }`                                                                   | updated inquiry (404 for other sites' inquiries)   |
| /admin/analytics                        | GET    | Admin                 | —                                                                              | KPI analytics                                      |

Moderation notifies the listing owner (in-app + email).

**Dependencies:** users, properties, bookings, transactions, inquiries, notifications

Platform admins (`platformPermissions` on Buytly `admin` users) may pass `?siteId=` on list/analytics endpoints to moderate partner tenants.

**Inquiries are private to each site:** `/admin/inquiries` always filters by the request site (`getRequestSiteId()`), with no `?siteId=` override — a Buytly platform admin sees only Buytly inquiries, and tenant inquiries are visible only to that tenant's admins. `search` is a case-insensitive literal match (regex-escaped, ≤ 200 chars) on first name, last name, email, phone and message; `limit` ≤ 100.

---

## platform

**Responsibility:** Buytly-only cross-site discovery (partner listings).

| Endpoint                    | Method | Auth | Input                                                          | Output                                   |
| --------------------------- | ------ | ---- | -------------------------------------------------------------- | ---------------------------------------- |
| /platform/featured-listings | GET    | —    | page, limit, filters (status, city, type, price, search, sort) | Partner units + `sourceSite` metadata    |
| /platform/featured-projects | GET    | —    | page, limit, filters (status, city, search, sort)              | Partner projects + `sourceSite` metadata |

Requires resolved site `kind: platform` (Buytly Origin / `X-Site-Slug: buytly`). Default feeds include **Buytly first-party** listings (active/sold on the platform site) plus partner tenant rows (opt-in / default-visible rules). Pass `partnersOnly=true` for partner-only results (e.g. home “Partner developments” block).

Featuring is **Buytly admin only** (`PATCH /admin/.../platform-featured` on the platform site). Tenant sellers cannot read or write `visibleOnPlatform` on standard property/project routes.

Rows from a source site with `features.hidePublicPrices` (Block 57) carry `price: null` (units) or `priceMin`/`priceMax: null` (projects) plus `priceLabel: "Price on request"`; such units never match `minPrice`/`maxPrice` and are listed after priced units when `sortBy=price` ([api-rules.md](./api-rules.md#hidden-prices)).

**Dependencies:** properties, projects, sites

---

## notifications

**Responsibility:** In-app notifications and email triggers.

| Endpoint                    | Method | Auth | Input                        | Output            |
| --------------------------- | ------ | ---- | ---------------------------- | ----------------- |
| /notifications              | GET    | User | `unread`, `type`, pagination | notification list |
| /notifications/:id          | DELETE | User | —                            | deleted           |
| /notifications/:id/read     | PATCH  | User | —                            | marked read       |
| /notifications/read-all     | PATCH  | User | —                            | all marked read   |
| /notifications/unread-count | GET    | User | —                            | count             |

**Dependencies:** email.service, siteBrand (email link base, site name)

**Internal API:** Domain modules call `notificationService.notifyFromEvent(eventKey, { userId, context })` or `notifyMany()`. Lower-level `notify()` remains available. Events are defined in `notification.catalog.js` (booking, transaction, property, auth). `notify()` skips deleted/inactive users and respects `users.notificationPreferences` for in-app/email delivery. Security token emails (verify/reset) bypass preferences and are sent directly via `email.service`.

**Email links and branding:** catalog events return a relative `ctaPath`; `buildNotificationPayload` turns it into `emailData.ctaUrl` by prefixing the request site's public URL (`buildSiteLink`, `APP_URL` only without a site). The in-app `data.href` stays relative. `auth.welcome` is titled `Welcome to {site name}`, and emails use the site's name and sender name (see `architecture.md` → Per-site branding).

**Notification `data` shape:** `{ event, entityType, entityId?, propertyId?, status?, href }` — client uses `href` for deep links when present.
