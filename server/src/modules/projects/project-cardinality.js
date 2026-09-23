import { AppError } from "../../shared/AppError.js";

/** Unit type required for the one sellable unit on a single (standalone) project. */
export const SINGLE_PROJECT_UNIT_TYPE = "villa";

const UNIT_SUBMIT_STATUSES = new Set(["pending", "active"]);

export const getPublishUnitRules = (kind) => {
  if (kind === "single") {
    return { minUnits: 1, maxUnits: 1 };
  }
  return { minUnits: 1, maxUnits: null };
};

export const isPublishUnitCountValid = (kind, unitCount) => {
  const { minUnits, maxUnits } = getPublishUnitRules(kind);
  if (unitCount < minUnits) return false;
  if (maxUnits != null && unitCount > maxUnits) return false;
  return true;
};

/** Draft projects with no units may change kind; locked after first unit or non-draft status. */
export const assertProjectKindChange = (project, nextKind, unitCount) => {
  if (!nextKind || nextKind === project.kind) return;

  if (project.status !== "draft") {
    throw new AppError(
      "Project type can only be changed while the project is a draft",
      400,
    );
  }

  if (unitCount > 0) {
    throw new AppError(
      "Project type cannot be changed after units have been added. Remove all units first or contact support.",
      400,
    );
  }
};

/** Enforce single vs compound unit counts when publishing. */
export const assertPublishUnitCardinality = (kind, unitCount) => {
  if (kind === "single" && unitCount !== 1) {
    throw new AppError(
      "Single projects must contain exactly one unit before publishing",
      400,
    );
  }
  if (kind === "compound" && unitCount < 1) {
    throw new AppError(
      "Compound projects must contain at least one unit before publishing",
      400,
    );
  }
};

export const assertCanAddUnitToProject = (project, existingUnits) => {
  if (project?.kind === "single" && existingUnits >= 1) {
    throw new AppError("Single projects can only have one unit", 400);
  }
};

/**
 * Units submitted for review (pending/active) must align with parent project state.
 * Sellers may queue units as pending under a draft project; admins may only
 * activate a unit when the parent project is already public (active/sold).
 */
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

export const applySingleProjectUnitType = (project, payload) => {
  if (project?.kind !== "single") return;
  payload.type = SINGLE_PROJECT_UNIT_TYPE;
};

export const assertSingleProjectUnitType = (project, type) => {
  if (project?.kind !== "single") return;
  if (type !== SINGLE_PROJECT_UNIT_TYPE) {
    throw new AppError(
      `Single projects must use the ${SINGLE_PROJECT_UNIT_TYPE} unit type`,
      400,
    );
  }
};
