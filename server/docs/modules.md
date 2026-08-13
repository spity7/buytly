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
| /users/me                    | DELETE   | User   | password                                                                              | success                |
| /users/me/preferences        | PATCH    | User   | budget, locations, types                                                              | preferences            |
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

| Endpoint                       | Method       | Auth         | Input               | Output           |
| ------------------------------ | ------------ | ------------ | ------------------- | ---------------- |
| /properties                    | GET          | Public       | filters, pagination | property list    |
| /properties/mine               | GET          | Seller/Agent | pagination, status  | user's listings  |
| /properties/:id                | GET          | Public       | —                   | property detail  |
| /properties                    | POST         | Seller/Agent | property data       | created property |
| /properties/:id                | PATCH/DELETE | Owner/Agent  | updates             | updated/deleted  |
| /properties/:id/media          | POST         | Owner/Agent  | file                | media item       |
| /properties/:id/media/:mediaId | DELETE       | Owner/Agent  | —                   | success          |

Non-admin create/update cannot publish directly: `status: "active"` is stored as `pending`. Public `GET /properties/:id` returns non-active listings only to the owner, assigned agent, or admin (optional auth).

**Dependencies:** gcs.service, image.service (via gcs upload), cache.service

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

**Responsibility:** Save/remove liked properties.

| Endpoint                     | Method   | Auth | Input      | Output             |
| ---------------------------- | -------- | ---- | ---------- | ------------------ |
| /favorites                   | GET/POST | User | propertyId | favorites list     |
| /favorites/:propertyId       | DELETE   | User | —          | success            |
| /favorites/check/:propertyId | GET      | User | —          | isFavorite boolean |

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
| /transactions/my         | GET    | User         | filters                  | user transactions   |
| /transactions/:id        | GET    | User         | —                        | transaction detail  |
| /transactions/:id/status | PATCH  | Seller/Agent | status                   | updated transaction |

**Dependencies:** properties, notifications

---

## admin

**Responsibility:** User management, listing moderation, platform analytics.

| Endpoint                       | Method | Auth  | Input    | Output            |
| ------------------------------ | ------ | ----- | -------- | ----------------- |
| /admin/users                   | GET    | Admin | filters  | user list         |
| /admin/users/:id/status        | PATCH  | Admin | isActive | updated user      |
| /admin/users/:id/role          | PATCH  | Admin | role     | updated user      |
| /admin/properties              | GET    | Admin | filters  | all listings      |
| /admin/properties/:id/moderate | PATCH  | Admin | status   | moderated listing |
| /admin/analytics               | GET    | Admin | —        | KPI analytics     |

**Dependencies:** users, properties, bookings, transactions, cache.service

---

## notifications

**Responsibility:** In-app notifications and email triggers.

| Endpoint                    | Method | Auth | Input                                                     | Output            |
| --------------------------- | ------ | ---- | --------------------------------------------------------- | ----------------- |
| /notifications              | GET    | User | `unread=true` (unread only) or `unread=false` (read only) | notification list |
| /notifications/:id/read     | PATCH  | User | —                                                         | marked read       |
| /notifications/read-all     | PATCH  | User | —                                                         | all marked read   |
| /notifications/unread-count | GET    | User | —                                                         | count             |

**Dependencies:** email.service

**Internal API:** Other modules call `notificationService.notify()` — never call email directly from controllers. `notify()` skips deleted/inactive users. `unread` query: `true` = unread only, `false` = read only, omit = all.
