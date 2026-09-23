import { AppError } from "../../shared/AppError.js";

const UNIT_SUBMIT_STATUSES = new Set(["pending", "active"]);

export const MIN_PUBLISH_UNITS = 1;

export const getPublishUnitRules = () => ({
  minUnits: MIN_PUBLISH_UNITS,
  maxUnits: null,
});

export const isPublishUnitCountValid = (unitCount) =>
  unitCount >= MIN_PUBLISH_UNITS;

/** Projects need at least one live unit before publish (pending/active). */
export const assertPublishUnitCardinality = (unitCount) => {
  if (unitCount < MIN_PUBLISH_UNITS) {
    throw new AppError(
      "Projects must contain at least one unit before publishing",
      400,
    );
  }
};

export const assertCanAddUnitToProject = (project) => {
  if (project?.status === "sold") {
    throw new AppError("Sold projects cannot accept new units", 400);
  }
};

/**
 * Units submitted for review (pending/active) must align with parent project state.
 * Sellers may queue units as pending under a draft project; admins may only
 * activate a unit when the parent project is already public (active/sold).
 */
export const assertParentProjectAllowsUnitRestore = (project) => {
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.deletedAt) {
    throw new AppError(
      "Restore the parent project before restoring this unit",
      400,
    );
  }
};

export const assertParentProjectAllowsUnitStatus = (
  project,
  nextStatus,
  { isAdmin = false } = {},
) => {
  if (!UNIT_SUBMIT_STATUSES.has(nextStatus)) return;

  if (!project || project.deletedAt) {
    throw new AppError("Project not found", 404);
  }

  if (project.status === "archived") {
    throw new AppError("This project is archived", 400);
  }

  if (isAdmin && nextStatus === "active") {
    if (!["active", "sold"].includes(project.status)) {
      throw new AppError(
        "Approve the parent project before publishing this unit",
        400,
      );
    }
    return;
  }

  if (!isAdmin && project.status === "sold") {
    throw new AppError("Sold projects cannot accept new published units", 400);
  }
};
