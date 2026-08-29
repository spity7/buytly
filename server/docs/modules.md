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

| Endpoint                     | Method   | Auth   | Input                                                                                 | Output                 |
| ---------------------------- | -------- | ------ | ------------------------------------------------------------------------------------- | ---------------------- |
| /users/me                    | GET      | User   | —                                                                                     | full profile           |
| /users/me                    | PATCH    | User   | firstName, lastName, phoneCountryCode, phoneNumber (empty `phoneNumber` clears phone) | updated profile        |
| /users/me                    | DELETE   | User   | password (local accounts)                                                             | success                |
| /users/me/preferences                 | PATCH    | User   | budget, locations, types                                                              | preferences            |
| /users/me/notification-preferences    | PATCH    | User   | email/inApp toggles per category                                                      | notification prefs     |
| /users/me/saved-searches     | POST/GET | User   | name, filters                                                                         | searches               |
| /users/me/saved-searches/:id | DELETE   | User   | —                                                                                     | success                |
| /users/me/social-links       | PATCH    | User   | social URLs                                                                           | updated profile        |
| /users/me/avatar             | POST     | User   | multipart file                                                                        | avatar + signed URL    |
| /users/me/avatar             | DELETE   | User   | —                                                                                     | success                |
| /users/:id                   | GET      | Public | —                                                                                     | limited public profile |

**Dependencies:** gcs.service, image.service (via gcs upload)

---

## properties

**Responsibility:** CRUD listings, geo search, filtering, media management.

| Endpoint                          | Method       | Auth                   | Input                                                                                                 | Output                                   |
| --------------------------------- | ------------ | ---------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| /properties                       | GET          | Public                 | filters, pagination                                                                                   | property list                            |
| /properties/mine                  | GET          | Seller/Agent           | pagination, status, type, listingType, search (partial title/description), sortBy, sortOrder, trashed | user's listings (trashed=true for trash) |
| /properties/:id/restore           | PATCH        | Owner/Agent/Admin      | —                                                                                                     | restored draft listing                   |
| /properties/:id                   | GET          | Public                 | —                                                                                                     | property detail                          |
| /properties                       | POST         | Seller/Agent           | property data                                                                                         | created property                         |
| /properties/:id                   | PATCH/DELETE | Owner/Agent            | updates                                                                                               | updated/deleted                          |
| /properties/:id/media             | POST         | Owner/Agent            | file                                                                                                  | media item                               |
| /properties/:id/media/:mediaId    | DELETE       | Owner/Agent            | —                                                                                                     | success                                  |
| /properties/:id/floor-plans/image | POST         | Owner/Agent            | image file                                                                                            | gcsKey + url                             |
| /properties/:id/reviews           | GET          | Public (optional auth) | pagination                                                                                            | reviews + stats                          |
| /properties/:id/reviews/check     | GET          | Optional auth          | —                                                                                                     | hasReviewed                              |
| /properties/:id/reviews           | POST         | User                   | rating, title, text                                                                                   | review                                   |
| /properties/:id/reviews/:reviewId | DELETE       | Author/Admin           | —                                                                                                     | success                                  |

Create/update payloads accept optional `floorPlans[]` and `virtualTourUrl`. Floor plan images are uploaded via `/floor-plans/image` and referenced by `gcsKey` in the array.

Non-admin create/update cannot publish directly: `status: "active"` is stored as `pending`. Omitting `status` on PATCH keeps the current status unless **material fields** change on an active listing (title, description, price, location, amenities, floor plans, etc.) — then status becomes `pending` again. Media add/remove on an active listing also triggers re-review. Non-admins cannot set `sold`, `rented`, or `archived` via create/update.

**Soft delete / trash:** `DELETE /properties/:id` sets `deletedAt` and `status: archived`. Trashed listings appear in `GET /properties/mine?trashed=true`. `PATCH /properties/:id/restore` clears `deletedAt` and sets `status: draft`. Admin archive via moderate uses the same soft-delete semantics.

Public `GET /properties` defaults to `status=active`. The public list accepts only `active`, `sold`, or `rented` as a status filter (draft/pending/archived return 400). Public `GET /properties/:id` returns non-active listings only to the owner, assigned agent, or admin (optional auth). **Admins** may also `GET`/`PATCH` soft-deleted (`archived`) listings through the property endpoints; restoring via `PATCH` with a non-archived status clears `deletedAt`.

Pending submissions notify all active admins. Admin moderation notifies the listing owner.

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

**Responsibility:** Buy/rent transaction tracking and status management.

| Endpoint                 | Method | Auth         | Input                    | Output              |
| ------------------------ | ------ | ------------ | ------------------------ | ------------------- |
| /transactions            | POST   | Buyer        | propertyId, type, amount | transaction         |
| /transactions/my         | GET    | User         | pagination, status, type | user transactions   |
| /transactions/:id        | GET    | User         | —                        | transaction detail  |
| /transactions/:id/status | PATCH  | Seller/Agent | status                   | updated transaction |

Completing a transaction sets the property to `sold` or `rented` and invalidates the property list cache.

**Dependencies:** properties, notifications, cache.service

---

## admin

**Responsibility:** User management, listing moderation, platform analytics.

| Endpoint                       | Method | Auth  | Input                                                                                        | Output                                             |
| ------------------------------ | ------ | ----- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| /admin/users                   | GET    | Admin | role, isActive, deleted (`true`/`false`/`all`)                                               | user list (includes deletedEmail for soft-deleted) |
| /admin/users/:id               | GET    | Admin | —                                                                                            | user detail + related counts                       |
| /admin/users/:id/status        | PATCH  | Admin | isActive                                                                                     | updated user (active users only)                   |
| /admin/users/:id/role          | PATCH  | Admin | role                                                                                         | updated user                                       |
| /admin/properties              | GET    | Admin | pagination, status, type, listingType, search (partial title/description), sortBy, sortOrder | all listings (includes archived / soft-deleted)    |
| /admin/properties/:id/moderate | PATCH  | Admin | status                                                                                       | moderated listing                                  |
| /admin/analytics               | GET    | Admin | —                                                                                            | KPI analytics                                      |

Moderation notifies the listing owner (in-app + email).

**Dependencies:** users, properties, bookings, transactions, cache.service, notifications

---

## notifications

**Responsibility:** In-app notifications and email triggers.

| Endpoint                              | Method | Auth | Input                                                                 | Output            |
| ------------------------------------- | ------ | ---- | --------------------------------------------------------------------- | ----------------- |
| /notifications                        | GET    | User | `unread`, `type`, pagination                                          | notification list |
| /notifications/:id                    | DELETE | User | —                                                                     | deleted           |
| /notifications/:id/read               | PATCH  | User | —                                                                     | marked read       |
| /notifications/read-all               | PATCH  | User | —                                                                     | all marked read   |
| /notifications/unread-count           | GET    | User | —                                                                     | count             |

**Dependencies:** email.service

**Internal API:** Domain modules call `notificationService.notifyFromEvent(eventKey, { userId, context })` or `notifyMany()`. Lower-level `notify()` remains available. Events are defined in `notification.catalog.js` (booking, transaction, property, auth). `notify()` skips deleted/inactive users and respects `users.notificationPreferences` for in-app/email delivery. Security token emails (verify/reset) bypass preferences and are sent directly via `email.service`.

**Notification `data` shape:** `{ event, entityType, entityId?, propertyId?, status?, href }` — client uses `href` for deep links when present.
