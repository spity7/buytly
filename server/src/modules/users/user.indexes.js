import { User } from "./user.model.js";
import { listCollectionIndexes } from "../../shared/collectionIndexes.js";

function isLegacyGlobalEmailIndex(index) {
  if (!index?.unique || index.key?.siteId) return false;
  const keys = Object.keys(index.key || {});
  return keys.length === 1 && index.key.email === 1;
}

function isLegacyGlobalGoogleIdIndex(index) {
  if (!index?.unique || index.key?.siteId) return false;
  const keys = Object.keys(index.key || {});
  return keys.length === 1 && index.key.googleId === 1;
}

async function dropLegacyIndexIfPresent(collection, index, label) {
  if (!index) return;
  await collection.dropIndex(index.name);
  console.log(
    `[users] Dropped legacy ${label} index "${index.name}" (use siteId-scoped unique instead)`,
  );
}

/** Drop pre–multi-site unique indexes and align with Mongoose schema indexes. */
export async function ensureUserIndexes() {
  const collection = User.collection;
  const indexes = await listCollectionIndexes(collection);

  await dropLegacyIndexIfPresent(
    collection,
    indexes.find(isLegacyGlobalEmailIndex),
    "global email",
  );
  await dropLegacyIndexIfPresent(
    collection,
    indexes.find(isLegacyGlobalGoogleIdIndex),
    "global googleId",
  );

  await User.syncIndexes();
}
