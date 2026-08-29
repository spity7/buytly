import { AppError } from "../../shared/AppError.js";
import { ROLES } from "../../shared/constants.js";

/** Statuses visible on the public property list endpoint. */
export const PUBLIC_LIST_STATUSES = new Set(["active", "sold", "rented"]);

/** Statuses non-admins may set via create/update (sold/rented come from transactions). */
export const SELLER_SETTABLE_STATUSES = new Set(["draft", "pending", "active"]);

export const resolvePublicListStatus = (requestedStatus) => {
  if (!requestedStatus) return "active";
  if (!PUBLIC_LIST_STATUSES.has(requestedStatus)) {
    throw new AppError("Invalid status filter", 400);
  }
  return requestedStatus;
};

/**
 * Normalizes status on create/update for non-admin users.
 * - active → pending (submit for review)
 * - draft / pending allowed
 * - sold / rented / archived rejected
 * Returns undefined when status should not be changed (update without status field).
 */
export const normalizeSellerStatus = (status, { isAdmin, isCreate }) => {
  if (isAdmin) return status;

  if (status === undefined || status === null) {
    return isCreate ? "draft" : undefined;
  }

  if (!SELLER_SETTABLE_STATUSES.has(status)) {
    throw new AppError(
      "You cannot set this status directly. Use transactions to mark a property sold or rented.",
      403,
    );
  }

  if (status === "active" || status === "pending") {
    return "pending";
  }

  return status;
};

export const isPropertyBookable = (status) => status === "active";

export const isPropertyTerminal = (status) =>
  status === "sold" || status === "rented" || status === "archived";

/** Fields that trigger re-review when changed on an active listing. */
const MATERIAL_SCALAR_FIELDS = [
  "title",
  "description",
  "type",
  "listingType",
  "price",
  "currency",
  "bedrooms",
  "bathrooms",
  "area",
  "areaUnit",
  "virtualTourUrl",
];

const normalizeAmenities = (items = []) => [...items].sort().join("|");

const normalizeFloorPlans = (plans = []) =>
  JSON.stringify(
    plans.map((p) => {
      const doc = p?.toObject ? p.toObject() : p;
      return {
        title: doc.title,
        area: doc.area,
        bedrooms: doc.bedrooms,
        bathrooms: doc.bathrooms,
        price: doc.price,
        gcsKey: doc.gcsKey,
      };
    }),
  );

const normalizeLocation = (location) => {
  if (!location) return null;
  const doc = location.toObject ? location.toObject() : location;
  return {
    coordinates: doc.coordinates,
    address: doc.address || "",
    city: doc.city || "",
    country: doc.country || "",
  };
};

export const hasMaterialChanges = (property, data) => {
  for (const field of MATERIAL_SCALAR_FIELDS) {
    if (data[field] === undefined) continue;
    if (data[field] !== property[field]) return true;
  }

  if (data.location !== undefined) {
    const current = normalizeLocation(property.location);
    const incoming = normalizeLocation(data.location);
    if (JSON.stringify(current) !== JSON.stringify(incoming)) return true;
  }

  if (data.amenities !== undefined) {
    if (
      normalizeAmenities(property.amenities) !==
      normalizeAmenities(data.amenities)
    ) {
      return true;
    }
  }

  if (data.floorPlans !== undefined) {
    if (
      normalizeFloorPlans(property.floorPlans) !==
      normalizeFloorPlans(data.floorPlans)
    ) {
      return true;
    }
  }

  return false;
};

export const buildArchiveUpdate = () => ({
  status: "archived",
  deletedAt: new Date(),
});

export const buildRestoreUpdate = () => ({
  status: "draft",
  deletedAt: null,
});

export const buildUnarchiveUpdate = (status) => ({
  status,
  deletedAt: null,
});
