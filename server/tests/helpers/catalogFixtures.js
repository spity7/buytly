import { PropertyTypeCatalog } from "../../src/modules/catalog/property-type.model.js";
import { AmenityCatalog } from "../../src/modules/catalog/amenity.model.js";
import { ensureCatalogIndexes } from "../../src/modules/catalog/catalog.indexes.js";
import { DEFAULT_AMENITIES } from "../../src/modules/catalog/catalog.defaults.js";
import { ensureTestSites, TEST_SITE_SLUG } from "./siteFixtures.js";
import { Site } from "../../src/modules/sites/site.model.js";

/** Types commonly used across integration tests (not production bootstrap). */
export const TEST_CATALOG_PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", sortOrder: 1 },
  { value: "villa", label: "Villa", sortOrder: 2 },
  { value: "duplex", label: "Duplex", sortOrder: 3 },
  { value: "townhouse", label: "Townhouse", sortOrder: 4 },
  { value: "land", label: "Land", sortOrder: 5 },
];

async function getBuytlySiteId() {
  await ensureTestSites();
  const site = await Site.findOne({ slug: TEST_SITE_SLUG }).lean();
  return site._id;
}

export async function ensureTestPropertyTypes(siteId = null) {
  const resolvedSiteId = siteId || (await getBuytlySiteId());
  await Promise.all(
    TEST_CATALOG_PROPERTY_TYPES.map((entry) =>
      PropertyTypeCatalog.updateOne(
        { siteId: resolvedSiteId, value: entry.value },
        {
          $setOnInsert: {
            siteId: resolvedSiteId,
            label: entry.label,
            sortOrder: entry.sortOrder,
            isActive: true,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

export async function ensureTestAmenities(siteId = null) {
  const resolvedSiteId = siteId || (await getBuytlySiteId());
  await Promise.all(
    DEFAULT_AMENITIES.map((entry) =>
      AmenityCatalog.updateOne(
        { siteId: resolvedSiteId, value: entry.value },
        {
          $setOnInsert: {
            siteId: resolvedSiteId,
            label: entry.label,
            sortOrder: entry.sortOrder,
            isActive: true,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

export async function ensureTestCatalog() {
  await ensureTestSites();
  await ensureCatalogIndexes();
  await ensureTestPropertyTypes();
  await ensureTestAmenities();
}
