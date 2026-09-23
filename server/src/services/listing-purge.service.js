import { Booking } from "../modules/bookings/booking.model.js";
import { Transaction } from "../modules/transactions/transaction.model.js";
import { Favorite } from "../modules/favorites/favorite.model.js";
import { PropertyReview } from "../modules/property-reviews/property-review.model.js";
import { gcsService } from "./gcs.service.js";
import { AppError } from "../shared/AppError.js";

const OPEN_BOOKING_STATUSES = ["pending", "approved"];
const BLOCKING_TRANSACTION_STATUSES = ["pending", "approved", "completed"];

export function collectPropertyGcsKeys(property) {
  const keys = [];
  for (const item of property.media || []) {
    if (item.gcsKey) keys.push(item.gcsKey);
  }
  for (const plan of property.floorPlans || []) {
    if (plan.gcsKey) keys.push(plan.gcsKey);
  }
  return keys;
}

export function collectProjectGcsKeys(project) {
  return (project.media || []).map((item) => item.gcsKey).filter(Boolean);
}

export async function deleteGcsKeys(keys) {
  const unique = [...new Set(keys.filter(Boolean))];
  await Promise.all(
    unique.map((key) =>
      gcsService.deleteFile(key).catch(() => {
        /* best-effort */
      }),
    ),
  );
}

export async function assertPropertyHasNoDeletionBlockers(property) {
  const [openBookings, blockingTransactions] = await Promise.all([
    Booking.countDocuments({
      propertyId: property._id,
      status: { $in: OPEN_BOOKING_STATUSES },
    }),
    Transaction.countDocuments({
      propertyId: property._id,
      status: { $in: BLOCKING_TRANSACTION_STATUSES },
    }),
  ]);

  if (openBookings > 0) {
    throw new AppError(
      "This listing has open visit bookings. Resolve or cancel them before permanent deletion.",
      409,
    );
  }

  if (blockingTransactions > 0) {
    throw new AppError(
      "This listing has purchase or transaction records. Permanent deletion is not allowed.",
      409,
    );
  }
}

export async function assertPropertyPermanentlyDeletable(property) {
  if (!property.deletedAt) {
    throw new AppError(
      "Move this listing to trash before deleting it permanently.",
      400,
    );
  }

  await assertPropertyHasNoDeletionBlockers(property);
}

export async function purgePropertyRecord(property, { requireTrash = true } = {}) {
  if (requireTrash) {
    await assertPropertyPermanentlyDeletable(property);
  } else {
    await assertPropertyHasNoDeletionBlockers(property);
  }

  await deleteGcsKeys(collectPropertyGcsKeys(property));

  await Promise.all([
    Favorite.deleteMany({ propertyId: property._id }),
    PropertyReview.deleteMany({ propertyId: property._id }),
    Booking.deleteMany({ propertyId: property._id }),
    Transaction.deleteMany({
      propertyId: property._id,
      status: { $nin: BLOCKING_TRANSACTION_STATUSES },
    }),
  ]);

  await property.deleteOne();
}

export function assertProjectPermanentlyDeletable(project) {
  if (!project.deletedAt) {
    throw new AppError(
      "Move this project to trash before deleting it permanently.",
      400,
    );
  }
}
