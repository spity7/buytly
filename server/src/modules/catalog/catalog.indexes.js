import { AmenityCatalog } from "./amenity.model.js";
import { PropertyTypeCatalog } from "./property-type.model.js";
import { listCollectionIndexes } from "../../shared/collectionIndexes.js";

const LEGACY_VALUE_ONLY_INDEX = "value_1";

function isLegacyValueOnlyUniqueIndex(index) {
  if (index.name !== LEGACY_VALUE_ONLY_INDEX || !index.unique) return false;
  const keys = Object.keys(index.key || {});
  return keys.length === 1 && index.key.value === 1;
}

async function dropLegacyValueOnlyIndex(Model, collectionLabel) {
  const indexes = await listCollectionIndexes(Model.collection);
  const legacy = indexes.find(isLegacyValueOnlyUniqueIndex);
  if (!legacy) return;

  await Model.collection.dropIndex(LEGACY_VALUE_ONLY_INDEX);
  console.log(
    `[catalog] Dropped legacy ${collectionLabel} index "${LEGACY_VALUE_ONLY_INDEX}" (use siteId + value unique instead)`,
  );
}

/** Drop pre–multi-site unique indexes and align with Mongoose schema indexes. */
export async function ensureCatalogIndexes() {
  await dropLegacyValueOnlyIndex(AmenityCatalog, "amenitycatalogs");
  await dropLegacyValueOnlyIndex(PropertyTypeCatalog, "propertytypecatalogs");
  await AmenityCatalog.syncIndexes();
  await PropertyTypeCatalog.syncIndexes();
}
