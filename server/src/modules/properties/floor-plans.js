import { deleteGcsKeys } from "../../services/listing-purge.service.js";

export const collectFloorPlanGcsKeys = (floorPlans = []) =>
  (floorPlans || []).map((plan) => plan?.gcsKey).filter(Boolean);

export const purgeFloorPlanGcsKeys = async (floorPlans = []) => {
  const keys = collectFloorPlanGcsKeys(floorPlans);
  if (!keys.length) return;
  await deleteGcsKeys(keys);
};

/** Validates and normalizes floorPlans on write. */
export const resolveFloorPlansForPropertyType = (_type, floorPlans) => {
  if (floorPlans === undefined) {
    return undefined;
  }
  return sanitizeFloorPlansForStorage(floorPlans);
};

/** Persisted/API floor plan shape (title + image gcsKey). */
export const sanitizeFloorPlanForStorage = (plan) => {
  if (!plan) return plan;
  const doc = plan?.toObject ? plan.toObject() : plan;
  const entry = {
    title: doc.title,
    gcsKey: doc.gcsKey,
  };
  if (doc._id != null) {
    entry._id = doc._id;
  }
  return entry;
};

export const sanitizeFloorPlansForStorage = (floorPlans = []) =>
  floorPlans.map(sanitizeFloorPlanForStorage);
