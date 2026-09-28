import { PropertyTypeCatalog } from "../../src/modules/catalog/property-type.model.js";
import { AmenityCatalog } from "../../src/modules/catalog/amenity.model.js";
import { DEFAULT_AMENITIES } from "../../src/modules/catalog/catalog.defaults.js";

/** Types commonly used across integration tests (not production bootstrap). */
export const TEST_CATALOG_PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", sortOrder: 1 },
  { value: "villa", label: "Villa", sortOrder: 2 },
  { value: "duplex", label: "Duplex", sortOrder: 3 },
  { value: "townhouse", label: "Townhouse", sortOrder: 4 },
  { value: "land", label: "Land", sortOrder: 5 },
];

export async function ensureTestPropertyTypes() {
  await Promise.all(
    TEST_CATALOG_PROPERTY_TYPES.map((entry) =>
      PropertyTypeCatalog.updateOne(
        { value: entry.value },
        {
          $setOnInsert: {
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

export async function ensureTestAmenities() {
  await Promise.all(
    DEFAULT_AMENITIES.map((entry) =>
      AmenityCatalog.updateOne(
        { value: entry.value },
        {
          $setOnInsert: {
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
  await ensureTestPropertyTypes();
  await ensureTestAmenities();
}
