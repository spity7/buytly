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
| /auth/verify-email        | POST   | Public | token                                  | user           |
| /auth/resend-verification | POST   | Public | email                                  | message        |
| /auth/forgot-password     | POST   | Public | email                                  | message        |
| /auth/reset-password      | POST   | Public | token, password                        | success        |
| /auth/change-password     | POST   | User   | currentPassword, newPassword           | success        |

**Dependencies:** users (User model), token.service, email.service, notifications

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

| Endpoint                          | Method | Auth   | Input                    | Output                         |
| --------------------------------- | ------ | ------ | ------------------------ | ------------------------------ |
| /catalog/property-types           | GET    | Public | —                        | active types                   |
| /catalog/amenities                | GET    | Public | —                        | active amenities               |
| /catalog/nearby                   | GET    | Public | lat, lng                 | nearby POI preview             |
| /admin/catalog/property-types     | GET    | Admin  | —                        | all types + `listingCount`     |
| /admin/catalog/property-types     | POST   | Admin  | value, label, sortOrder  | created type                   |
| /admin/catalog/property-types/:id | PATCH  | Admin  | label, sortOrder, active | updated type                   |
| /admin/catalog/property-types/:id | DELETE | Admin  | —                        | deleted (if unused)            |
| /admin/catalog/amenities          | GET    | Admin  | —                        | all amenities + `listingCount` |
| /admin/catalog/amenities          | POST   | Admin  | value, label, sortOrder  | created amenity                |
| /admin/catalog/amenities/:id      | PATCH  | Admin  | label, sortOrder, active | updated amenity                |
| /admin/catalog/amenities/:id      | DELETE | Admin  | —                        | deleted (if unused)            |

Default types and amenities are inserted automatically when the collections are empty (first API access). The **`villa`** property type is always upserted as active (required for single projects) and **cannot be edited, deleted, or deactivated**. Other types can be deactivated or deleted when unused. `npm run seed:reset` reloads the full demo catalog (defaults + demo-only amenities). Listing create/update validates `type` and `amenities` against active catalog entries. Catalog **`value` (slug / stored amenity string) is immutable** after creation — updates change label, sort order, and active flag only. Admin create/update rejects **duplicate display names** (case-insensitive) and duplicate property-type slugs on create. **`currency` is always stored as `USD`** on properties (client cannot override).

**Dependencies:** nearby.service, cache.service (nearby preview)

---

## projects

**Responsibility:** Project-centric listing container (`single` = one unit, `compound` = multiple units). Holds shared location, amenities, and marketing media. All commerce is **sale-only** (no `listingType`).

| Endpoint                     | Method       | Auth         | Input                                     | Output                          |
| ---------------------------- | ------------ | ------------ | ----------------------------------------- | ------------------------------- |
| /projects                    | GET          | Public       | kind, city, geo, search, pagination       | projects + aggregated unitCount |
| /projects/mine               | GET          | Seller/Agent | status, kind, search, pagination, trashed | owner's projects                |
| /projects/:id                | GET          | Public       | includeUnits?                             | project detail                  |
| /projects                    | POST         | Seller/Agent | title, kind, location, …                  | created project                 |
| /projects/:id                | PATCH/DELETE | Owner/Agent  | updates                                   | updated/deleted                 |
| /projects/:id/properties     | GET/POST     | Owner/Agent  | unit payloads (POST)                      | units under project             |
| /projects/:id/media          | POST         | Owner/Agent  | file                                      | media item                      |
| /admin/projects              | GET          | Admin        | status, kind, search, pagination          | all projects                    |
| /admin/projects/:id/moderate | PATCH        | Admin        | status                                    | moderated project               |

Publish rules: `single` → exactly one unit (type forced to `villa` on create/update); `compound` → ≥ 1 unit when status is `pending` or `active`. **Unit vs project status:** sellers may set units to `pending` under a `draft` project, but **admins may only activate a unit when its parent project is `active` or `sold`**. Project submission moves all `draft` units on that project to `pending` together with the project. **`kind` may only change while the project is `draft` and has zero non-trashed units** (same rule for sellers and admins); otherwise `PATCH` with a new `kind` returns 400. Publish validation uses the **requested** `kind` when `kind` and `status` are sent in the same update. When a seller submits a project for review, **draft units** on that project are moved to `pending` and admins are notified. Approving a project (`admin` → `active`) also sets **pending units** on that project to `active`. Public project/unit payloads only expose units with status `active` or `sold` to non-owners, and public property list/detail requires the parent project to be `active` or `sold` (non-trashed). Pending project submissions notify admins (`project.pending_review`). Project gallery uploads use `POST /projects/:id/media` (multipart field `media`); reorder via `PUT /projects/:id/media/order`.

**Soft delete / trash:** `DELETE /projects/:id` sets `deletedAt` and `status: archived`, and trashes all non-trashed units on that project using the **same** `deletedAt` timestamp (so restore can match them). Trashed projects appear in `GET /projects/mine?trashed=true` only (not the default list). `PATCH /projects/:id/restore` clears the project trash flag and restores units that were trashed with that project timestamp. Owners/agents can load trashed projects/units by id for restore; public/anonymous reads still require `deletedAt: null`.

**Permanent delete:** `DELETE /projects/:id/permanent` removes a **trashed** project, all its units, GCS media, favorites, reviews, and non-blocking bookings/transactions. Blocked (409) when any unit has open visit bookings or purchase/transaction records. `DELETE /properties/:id/permanent` applies the same rules to a single trashed unit.

**Dependencies:** properties (units), gcs.service, cache.service, notifications

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

Create/update payloads accept optional `floorPlans[]` and `virtualTourUrl`. Floor plan images are uploaded via `/floor-plans/image` and referenced by `gcsKey` in the array. Listing media supports multiple images plus **one** optional video (`POST /properties/:id/media` returns 400 when a second video is uploaded). Image `order` starts at 0 for the cover photo (cards, map pins, gallery hero). Reorder with `PUT /properties/:id/media/order` passing every image id exactly once. The public property page shows photos in the gallery and the video in a separate Video section. **What's Nearby** is not stored on the listing — it is generated from latitude/longitude via `GET /properties/:id/nearby`.

Non-admin create/update cannot publish directly: `status: "active"` is stored as `pending`. Omitting `status` on PATCH keeps the current status unless **material fields** change on an active listing (title, description, price, amenities, floor plans, etc.) — then status becomes `pending` again. Media add/remove on an active listing also triggers re-review. Non-admins cannot set `sold` or `archived` via create/update. Unit payloads do not include `listingType` or standalone location (project is the location source).

**Soft delete / trash:** `DELETE /properties/:id` sets `deletedAt` and `status: archived`. Trashed listings appear in `GET /properties/mine?trashed=true`. The default `GET /properties/mine` list excludes units whose parent project is trashed (even if the unit row is not trashed yet). `PATCH /properties/:id/restore` clears `deletedAt` and sets `status: draft`. Admin archive via moderate uses the same soft-delete semantics.

**Permanent delete:** `DELETE /properties/:id/permanent` — see projects section above (trash required; booking/transaction guards).

Public `GET /properties` defaults to `status=active` and only includes units whose parent project is `active` or `sold`. The public list accepts only `active` or `sold` as a status filter (draft/pending/archived return 400). Public `GET /properties/:id` returns non-active listings only to the owner, assigned agent, or admin (optional auth); active/sold units are hidden when the parent project is not public. **Admins** may also `GET`/`PATCH` soft-deleted (`archived`) listings through the property endpoints; restoring via `PATCH` with a non-archived status clears `deletedAt`.

Pending unit submissions notify all active admins (includes `projectId` / `projectTitle` when available). Admin moderation notifies the listing owner.

**Dependencies:** gcs.service, image.service (via gcs upload), cache.service, notifications

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

Completing a transaction sets the property to `sold` and invalidates the property list cache.

**Dependencies:** properties, notifications, cache.service

---

## admin

**Responsibility:** User management, listing moderation, platform analytics.

| Endpoint                       | Method | Auth  | Input                                                                           | Output                                             |
| ------------------------------ | ------ | ----- | ------------------------------------------------------------------------------- | -------------------------------------------------- |
| /admin/users                   | GET    | Admin | role, isActive, deleted (`true`/`false`/`all`)                                  | user list (includes deletedEmail for soft-deleted) |
| /admin/users/:id               | GET    | Admin | —                                                                               | user detail + related counts                       |
| /admin/users/:id/status        | PATCH  | Admin | isActive                                                                        | updated user (active users only)                   |
| /admin/users/:id/role          | PATCH  | Admin | role                                                                            | updated user                                       |
| /admin/properties              | GET    | Admin | pagination, status, type, search (partial title/description), sortBy, sortOrder | all listings (includes archived / soft-deleted)    |
| /admin/properties/:id/moderate | PATCH  | Admin | status                                                                          | moderated listing                                  |
| /admin/projects                | GET    | Admin | pagination, status, kind, search, sortBy, sortOrder                             | all projects                                       |
| /admin/projects/:id/moderate   | PATCH  | Admin | status                                                                          | moderated project                                  |
| /admin/analytics               | GET    | Admin | —                                                                               | KPI analytics                                      |

Moderation notifies the listing owner (in-app + email).

**Dependencies:** users, properties, bookings, transactions, cache.service, notifications

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

**Dependencies:** email.service

**Internal API:** Domain modules call `notificationService.notifyFromEvent(eventKey, { userId, context })` or `notifyMany()`. Lower-level `notify()` remains available. Events are defined in `notification.catalog.js` (booking, transaction, property, auth). `notify()` skips deleted/inactive users and respects `users.notificationPreferences` for in-app/email delivery. Security token emails (verify/reset) bypass preferences and are sent directly via `email.service`.

**Notification `data` shape:** `{ event, entityType, entityId?, propertyId?, status?, href }` — client uses `href` for deep links when present.
