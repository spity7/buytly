/**
 * Removes legacy auto-bootstrapped property types that are unused by listings.
 * Safe to run on production after migrating to admin-managed catalog only.
 *
 * Usage: node scripts/prune-legacy-property-types.js
 */
import { connectDB, disconnectDB } from "../src/config/db.js";
import { Property } from "../src/modules/properties/property.model.js";
import { PropertyTypeCatalog } from "../src/modules/catalog/property-type.model.js";
import { LEGACY_BOOTSTRAP_PROPERTY_TYPE_VALUES } from "../src/modules/catalog/catalog.defaults.js";

async function main() {
  await connectDB();

  let removed = 0;
  let skippedInUse = 0;

  for (const value of LEGACY_BOOTSTRAP_PROPERTY_TYPE_VALUES) {
    const inUse = await Property.countDocuments({ type: value });
    if (inUse > 0) {
      skippedInUse += 1;
      console.log(`Skip "${value}" — used by ${inUse} listing(s)`);
      continue;
    }

    const result = await PropertyTypeCatalog.deleteOne({ value });
    if (result.deletedCount) {
      removed += 1;
      console.log(`Removed unused property type "${value}"`);
    }
  }

  console.log(
    `Done. Removed ${removed} type(s); skipped ${skippedInUse} in-use type(s).`,
  );
  await disconnectDB();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
