/**
 * Backfill multi-site fields on an existing single-tenant deployment.
 * Run once after deploying site-aware API: node scripts/migrate-multi-site.js
 */
import { connectDB, disconnectDB } from "../src/config/db.js";
import { siteService } from "../src/modules/sites/site.service.js";
import { Site } from "../src/modules/sites/site.model.js";
import { User } from "../src/modules/users/user.model.js";
import { Project } from "../src/modules/projects/project.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { PropertyTypeCatalog } from "../src/modules/catalog/property-type.model.js";
import { AmenityCatalog } from "../src/modules/catalog/amenity.model.js";
import { RefreshToken } from "../src/modules/auth/refreshToken.model.js";
import { Favorite } from "../src/modules/favorites/favorite.model.js";
import { Booking } from "../src/modules/bookings/booking.model.js";
import { Transaction } from "../src/modules/transactions/transaction.model.js";
import { Notification } from "../src/modules/notifications/notification.model.js";
import { PropertyReview } from "../src/modules/property-reviews/property-review.model.js";
import { PLATFORM_PERMISSIONS } from "../src/modules/sites/site.constants.js";
import { ensureCatalogIndexes } from "../src/modules/catalog/catalog.indexes.js";

async function backfillCollection(Model, siteId, label) {
  const result = await Model.updateMany(
    { $or: [{ siteId: { $exists: false } }, { siteId: null }] },
    { $set: { siteId } },
  );
  console.log(
    `${label}: matched ${result.matchedCount}, modified ${result.modifiedCount}`,
  );
}

async function grantPlatformPermissions(buytlySiteId) {
  const result = await User.updateMany(
    {
      siteId: buytlySiteId,
      role: "admin",
      deletedAt: null,
    },
    {
      $set: {
        platformPermissions: [
          PLATFORM_PERMISSIONS.CROSS_SITE_READ,
          PLATFORM_PERMISSIONS.CROSS_SITE_MODERATE,
        ],
      },
    },
  );
  console.log(
    `Platform admin permissions: matched ${result.matchedCount}, modified ${result.modifiedCount}`,
  );
}

async function run() {
  await connectDB();
  await ensureCatalogIndexes();
  await siteService.ensureDefaultSites();

  const buytly = await Site.findOne({ slug: "buytly" });
  if (!buytly) {
    throw new Error("Buytly site seed missing");
  }

  const siteId = buytly._id;

  await backfillCollection(User, siteId, "users");
  await backfillCollection(Project, siteId, "projects");
  await backfillCollection(Property, siteId, "properties");
  await backfillCollection(PropertyTypeCatalog, siteId, "property types");
  await backfillCollection(AmenityCatalog, siteId, "amenities");
  await backfillCollection(RefreshToken, siteId, "refresh tokens");
  await backfillCollection(Favorite, siteId, "favorites");
  await backfillCollection(Booking, siteId, "bookings");
  await backfillCollection(Transaction, siteId, "transactions");
  await backfillCollection(Notification, siteId, "notifications");
  await backfillCollection(PropertyReview, siteId, "reviews");

  await grantPlatformPermissions(siteId);

  console.log("Migration complete.");
  await disconnectDB();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
