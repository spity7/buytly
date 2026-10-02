import { AppError } from "../../shared/AppError.js";

/** Statuses visible on the public property list and detail endpoints. */
export const PUBLIC_LIST_STATUSES = new Set(["active", "sold"]);

export const isPublicPropertyViewStatus = (status) =>
  PUBLIC_LIST_STATUSES.has(status);

/** Public marketplace views only — not owner/agent/admin dashboard previews. */
export const shouldIncrementListingView = ({
  incrementView = true,
  status,
  canManage = false,
}) => Boolean(incrementView && status === "active" && !canManage);

/** @deprecated Use shouldIncrementListingView */
export const shouldIncrementPropertyView = shouldIncrementListingView;

/** Statuses non-admins may set on create/update (sold only when transitioning from active). */
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
 * - sold allowed on update only when current status is active
 * - archived rejected (admin only)
 * Returns undefined when status should not be changed (update without status field).
 */
export const normalizeSellerStatus = (
  status,
  { isAdmin, isCreate, currentStatus } = {},
) => {
  if (isAdmin) return status;

  if (status === undefined || status === null) {
    return isCreate ? "draft" : undefined;
  }

  if (status === "sold") {
    if (isCreate) {
      throw new AppError("You cannot create a listing as sold", 400);
    }
    if (currentStatus !== "active") {
      throw new AppError("Only published listings can be marked sold", 400);
    }
    return "sold";
  }

  if (status === "archived") {
    throw new AppError("You cannot set this status directly", 403);
  }

  if (!SELLER_SETTABLE_STATUSES.has(status)) {
    throw new AppError("You cannot set this status directly", 403);
  }

  if (status === "active" || status === "pending") {
    return "pending";
  }

  return status;
};

export const isPropertyBookable = (status) => status === "active";

export const isPropertyTerminal = (status) =>
  status === "sold" || status === "archived";

/** Fields that trigger re-review when changed on an active listing. */
const MATERIAL_SCALAR_FIELDS = [
  "title",
  "description",
  "type",
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
        gcsKey: doc.gcsKey,
      };
    }),
  );

export const hasMaterialChanges = (property, data) => {
  for (const field of MATERIAL_SCALAR_FIELDS) {
    if (data[field] === undefined) continue;
    if (data[field] !== property[field]) return true;
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
