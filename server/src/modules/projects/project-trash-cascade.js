import { Property } from "../properties/property.model.js";
import { buildRestoreUpdate } from "../properties/property-status.js";

/** Trash all units on a project with the same timestamp (seller + admin archive). */
export const cascadeTrashProjectUnits = async (projectId, deletedAt) => {
  await Property.updateMany(
    { projectId },
    { $set: { status: "archived", deletedAt } },
  );
};

/** Restore units trashed together with the project (matched by deletedAt). */
export const cascadeRestoreProjectUnits = async (
  projectId,
  cascadeDeletedAt,
) => {
  if (!cascadeDeletedAt) {
    return;
  }

  await Property.updateMany(
    { projectId, deletedAt: cascadeDeletedAt },
    { $set: buildRestoreUpdate() },
  );
};
