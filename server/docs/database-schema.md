# Database Schema

## Collections Overview

| Collection           | Module           | Description                        |
| -------------------- | ---------------- | ---------------------------------- |
| users                | Users            | User accounts and profiles         |
| refreshtokens        | Auth             | JWT refresh token store            |
| projects             | Projects         | Listing projects (single/compound) |
| properties           | Properties       | Sellable units (listings)          |
| propertyreviews      | Property Reviews | Property listing reviews           |
| agentprofiles        | Agents           | Agent profile extensions           |
| favorites            | Favorites        | User saved properties              |
| bookings             | Bookings         | Visit scheduling                   |
| transactions         | Transactions     | Purchase tracking                  |
| notifications        | Notifications    | In-app notifications               |
| propertytypecatalogs | Catalog          | Admin-managed property types       |
| amenitycatalogs      | Catalog          | Admin-managed amenities            |

## users

```javascript
{
  email: String (unique among active users — partial index where deletedAt is null),
  authProvider: enum [local, google, both] (default local),
  googleId: String (partial unique where deletedAt is null and googleId is set),
  passwordHash: String (required when authProvider is local),
  role: enum [buyer, seller, agent, admin],
  firstName, lastName, phone: String,
  phoneCountryCode, phoneNumber: String (E.164 parts; `phone` kept as combined),
  avatar: { gcsKey, mimeType, size } — stored in GCS; API responses add a signed `url` at read time (not persisted).
  socialLinks: { instagram, linkedin, website },
  preferences: { budgetMin, budgetMax, locations[], propertyTypes[] },
  notificationPreferences: {
    email: { booking, transaction, property, auth, system } (default true),
    inApp: { booking, transaction, property, auth, system } (default true)
  },
  savedSearches: [{ name, filters, createdAt }],
  isActive: Boolean,
  isEmailVerified: Boolean,
  emailVerificationToken, emailVerificationExpires: String/Date,
  passwordResetToken, passwordResetExpires: String/Date,
  deletedAt: Date (soft delete),
  deletedEmail: String (original email retained for admin when soft-deleted),
  timestamps
}
```

**Indexes:** `email` (partial unique where `deletedAt` is null), `googleId` (partial unique where `deletedAt` is null), `role`, `deletedAt`

**Account deletion:** Sets `deletedAt`, clears avatar from GCS and document, anonymizes `email`, stores prior address in `deletedEmail`. Does **not** cascade to properties, bookings, transactions, reviews, or favorites — listings remain at their current status (including active/public).

## refreshtokens

```javascript
{
  userId: ObjectId → users,
  tokenHash: String (unique),
  expiresAt: Date (TTL index),
  revokedAt: Date,
  replacedByToken: String
}
```

## projects

```javascript
{
  title, slug (unique), description: String,
  kind: enum [single, compound],
  location: {
    type: Point,
    coordinates: [lng, lat],
    address, city, country
  },
  amenities: [String],
  status: enum [draft, pending, active, sold, archived],
  media: [{ gcsKey, type, order, mimeType, size }],
  virtualTourUrl: String,
  agentId: ObjectId → users,
  ownerId: ObjectId → users,
  viewCount: Number,
  deletedAt: Date,
  timestamps
}
```

**Indexes:** `location` 2dsphere; `{ kind, status }`; text on title/description

**Publish rules:** `single` → exactly 1 unit; `compound` → ≥ 1 unit (non-draft publish). Units go `pending` with the project; admin unit `active` requires parent project `active` or `sold`. **`kind` is immutable** once the project is not `draft` or has any non-trashed units.

**Trash:** Seller/agent `DELETE` sets `deletedAt` + `status: archived` and cascades the same timestamp to all non-trashed units on the project. Restore reverses the project and matching units to `draft`.

## properties

Sellable **units** under a project. All listings are for **sale** (no `listingType`).

```javascript
{
  projectId: ObjectId → projects (required),
  sortOrder: Number,
  title, slug (unique), description: String,
  type: String (catalog slug),
  price: Number (whole USD), currency: String (USD),
  location: copied from project (GeoJSON Point + address fields),
  bedrooms, bathrooms, area, areaUnit,
  amenities: [String],
  status: enum [draft, pending, active, sold, archived],
  media, floorPlans, virtualTourUrl,
  agentId, ownerId, viewCount, deletedAt, timestamps
}
```

**Indexes:** `location` 2dsphere; `price`, `type`, `status`; `{ status, price }`; `{ projectId, sortOrder }`; text on title/description

## agentprofiles

```javascript
{
  userId: ObjectId → users (unique),
  licenseNumber, agency, bio: String,
  specialties: [String],
  city: String,
  rating: Number (0-5),
  reviewCount: Number,
  isVerified: Boolean,
  timestamps
}
```

## favorites

```javascript
{
  userId: ObjectId → users,
  propertyId: ObjectId → properties,
  createdAt: Date
}
```

**Indexes:** `{ userId, propertyId }` (unique), `{ userId, createdAt }`

## propertyreviews

```javascript
{
  propertyId: ObjectId → properties,
  userId: ObjectId → users,
  rating: Number (1-5),
  title: String,
  text: String,
  timestamps
}
```

**Indexes:** `{ propertyId, userId }` (unique), `{ propertyId, createdAt }`

## bookings

```javascript
{
  propertyId: ObjectId → properties,
  buyerId: ObjectId → users,
  agentId: ObjectId → users,
  scheduledAt: Date,
  message: String,
  status: enum [pending, approved, rejected, cancelled, completed],
  agentNotes: String,
  timestamps
}
```

## transactions

```javascript
{
  propertyId: ObjectId → properties,
  buyerId, sellerId, agentId: ObjectId → users,
  type: enum [buy],
  amount: Number, currency: String,
  status: enum [pending, approved, completed, cancelled],
  notes: String,
  completedAt: Date,
  timestamps
}
```

## notifications

```javascript
{
  userId: ObjectId → users,
  type: enum [booking, transaction, property, system, auth],
  title, message: String,
  data: Mixed ({ event, entityType, entityId, propertyId, projectId, projectTitle, status, href }),
  isRead: Boolean,
  readAt: Date,
  channels: { inApp, email },
  timestamps
}
```

## propertytypecatalogs / amenitycatalogs

```javascript
{
  value: String (unique; slug for types, stored amenity string for amenities),
  label: String,
  sortOrder: Number,
  isActive: Boolean,
  timestamps
}
```

Seeded from defaults when empty on first catalog API access. The `villa` property type is always upserted as active and cannot be edited, deleted, or deactivated (required for single projects).

## Relationships

```mermaid
erDiagram
  users ||--o{ properties : owns
  users ||--o{ properties : manages
  users ||--o{ favorites : saves
  users ||--o{ bookings : requests
  users ||--o{ transactions : participates
  users ||--o{ notifications : receives
  users ||--o| agentprofiles : has
  users ||--o{ refreshtokens : has
  properties ||--o{ favorites : favorited
  properties ||--o{ bookings : scheduled
  properties ||--o{ transactions : involved
```
